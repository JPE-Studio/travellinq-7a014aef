
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';
import { fetchUserConversations } from '@/services/chatService';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationPreview {
  id: string;
  otherUser: {
    id?: string;
    pseudonym: string;
    avatar?: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isFromCurrentUser: boolean;
    read: boolean;
  } | null;
}

const Chats: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const conversationsData = await fetchUserConversations();
        setConversations(conversationsData);
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError('Failed to load conversations. Please try again.');
        toast({
          variant: "destructive",
          title: "Error loading messages",
          description: "We couldn't load your conversations. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
  }, [toast]);
  
  const handleUserProfileClick = (userId: string | undefined, e: React.MouseEvent) => {
    if (!userId) return;
    
    e.preventDefault();
    e.stopPropagation();
    navigate(`/user/${userId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0 overflow-hidden">
      {/* Full width header */}
      <Header />
      
      {/* Content area */}
      <div className="flex-grow flex flex-col w-full overflow-hidden">
        {/* Main content */}
        <div className="max-w-3xl mx-auto px-4 py-4 w-full scrollbar-hide pb-safe">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          
          {loading ? (
            // Loading skeletons
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-3 py-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-grow">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-primary mt-2 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map(conversation => (
                <Link 
                  to={`/chat/${conversation.id}`} 
                  key={conversation.id} 
                  className="py-3 flex items-center space-x-3 hover:bg-muted/30 cursor-pointer rounded-lg px-2"
                >
                  <div onClick={(e) => handleUserProfileClick(conversation.otherUser.id, e)}>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.otherUser.avatar} alt={conversation.otherUser.pseudonym} className="object-cover" />
                      <AvatarFallback>
                        <User className="h-6 w-6 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-medium">{conversation.otherUser.pseudonym}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage 
                        ? (conversation.lastMessage.isFromCurrentUser ? 'You: ' : '') + conversation.lastMessage.content
                        : 'No messages yet'}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {conversation.lastMessage
                      ? formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: false })
                      : ''}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {!loading && !error && conversations.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p>No messages yet</p>
              <p className="text-sm">Connect with other travelers to start chatting</p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Chats;
