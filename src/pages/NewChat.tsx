
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, ChevronLeft, Loader2, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchOtherUsers } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser } from '@/types';
import { getOrCreateConversation } from '@/services/chatService';

const NewChat: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null);
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const userData = await fetchOtherUsers();
        setUsers(userData);
      } catch (err) {
        console.error('Error loading users:', err);
        toast({
          variant: "destructive",
          title: "Error loading users",
          description: "We couldn't load other travelers. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [toast]);
  
  const filteredUsers = users.filter(user => 
    user.pseudonym.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createConversation = async (otherUserId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not signed in",
        description: "Please sign in to start a conversation",
      });
      return;
    }

    try {
      setCreatingConversation(otherUserId);
      
      // Use the utility function from chatService
      const conversationId = await getOrCreateConversation(otherUserId);
      
      // Navigate to the conversation
      navigate(`/chat/${conversationId}`);
      
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create conversation. Please try again.",
      });
    } finally {
      setCreatingConversation(null);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
      {/* Full width header */}
      <Header />
      
      {/* Content area */}
      <div className="flex-grow flex flex-col w-full">
        {/* Main content */}
        <div className="max-w-3xl mx-auto px-4 py-4 w-full">
          <Link to="/chats" className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground">
            <ChevronLeft size={16} className="mr-1" />
            Back to messages
          </Link>
          
          <h1 className="text-2xl font-bold mb-4">New Conversation</h1>
          
          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search travelers..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {loading ? (
            // Loading skeletons
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between space-x-3 py-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? "No travelers found matching your search" : "No other travelers found"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map(otherUser => (
                <div 
                  key={otherUser.id} 
                  className="py-3 flex items-center justify-between hover:bg-muted/30 rounded-lg px-2"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser.avatar} alt={otherUser.pseudonym} className="object-cover" />
                      <AvatarFallback>
                        <User className="h-6 w-6 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{otherUser.pseudonym}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {otherUser.location || "No location set"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => createConversation(otherUser.id)}
                    disabled={creatingConversation === otherUser.id}
                  >
                    {creatingConversation === otherUser.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Message
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChat;

// Helper component for loading state
const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-muted animate-pulse rounded ${className}`}></div>
);
