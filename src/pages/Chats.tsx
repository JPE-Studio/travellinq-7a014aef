
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

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
  
  const handleChatClick = (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    // Add forceHideBadge parameter to clear notification badge
    navigate(`/chat/${conversationId}?forceHideBadge=true`);
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
              <div className="divide-y">
                {conversations.map(conversation => (
                  <a 
                    href={`/chat/${conversation.id}?forceHideBadge=true`} 
                    key={conversation.id}
                    onClick={(e) => handleChatClick(conversation.id, e)}
                    className="flex items-center p-4 hover:bg-muted transition-colors"
                  >
                    <div 
                      className="flex-shrink-0 cursor-pointer"
                      onClick={(e) => handleUserProfileClick(conversation.otherUser?.id, e)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={conversation.otherUser.avatar} 
                          alt={conversation.otherUser.pseudonym}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          <User className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="ml-4 flex-grow overflow-hidden">
                      <div className="flex justify-between">
                        <h3 className="font-medium truncate">{conversation.otherUser.pseudonym}</h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {/* Time formatting */}
                          </span>
                        )}
                      </div>
                      
                      {conversation.lastMessage ? (
                        <div className="flex items-center">
                          <p className={`text-sm truncate ${!conversation.lastMessage.read && !conversation.lastMessage.isFromCurrentUser ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                            {conversation.lastMessage.isFromCurrentUser && "You: "}
                            {conversation.lastMessage.content}
                          </p>
                          
                          {!conversation.lastMessage.read && !conversation.lastMessage.isFromCurrentUser && (
                            <span className="ml-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      className="ml-2 flex-shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDeleteClick(conversation.id, e)}
                    >
                      {/* Delete icon */}
                    </button>
                  </a>
                ))}
              </div>
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
