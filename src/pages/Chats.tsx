
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Plus, Search, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserConversations, deleteConversation } from '@/services/conversations';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageLayout from '@/components/PageLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  
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
  
  useEffect(() => {
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
  
  const handleDeleteClick = (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return;
    
    try {
      await deleteConversation(conversationToDelete);
      toast({
        title: "Conversation deleted",
        description: "The conversation has been permanently deleted.",
      });
      // Remove the deleted conversation from the state
      setConversations(conversations.filter(c => c.id !== conversationToDelete));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast({
        variant: "destructive",
        title: "Error deleting conversation",
        description: err instanceof Error ? err.message : "An error occurred while deleting the conversation.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  // Sort conversations by most recent message first
  const sortedConversations = [...conversations].sort((a, b) => {
    // If a conversation doesn't have a last message, consider it older
    if (!a.lastMessage && !b.lastMessage) return 0;
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    
    // Sort by timestamp (newer first)
    return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
  });

  // Then apply the search filter
  const filteredConversations = sortedConversations.filter(conversation => 
    conversation.otherUser.pseudonym.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-4 w-full scrollbar-hide">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
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
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conversation => (
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
                  <div className="flex flex-col items-end shrink-0">
                    <div className="text-xs text-muted-foreground mb-2">
                      {conversation.lastMessage
                        ? formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: false })
                        : ''}
                    </div>
                    <button 
                      onClick={(e) => handleDeleteClick(conversation.id, e)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
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
        
        {/* Floating create chat button for when there are messages but user wants to create a new one */}
        {!loading && !error && filteredConversations.length > 0 && (
          <div className="fixed bottom-20 md:bottom-8 right-6">
            <Button 
              onClick={handleCreateChat} 
              size="icon" 
              className="h-14 w-14 rounded-full shadow-lg"
            >
              <Plus size={24} />
            </Button>
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Chats;
