
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, ArrowLeft, Send } from 'lucide-react';
import { mockUsers } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import BottomNavigation from '@/components/BottomNavigation';

// Interface for a chat message
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
}

const ChatScreen: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find the user from mock data
  const user = mockUsers.find(user => user.id === userId);
  const currentUser = mockUsers.find(user => user.id === 'user-1');
  
  // Generate some mock messages
  useEffect(() => {
    if (!user) return;
    
    // Create mock conversation
    const mockConversation: Message[] = [
      {
        id: '1',
        senderId: userId as string,
        receiverId: 'user-1',
        text: "Hey there! How's your trip going?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        id: '2',
        senderId: 'user-1',
        receiverId: userId as string,
        text: "Pretty good! Just arrived in Portland. Any recommendations?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
      },
      {
        id: '3',
        senderId: userId as string,
        receiverId: 'user-1',
        text: "Definitely check out Forest Park and Powell's Books!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
      }
    ];
    
    // For user-2, add one more message
    if (userId === 'user-2') {
      mockConversation.push({
        id: '4',
        senderId: userId,
        receiverId: 'user-1',
        text: "Thanks for the recommendation! I'll check it out.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      });
    }
    
    setMessages(mockConversation);
  }, [userId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;
    
    // Create a new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'user-1',
      receiverId: userId as string,
      text: message,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Show toast for demo purposes
    toast({
      title: "Message sent",
      description: `Your message to ${user.pseudonym} has been sent.`,
    });
  };

  if (!user || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <Link to="/chats" className="text-primary hover:underline">
              Return to Messages
            </Link>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
      {/* Custom chat header */}
      <div className="bg-background border-b sticky top-0 z-10 flex items-center px-4 py-2">
        <Link to="/chats" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={user.avatar} alt={user.pseudonym} className="object-cover" />
          <AvatarFallback>
            <User className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{user.pseudonym}</p>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-grow overflow-y-auto scrollbar-hide p-4 pb-20 md:pb-4">
        {messages.map(msg => {
          const isSentByMe = msg.senderId === 'user-1';
          
          return (
            <div 
              key={msg.id} 
              className={`flex mb-4 ${isSentByMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isSentByMe && (
                <Avatar className="h-8 w-8 mr-2 self-end">
                  <AvatarImage src={user.avatar} alt={user.pseudonym} className="object-cover" />
                  <AvatarFallback>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[75%] rounded-xl px-4 py-2 ${
                  isSentByMe 
                    ? 'bg-forest text-white rounded-br-none' 
                    : 'bg-muted rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${isSentByMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {isSentByMe && (
                <Avatar className="h-8 w-8 ml-2 self-end">
                  <AvatarImage src={currentUser.avatar} alt="You" className="object-cover" />
                  <AvatarFallback>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form 
        onSubmit={handleSendMessage} 
        className="bg-background border-t sticky bottom-0 left-0 right-0 p-4 flex items-center gap-2 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 mb-16 md:mb-0"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow"
        />
        <Button type="submit" size="icon" variant="ghost">
          <Send className="h-5 w-5" />
        </Button>
      </form>
      
      <BottomNavigation />
    </div>
  );
};

export default ChatScreen;
