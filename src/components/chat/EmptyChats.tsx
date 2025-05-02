
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyChatsProps {
  onCreateChat: () => void;
}

const EmptyChats: React.FC<EmptyChatsProps> = ({ onCreateChat }) => {
  return (
    <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
      <p className="mb-2">No messages yet</p>
      <p className="text-sm mb-4">Start a conversation with another traveler</p>
      <Button onClick={onCreateChat} className="flex items-center gap-2">
        <Plus size={18} />
        New Conversation
      </Button>
    </div>
  );
};

export default EmptyChats;
