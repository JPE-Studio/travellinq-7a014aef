
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, ChevronLeft, Loader2, Search, Plus, MapPin, MessageCircle, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';
import { fetchUserConversations } from '@/services/conversationService';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const conversationsData = await fetchUserConversations();
        setConversations(conversationsData || []);
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError('Unable to load conversations');
        if (err instanceof Error && err.message !== 'No conversations found') {
          toast({
            variant: "destructive",
            title: "Error loading messages",
            description: "We couldn't load your conversations. Please try again later.",
          });
        }
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

  const handleCreateChat = () => {
    navigate('/chats/new');
  };

  const filteredConversations = conversations.filter(conversation => 
    conversation.otherUser.pseudonym.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Search header */}
      <div className="px-4 py-3 sticky top-0 z-10 bg-background border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-10 bg-muted/30 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-grow flex flex-col w-full overflow-auto pb-16">
        <div className="w-full">
          {loading ? (
            // Loading skeletons
            <div className="space-y-4 p-4">
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
            <div>
              {filteredConversations.length > 0 ? (
                filteredConversations.map(conversation => (
                  <Link 
                    to={`/chat/${conversation.id}`} 
                    key={conversation.id} 
                    className="py-4 px-4 flex items-start space-x-3 hover:bg-muted/30 border-b"
                  >
                    <div onClick={(e) => handleUserProfileClick(conversation.otherUser.id, e)}>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.otherUser.avatar} alt={conversation.otherUser.pseudonym} className="object-cover" />
                        <AvatarFallback>
                          <User className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-grow min-w-0 pt-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium">@{conversation.otherUser.pseudonym}</p>
                        <p className="text-xs text-muted-foreground">
                          {conversation.lastMessage
                            ? formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: false })
                            : ''}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.otherUser.id ? 'sehr nah' : ''}
                      </p>
                      <p className="text-sm text-foreground truncate mt-2">
                        {conversation.lastMessage 
                          ? (conversation.lastMessage.isFromCurrentUser ? 'You: ' : '') + conversation.lastMessage.content
                          : 'No messages yet'}
                      </p>
                      <div className="flex items-center mt-1">
                        <button className="text-xs text-muted-foreground flex items-center mr-4">
                          <span className="mr-1">2</span>
                        </button>
                        <button className="text-xs text-muted-foreground flex items-center">
                          übersetzen
                        </button>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-12 flex flex-col items-center px-4">
                  <p className="mb-2">No messages yet</p>
                  <p className="text-sm mb-4">Start a conversation with another traveler</p>
                  <Button onClick={handleCreateChat} className="flex items-center gap-2">
                    <Plus size={18} />
                    New Conversation
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Floating create chat button */}
          {!loading && !error && filteredConversations.length > 0 && (
            <div className="fixed bottom-20 right-6">
              <Button 
                onClick={handleCreateChat} 
                size="icon" 
                className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground"
              >
                <Plus size={24} />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around py-3 md:hidden z-50">
        <Link to="/map" className="flex flex-col items-center text-muted-foreground">
          <MapPin size={24} />
          <span className="text-xs mt-1">Umgebung</span>
        </Link>
        
        <Link to="/search" className="flex flex-col items-center text-muted-foreground">
          <Search size={24} />
          <span className="text-xs mt-1">Suche</span>
        </Link>
        
        <Link to="/chats" className="flex flex-col items-center text-primary">
          <MessageCircle size={24} />
          <span className="text-xs mt-1">Nachrichten</span>
        </Link>
        
        <Link to="/profile" className="flex flex-col items-center text-muted-foreground">
          <Settings size={24} />
          <span className="text-xs mt-1">Mehr</span>
        </Link>
      </div>
    </div>
  );
};

export default Chats;
