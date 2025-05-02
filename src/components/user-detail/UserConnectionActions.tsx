
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BuddyConnection } from '@/types';
import { connectWithBuddy, disconnectBuddy } from '@/services/chatService';
import { getOrCreateConversation } from '@/services/participantService';

interface ConnectionActionsProps {
  userId: string;
  userData: {
    pseudonym: string;
  };
  buddyConnection: BuddyConnection | null;
  setBuddyConnection: (connection: BuddyConnection | null) => void;
}

const UserConnectionActions: React.FC<ConnectionActionsProps> = ({
  userId,
  userData,
  buddyConnection,
  setBuddyConnection
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Handle connect with buddy
  const handleConnect = async () => {
    if (!userId) return;

    try {
      setIsConnecting(true);
      const connection = await connectWithBuddy(userId);
      setBuddyConnection(connection);
      toast({
        title: "Connection request sent!",
        description: `Request sent to ${userData.pseudonym}. You'll get a notification when they respond.`,
      });
    } catch (error) {
      console.error("Error connecting with buddy:", error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect with this user",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle disconnect buddy
  const handleDisconnect = async () => {
    if (!userId) return;

    try {
      setIsDisconnecting(true);
      await disconnectBuddy(userId);
      setBuddyConnection(null);
      toast({
        title: "Disconnected",
        description: `You are no longer connected with ${userData.pseudonym}`,
      });
    } catch (error) {
      console.error("Error disconnecting buddy:", error);
      toast({
        variant: "destructive",
        title: "Disconnection failed",
        description: error instanceof Error ? error.message : "Failed to disconnect from this user",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Start a chat with this user
  const handleStartChat = async () => {
    if (!userId) return;

    try {
      setIsStartingChat(true);
      const conversationId = await getOrCreateConversation(userId);
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        variant: "destructive",
        title: "Failed to start chat",
        description: error instanceof Error ? error.message : "Could not create conversation",
      });
      setIsStartingChat(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
      <div>
        {buddyConnection ? (
          buddyConnection.status === 'pending' ? (
            <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
              Connection request pending
            </p>
          ) : (
            <p className="text-sm font-medium text-green-600 dark:text-green-500">
              Connected as buddies
            </p>
          )
        ) : (
          <p className="text-sm font-medium text-muted-foreground">
            Not connected as buddies
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {buddyConnection ? (
          <Button 
            variant="outline" 
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Disconnect
          </Button>
        ) : (
          <Button 
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Connect
          </Button>
        )}

        <Button 
          variant={buddyConnection?.status === 'active' ? "default" : "outline"}
          onClick={handleStartChat}
          disabled={isStartingChat}
        >
          {isStartingChat ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="mr-2 h-4 w-4" />
          )}
          Chat
        </Button>
      </div>
    </div>
  );
};

export default UserConnectionActions;
