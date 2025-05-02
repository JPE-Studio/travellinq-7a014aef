
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    
    try {
      setSending(true);
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again later."
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-background border-t sticky bottom-0 left-0 right-0 p-4 flex items-center gap-2 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 mb-16 md:mb-0"
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow"
        disabled={sending}
      />
      <Button 
        type="submit" 
        size="icon" 
        variant={message.trim() ? "default" : "ghost"} 
        disabled={!message.trim() || sending}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageInput;
