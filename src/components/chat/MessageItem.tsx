
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface MessageItemProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    read: boolean;
  };
  isSentByMe: boolean;
  otherUser: {
    avatar?: string;
    pseudonym: string;
  };
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isSentByMe, otherUser }) => {
  return (
    <div 
      className={`flex mb-4 ${isSentByMe ? 'justify-end' : 'justify-start'}`}
    >
      {!isSentByMe && (
        <Avatar className="h-8 w-8 mr-2 self-end">
          <AvatarImage src={otherUser.avatar} alt={otherUser.pseudonym} className="object-cover" />
          <AvatarFallback>
            <User className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={`max-w-[75%] rounded-xl px-4 py-2 ${
          isSentByMe 
            ? 'bg-primary text-primary-foreground rounded-br-none' 
            : 'bg-muted rounded-bl-none'
        }`}
      >
        <p>{message.text}</p>
        <p className={`text-xs mt-1 ${isSentByMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      {isSentByMe && (
        <Avatar className="h-8 w-8 ml-2 self-end">
          <AvatarFallback>
            <User className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageItem;
