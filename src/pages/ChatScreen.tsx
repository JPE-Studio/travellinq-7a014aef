
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { fetchConversation, sendMessage } from '@/services/chatService';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

const ChatScreen: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !userId) return;
    
    try {
      const newMessage = await sendMessage(userId, message.trim());
      
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
      
      setMessage('');
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
    return (
      <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
        {/* Chat header skeleton */}
        <div className="bg-background border-b sticky top-0 z-10 flex items-center px-4 py-2">
          <Link to="/chats" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center flex-1">
            <Skeleton className="h-8 w-8 rounded-full mr-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        {/* Message skeletons */}
        <div className="flex-grow p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex mb-4 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <Skeleton className={`h-10 w-48 rounded-xl ${i % 2 === 0 ? 'ml-12' : 'mr-12'}`} />
            </div>
          ))}
        </div>
        
        {/* Input skeleton */}
        <div className="bg-background border-t sticky bottom-0 left-0 right-0 p-4 flex items-center gap-2 mb-16 md:mb-0">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

  if (error || !otherUser) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
        <div className="bg-background border-b sticky top-0 z-10 flex items-center px-4 py-2">
          <Link to="/chats" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <p className="font-medium">Error</p>
          </div>
        </div>
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-4">Conversation Not Found</h1>
            <p className="text-muted-foreground mb-4">{error || "This conversation could not be loaded."}</p>
            <Link to="/chats" className="text-primary hover:underline">
              Return to Messages
            </Link>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
      {/* Custom chat header */}
      <div className="bg-background border-b sticky top-0 z-10 flex items-center px-4 py-2">
        <Link to="/chats" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div 
          className="flex items-center flex-1 cursor-pointer" 
          onClick={handleUserProfileClick}
        >
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={otherUser.avatar} alt={otherUser.pseudonym} className="object-cover" />
            <AvatarFallback>
              <User className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <p className="font-medium">{otherUser.pseudonym}</p>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-grow overflow-y-auto scrollbar-hide p-4 pb-20 md:pb-4">
        {messages.length === 0 && (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">No messages yet. Say hello!</p>
          </div>
        )}
        
        {messages.map(msg => {
          const isSentByMe = msg.senderId === currentUserId;
          
          return (
            <div 
              key={msg.id} 
              className={`flex mb-4 ${isSentByMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isSentByMe && (
                <Avatar className="h-8 w-8 mr-2 self-end">
                  <AvatarImage src={otherUser.avatar} alt={otherUser.pseudonym} className="object-cover" />
                  <AvatarFallback>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[75%] rounded-xl px-4 py-2 ${
                  isSentByMe 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-muted rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${isSentByMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {isSentByMe && (
                <Avatar className="h-8 w-8 ml-2 self-end">
                  <AvatarFallback>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form 
        onSubmit={handleSendMessage} 
        className="bg-background border-t sticky bottom-0 left-0 right-0 p-4 flex items-center gap-2 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 mb-16 md:mb-0"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow"
        />
        <Button type="submit" size="icon" variant={message.trim() ? "default" : "ghost"} disabled={!message.trim()}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
      
      <BottomNavigation />
    </div>
  );
};

export default ChatScreen;
