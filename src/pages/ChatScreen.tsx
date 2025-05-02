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

    // Set up real-time subscription for new messages
    const messageSubscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${userId}`
      }, (payload) => {
        const newMessage = payload.new as any;
        console.log("New message received:", newMessage);
        
        // Avoid duplicates by checking if we already have this message
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
          if (messageExists) return prevMessages;
          
          return [
            ...prevMessages, 
            {
              id: newMessage.id,
              senderId: newMessage.sender_id,
              text: newMessage.content,
              timestamp: new Date(newMessage.created_at),
              read: newMessage.read
            }
          ];
        });

        // Mark the message as read if it's not from the current user
        if (currentUserId && newMessage.sender_id !== currentUserId) {
          supabase
            .from('messages')
            .update({ read: true })
            .eq('id', newMessage.id)
            .then(({ error }) => {
              if (error) console.error("Error marking message as read:", error);
            });
        }
      })
      .subscribe();

    // Clean up subscription on component unmount
    return () => {
      console.log("Cleaning up message subscription");
      supabase.removeChannel(messageSubscription);
    };
  }, [userId, navigate, user, currentUserId, toast]);

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

export default ChatScreen;
