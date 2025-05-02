
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateChatButtonProps {
  onClick: () => void;
}

const CreateChatButton: React.FC<CreateChatButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-20 md:bottom-8 right-6">
      <Button 
        onClick={onClick} 
        size="icon" 
        className="h-14 w-14 rounded-full shadow-lg"
      >
        <Plus size={24} />
      </Button>
    </div>
  );
};

export default CreateChatButton;
