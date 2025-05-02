
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { connectWithBuddy, disconnectBuddy } from '@/services/chatService';
import { getOrCreateConversation } from '@/services/participantService';
import { useNavigate } from 'react-router-dom';
import { BuddyConnection } from '@/types';

interface UserActionsSectionProps {
  userId: string;
  isCurrentUser: boolean;
  userData: { id: string; pseudonym: string };
  buddyConnection: BuddyConnection | null;
  setBuddyConnection: (connection: BuddyConnection | null) => void;
}

const UserActionsSection: React.FC<UserActionsSectionProps> = ({
  userId,
  isCurrentUser,
  userData,
  buddyConnection,
  setBuddyConnection
}) => {
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMessageUser = async () => {
    if (!userData) return;
    
    try {
      setMessagingLoading(true);
      const conversationId = await getOrCreateConversation(userData.id);
      console.log("Conversation created/found:", conversationId);
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create conversation. Please try again.",
      });
    } finally {
      setMessagingLoading(false);
    }
  };

  const handleConnectWithBuddy = async () => {
    if (!userData) return;
    
    try {
      setConnectLoading(true);
      const connection = await connectWithBuddy(userData.id);
      setBuddyConnection(connection);
      toast({
        title: "Connected!",
        description: `You are now connected with ${userData.pseudonym} as buddies.`,
      });
    } catch (error) {
      console.error('Error connecting with buddy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect. Please try again.",
      });
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnectBuddy = async () => {
    if (!userData) return;
    
    try {
      setConnectLoading(true);
      await disconnectBuddy(userData.id);
      setBuddyConnection(null);
      toast({
        title: "Disconnected",
        description: `You are no longer connected with ${userData.pseudonym} as buddies.`,
      });
    } catch (error) {
      console.error('Error disconnecting buddy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disconnect. Please try again.",
      });
    } finally {
      setConnectLoading(false);
    }
  };

  if (isCurrentUser) return null;
  
  return (
    <div className="space-y-2 mt-4">
      <Button 
        onClick={handleMessageUser} 
        disabled={messagingLoading}
        className="w-full"
      >
        {messagingLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : null}
        Message
      </Button>
      
      {buddyConnection ? (
        <Button 
          onClick={handleDisconnectBuddy} 
          variant="outline" 
          className="w-full"
          disabled={connectLoading}
        >
          {connectLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : null}
          Disconnect Buddy
        </Button>
      ) : (
        <Button 
          onClick={handleConnectWithBuddy}
          variant="secondary"
          className="w-full"
          disabled={connectLoading}
        >
          {connectLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : null}
          Connect as Buddy
        </Button>
      )}
    </div>
  );
};

export default UserActionsSection;
