
import React from 'react';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { mockUsers } from '@/data/mockData';
import { Link } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';

const Chats: React.FC = () => {
  // Exclude current user from mock chats
  const chatUsers = mockUsers.filter(user => user.id !== 'user-1');
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0 overflow-hidden">
      {/* Full width header */}
      <Header />
      
      {/* Content area */}
      <div className="flex-grow flex flex-col w-full overflow-hidden">
        {/* Main content */}
        <div className="max-w-3xl mx-auto px-4 py-4 w-full scrollbar-hide pb-safe">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          
          <div className="divide-y">
            {chatUsers.map(user => (
              <Link 
                to={`/chat/${user.id}`} 
                key={user.id} 
                className="py-3 flex items-center space-x-3 hover:bg-muted/30 cursor-pointer rounded-lg px-2"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.pseudonym} className="object-cover" />
                  <AvatarFallback>
                    <User className="h-6 w-6 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0">
                  <p className="font-medium">{user.pseudonym}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.id === "user-2" 
                      ? "Thanks for the recommendation! I'll check it out."
                      : "Hey there! Are you still in Portland area?"}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {user.id === "user-2" ? "2h ago" : "1d ago"}
                </div>
              </Link>
            ))}
          </div>
          
          {chatUsers.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p>No messages yet</p>
              <p className="text-sm">Connect with other travelers to start chatting</p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Chats;
