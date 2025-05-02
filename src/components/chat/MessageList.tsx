
import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
  otherUser: {
    avatar?: string;
    pseudonym: string;
  };
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, otherUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const date = message.timestamp.toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex-grow overflow-y-auto scrollbar-hide p-4 pb-20 md:pb-4">
      {messages.length === 0 && (
        <div className="flex justify-center items-center h-32">
          <p className="text-muted-foreground">No messages yet. Say hello!</p>
        </div>
      )}
      
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="mb-4">
          <div className="flex justify-center mb-4">
            <span className="text-xs py-1 px-3 bg-muted/50 rounded-full text-muted-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
          
          {dateMessages.map(msg => (
            <MessageItem 
              key={msg.id} 
              message={msg}
              isSentByMe={msg.senderId === currentUserId}
              otherUser={otherUser}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
