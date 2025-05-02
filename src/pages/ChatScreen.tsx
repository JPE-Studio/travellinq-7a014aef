import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { fetchConversation } from '@/services/conversationService';
import { sendMessage } from '@/services/messageService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';

// Import custom components
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageTextarea from '@/components/chat/MessageTextarea';
import ChatSkeleton from '@/components/chat/ChatError';
import ChatError from '@/components/chat/ChatError';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

const ChatScreen: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
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
        
        console.log("Loading conversation:", userId);
        const data = await fetchConversation(userId);
        console.log("Conversation loaded:", data);
        
        setMessages(data.messages);
        setOtherUser(data.otherUser);
        setCurrentUserId(data.currentUserId);
        
        // Set up real-time subscription for new messages
        const unsubscribe = setupChatSubscription(userId, (newMessage) => {
          console.log("Real-time message received:", newMessage);
          const formattedMessage = {
            id: newMessage.id,
            senderId: newMessage.sender_id,
            text: newMessage.content,
            timestamp: new Date(newMessage.created_at),
            read: newMessage.read
          };
          
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
  }, [userId, navigate, user, toast]);

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!userId || !message.trim()) return;
    
    try {
      console.log("Sending message to conversation:", userId);
      await sendMessage(userId, message);
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
      navigate(`/user/${otherUser.id}`);
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

// Helper function for setting up chat subscriptions
const setupChatSubscription = (conversationId: string, onNewMessage: (message: any) => void) => {
  const channel = supabase
    .channel('messages-channel-' + conversationId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      console.log("New message received:", payload);
      onNewMessage(payload.new);
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};

export default ChatScreen;
