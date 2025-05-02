
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';

interface ChatErrorProps {
  error: string | null;
}

const ChatError: React.FC<ChatErrorProps> = ({ error }) => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
      <div className="bg-background border-b sticky top-0 z-10 flex items-center px-4 py-3">
        <Link to="/chats" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <p className="font-medium">Error</p>
        </div>
      </div>
      <div className="flex-grow flex justify-center items-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">Conversation Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "This conversation could not be loaded."}</p>
          <Link to="/chats" className="text-primary hover:underline">
            Return to Messages
          </Link>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default ChatError;
