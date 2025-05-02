
import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { markMessagesAsRead } from '@/services/messageService';

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

  // Mark messages as read when they are displayed
  useEffect(() => {
    if (!currentUserId || messages.length === 0) return;
    
    const unreadMessageIds = messages
      .filter(msg => !msg.read && msg.senderId !== currentUserId)
      .map(msg => msg.id);
    
    if (unreadMessageIds.length > 0) {
      markMessagesAsRead(unreadMessageIds).catch(error => {
        console.error("Failed to mark messages as read:", error);
      });
    }
  }, [messages, currentUserId]);

  return (
    <div className="flex-grow overflow-y-auto scrollbar-hide p-4 pb-20 md:pb-4">
      {messages.length === 0 && (
        <div className="flex justify-center items-center h-32">
          <p className="text-muted-foreground">No messages yet. Say hello!</p>
        </div>
      )}
      
      {messages.map(msg => (
        <MessageItem 
          key={msg.id} 
          message={msg}
          isSentByMe={msg.senderId === currentUserId}
          otherUser={otherUser}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
