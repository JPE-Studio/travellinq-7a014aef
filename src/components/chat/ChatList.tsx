
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ConversationPreview } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  conversations: ConversationPreview[];
  onUserProfileClick: (userId: string | undefined, e: React.MouseEvent) => void;
  onDeleteClick: (conversationId: string, e: React.MouseEvent) => void;
}

const ChatList: React.FC<ChatListProps> = ({ 
  conversations, 
  onUserProfileClick,
  onDeleteClick
}) => {
  return (
    <div className="divide-y">
      {conversations.map(conversation => (
        <Link 
          to={`/chat/${conversation.id}`} 
          key={conversation.id}
          className="flex items-center p-4 hover:bg-muted transition-colors"
        >
          <div 
            className="flex-shrink-0 cursor-pointer"
            onClick={(e) => onUserProfileClick(conversation.otherUser?.id, e)}
          >
            <Avatar className="h-12 w-12">
              {conversation.otherUser.avatar && (
                <img 
                  src={conversation.otherUser.avatar} 
                  alt={conversation.otherUser.pseudonym}
                  className="object-cover"
                />
              )}
            </Avatar>
          </div>
          
          <div className="ml-4 flex-grow overflow-hidden">
            <div className="flex justify-between">
              <h3 className="font-medium truncate">{conversation.otherUser.pseudonym}</h3>
              {conversation.lastMessage && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
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
          
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 flex-shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => onDeleteClick(conversation.id, e)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </Link>
      ))}
    </div>
  );
};

export default ChatList;
