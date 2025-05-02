
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, ArrowLeft, MoreHorizontal } from 'lucide-react';

interface ChatHeaderProps {
  otherUser: {
    id: string;
    pseudonym: string;
    avatar?: string;
  };
  onUserProfileClick: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ otherUser, onUserProfileClick }) => {
  return (
    <div className="bg-background border-b sticky top-0 z-10 flex items-center px-4 py-3">
      <Link to="/chats" className="mr-3">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div 
        className="flex items-center flex-1 cursor-pointer" 
        onClick={onUserProfileClick}
      >
        <Avatar className="h-9 w-9 mr-3">
          <AvatarImage src={otherUser.avatar} alt={otherUser.pseudonym} className="object-cover" />
          <AvatarFallback>
            <User className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">@{otherUser.pseudonym}</p>
          <p className="text-xs text-muted-foreground">sehr nah</p>
        </div>
      </div>
      <button className="text-muted-foreground p-1">
        <MoreHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ChatHeader;
