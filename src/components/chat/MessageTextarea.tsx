
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface MessageTextareaProps {
  onSendMessage: (message: string) => Promise<void>;
}

const MessageTextarea: React.FC<MessageTextareaProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    
    try {
      setSending(true);
      await onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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
  
  // Handle textarea auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    };
    
    textarea.addEventListener('input', adjustHeight);
    adjustHeight();
    
    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, []);

  // Handle Ctrl+Enter or Cmd+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-background border-t sticky bottom-0 left-0 right-0 p-4 flex items-end gap-2 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 mb-16 md:mb-0"
    >
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-grow min-h-[40px] max-h-[150px] resize-none py-2"
        disabled={sending}
      />
      <Button 
        type="submit" 
        size="icon" 
        className="h-10 w-10"
        variant={message.trim() ? "default" : "ghost"} 
        disabled={!message.trim() || sending}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageTextarea;
