
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { User, MessageSquare, Link, MapPin, Calendar, Globe, Loader2 } from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';
import { getBuddyConnection, connectWithBuddy, disconnectBuddy } from '@/services/chatService';
import { getOrCreateConversation } from '@/services/participantService';
import { format } from 'date-fns';

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile: currentUser } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Use the existing hook to fetch user profile data
  const { 
    userData, 
    loading, 
    buddyConnection, 
    approximateDistance,
    setBuddyConnection 
  } = useProfileData(userId, currentUser);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view user profiles",
      });
      navigate('/auth', { replace: true });
    }
  }, [user, navigate, toast]);

  // Handle connect with buddy
  const handleConnect = async () => {
    if (!userId || !user) return;

    try {
      setIsConnecting(true);
      const connection = await connectWithBuddy(userId);
      setBuddyConnection(connection);
      toast({
        title: "Connected as buddies!",
        description: `You are now connected with ${userData?.pseudonym}`,
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
    if (!userId || !user) return;

    try {
      setIsDisconnecting(true);
      await disconnectBuddy(userId);
      setBuddyConnection(null);
      toast({
        title: "Disconnected",
        description: `You are no longer connected with ${userData?.pseudonym}`,
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
    if (!userId || !user) return;

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

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if user data not found
  if (!userData) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <div className="max-w-3xl mx-auto p-4">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">User not found</CardTitle>
              <CardDescription>
                We couldn't find the profile you're looking for.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go back
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Render user profile
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <div className="max-w-3xl mx-auto p-4">
        <Card className="overflow-hidden">
          {/* User profile header with avatar and name */}
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-32"></div>
            <div className="absolute bottom-0 translate-y-1/2 left-6">
              <Avatar className="h-24 w-24 ring-4 ring-background">
                <AvatarImage src={userData.avatar} alt={userData.pseudonym} />
                <AvatarFallback className="text-lg">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardHeader className="pt-16">
            <CardTitle className="text-2xl">{userData.pseudonym}</CardTitle>
            {userData.location && (
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {userData.location}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Bio section */}
            {userData.bio && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium leading-none">Bio</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {userData.bio}
                </p>
              </div>
            )}

            {/* User details */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium leading-none">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {userData.joinedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {format(new Date(userData.joinedAt), 'MMMM yyyy')}</span>
                  </div>
                )}
                
                {userData.preferredLanguage && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>Speaks {userData.preferredLanguage}</span>
                  </div>
                )}

                {userData.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link className="h-4 w-4" />
                    <a 
                      href={
                        userData.website.startsWith('http') 
                          ? userData.website 
                          : `https://${userData.website}`
                      }
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {userData.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {approximateDistance !== null && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Approximately {approximateDistance} km away</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Connection status and action buttons */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div>
                  {buddyConnection ? (
                    <p className="text-sm font-medium text-green-600 dark:text-green-500">
                      Connected as buddies
                    </p>
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
                    variant={buddyConnection ? "default" : "outline"}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
