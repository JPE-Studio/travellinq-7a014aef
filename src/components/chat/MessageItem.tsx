
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
        <Avatar className="h-9 w-9 mr-2 self-end">
          <AvatarImage src={otherUser.avatar} alt={otherUser.pseudonym} className="object-cover" />
          <AvatarFallback>
            <User className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isSentByMe 
            ? 'bg-primary text-primary-foreground rounded-br-sm' 
            : 'bg-muted/60 rounded-bl-sm'
        }`}
      >
        <p>{message.text}</p>
        <div className="flex justify-between items-center mt-1">
          <p className={`text-xs ${isSentByMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          
          {/* Translation option */}
          {!isSentByMe && (
            <button className="text-xs text-muted-foreground ml-4 hover:underline">
              übersetzen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
