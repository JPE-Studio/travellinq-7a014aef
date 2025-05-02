
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SearchBar from '@/components/chat/SearchBar';
import ChatList from '@/components/chat/ChatList';
import EmptyChats from '@/components/chat/EmptyChats';
import LoadingState from '@/components/chat/LoadingState';
import ErrorState from '@/components/chat/ErrorState';
import CreateChatButton from '@/components/chat/CreateChatButton';
import DeleteDialog from '@/components/chat/DeleteDialog';
import { useChats } from '@/hooks/useChats';

const Chats: React.FC = () => {
  const navigate = useNavigate();
  const { 
    conversations,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteClick,
    handleDeleteConfirm,
    loadConversations
  } = useChats();
  
  const handleUserProfileClick = (userId: string | undefined, e: React.MouseEvent) => {
    if (!userId) return;
    
    e.preventDefault();
    e.stopPropagation();
    navigate(`/user/${userId}`);
  };

  const handleCreateChat = () => {
    navigate('/chats/new');
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-4 w-full scrollbar-hide">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={() => window.location.reload()} />
        ) : (
          <div className="divide-y">
            {conversations.length > 0 ? (
              <ChatList 
                conversations={conversations} 
                onUserProfileClick={handleUserProfileClick} 
                onDeleteClick={handleDeleteClick} 
              />
            ) : (
              <EmptyChats onCreateChat={handleCreateChat} />
            )}
          </div>
        )}
        
        {!loading && !error && conversations.length > 0 && (
          <CreateChatButton onClick={handleCreateChat} />
        )}
      </div>
      
      <DeleteDialog 
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
};

export default Chats;
