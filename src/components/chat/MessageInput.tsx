
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-background border-t sticky bottom-0 left-0 right-0 p-3 flex items-center gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] mb-16 md:mb-0"
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow rounded-full bg-muted/30"
      />
      <Button 
        type="submit" 
        size="icon" 
        className="rounded-full" 
        variant={message.trim() ? "default" : "ghost"} 
        disabled={!message.trim()}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageInput;
