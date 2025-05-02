
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ConversationPreview } from '@/types/chat';

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
  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="divide-y">
      {conversations.map(conversation => (
        <Link 
          to={`/chat/${conversation.id}`} 
          key={conversation.id} 
          className="py-3 flex items-center space-x-3 hover:bg-muted/30 cursor-pointer rounded-lg px-2"
        >
          <div onClick={(e) => onUserProfileClick(conversation.otherUser.id, e)}>
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
              onClick={(e) => onDeleteClick(conversation.id, e)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ChatList;
