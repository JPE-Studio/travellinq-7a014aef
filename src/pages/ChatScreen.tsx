
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { fetchConversation } from '@/services/conversationService';
import { sendMessage } from '@/services/messageService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Import custom components
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
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

  useEffect(() => {
    if (!userId) return;
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadConversation = async () => {
      try {
        setLoading(true);
        const data = await fetchConversation(userId);
        setMessages(data.messages);
        setOtherUser(data.otherUser);
        setCurrentUserId(data.currentUserId);
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation. Please try again.');
        toast({
          variant: "destructive",
          title: "Error loading conversation",
          description: "We couldn't load this conversation. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConversation();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${userId}`
      }, (payload) => {
        const newMessage = payload.new as any;
        // Only add the message if it's not from the current user (to avoid duplicates)
        if (newMessage.sender_id !== currentUserId) {
          setMessages(prevMessages => [
            ...prevMessages, 
            {
              id: newMessage.id,
              senderId: newMessage.sender_id,
              text: newMessage.content,
              timestamp: new Date(newMessage.created_at),
              read: newMessage.read
            }
          ]);

          // Mark the message as read
          supabase
            .from('messages')
            .update({ read: true })
            .eq('id', newMessage.id)
            .then();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, navigate, user, currentUserId]);

  const handleSendMessage = async (message: string) => {
    if (!userId) return;
    
    try {
      const newMessage = await sendMessage(userId, message);
      
      // Add the message to the local state
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: newMessage.id,
          senderId: newMessage.sender_id,
          text: newMessage.content,
          timestamp: new Date(newMessage.created_at),
          read: newMessage.read
        }
      ]);
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Your message couldn't be sent. Please try again.",
      });
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
    return <ChatError error={error} />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
      <ChatHeader otherUser={otherUser} onUserProfileClick={handleUserProfileClick} />
      
      <MessageList 
        messages={messages} 
        currentUserId={currentUserId} 
        otherUser={otherUser} 
      />
      
      <MessageInput onSendMessage={handleSendMessage} />
      
      <BottomNavigation />
    </div>
  );
};

export default ChatScreen;
