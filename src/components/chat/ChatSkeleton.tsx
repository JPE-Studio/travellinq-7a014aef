
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNavigation from '@/components/BottomNavigation';

const ChatSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
      {/* Chat header skeleton */}
      <div className="bg-background border-b sticky top-0 z-10 flex items-center px-4 py-2">
        <Link to="/chats" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center flex-1">
          <Skeleton className="h-8 w-8 rounded-full mr-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      {/* Message skeletons */}
      <div className="flex-grow p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex mb-4 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <Skeleton className={`h-10 w-48 rounded-xl ${i % 2 === 0 ? 'ml-12' : 'mr-12'}`} />
          </div>
        ))}
      </div>
      
      {/* Input skeleton */}
      <div className="bg-background border-t sticky bottom-0 left-0 right-0 p-4 flex items-center gap-2 mb-16 md:mb-0">
        <Skeleton className="h-10 flex-grow" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ChatSkeleton;
