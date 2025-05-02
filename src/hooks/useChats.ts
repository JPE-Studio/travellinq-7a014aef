
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchUserConversations, deleteConversation } from '@/services/conversations';
import { ConversationPreview } from '@/types/chat';

export const useChats = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
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
  }, [toast]);

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

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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

  return {
    conversations: filteredConversations,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    deleteDialogOpen, 
    setDeleteDialogOpen,
    conversationToDelete,
    handleDeleteClick,
    handleDeleteConfirm,
    loadConversations
  };
};
