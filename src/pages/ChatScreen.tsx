
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { fetchConversation } from '@/services/conversationService';
import { sendMessage } from '@/services/messageService';
import { setupChatSubscription } from '@/services/chatService';
import { createMessageNotification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';

// Import custom components
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageTextarea from '@/components/chat/MessageTextarea';
import ChatSkeleton from '@/components/chat/ChatSkeleton';
import ChatError from '@/components/chat/ChatError';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

const ChatScreen: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!conversationId) {
      setError("No conversation ID provided");
      setLoading(false);
      return;
    }
    
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    const loadConversation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Loading conversation:", conversationId);
        const data = await fetchConversation(conversationId);
        console.log("Conversation loaded:", data);
        
        setMessages(data.messages);
        setOtherUser(data.otherUser);
        setCurrentUserId(data.currentUserId);
        
        // Set up real-time subscription for new messages
        const unsubscribe = setupChatSubscription(conversationId, (newMessage) => {
          console.log("Real-time message received:", newMessage);
          const formattedMessage = {
            id: newMessage.id,
            senderId: newMessage.sender_id,
            text: newMessage.content,
            timestamp: new Date(newMessage.created_at),
            read: newMessage.read
          };
          
          // Create a notification for the message if it's not from the current user
          if (formattedMessage.senderId !== data.currentUserId && otherUser?.id) {
            // Truncate message for notification preview if too long
            const messagePreview = formattedMessage.text.length > 30 
              ? `${formattedMessage.text.substring(0, 30)}...` 
              : formattedMessage.text;
              
            createMessageNotification(
              formattedMessage.senderId,
              data.currentUserId,
              conversationId,
              messagePreview
            ).catch(err => {
              console.error("Error creating message notification:", err);
            });
          }
          
          setMessages(prevMessages => {
            // Check if we already have this message to avoid duplicates
            if (prevMessages.some(msg => msg.id === formattedMessage.id)) {
              return prevMessages;
            }
            return [...prevMessages, formattedMessage];
          });
        });
        
        // Clean up subscription on unmount
        return () => {
          unsubscribe();
        };
        
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversation');
        toast({
          variant: "destructive",
          title: "Error loading conversation",
          description: err instanceof Error ? err.message : "We couldn't load this conversation. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, navigate, user, toast]);

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!conversationId || !message.trim()) return;
    
    try {
      console.log("Sending message to conversation:", conversationId);
      await sendMessage(conversationId, message);
      // Message will be added via the subscription
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Your message couldn't be sent. Please try again.",
      });
      throw err;
    }
  };
  
  const handleUserProfileClick = () => {
    if (otherUser?.id) {
      navigate(`/users/${otherUser.id}`);
    }
  };

  if (loading) {
    return <ChatSkeleton />;
  }

  if (error || !otherUser) {
    return <ChatError error={error || "Could not find conversation"} />;
  }

  return (
    <PageLayout showHeader={false}>
      <ChatHeader otherUser={otherUser} onUserProfileClick={handleUserProfileClick} />
      
      <MessageList 
        messages={messages} 
        currentUserId={currentUserId} 
        otherUser={otherUser} 
      />
      
      <MessageTextarea onSendMessage={handleSendMessage} />
    </PageLayout>
  );
};

export default ChatScreen;
