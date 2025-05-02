import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Settings, User, Loader2, MessageSquare, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/services/postService';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { fetchUserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { BuddyConnection } from '@/types';
import { connectWithBuddy, disconnectBuddy, getBuddyConnection } from '@/services/chatService';
import { getOrCreateConversation } from '@/services/participantService';
import PageLayout from '@/components/PageLayout';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewingOwnProfile, setViewingOwnProfile] = useState(true);
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [viewedProfileLoading, setViewedProfileLoading] = useState(false);
  const [buddyConnection, setBuddyConnection] = useState<BuddyConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  
  // Check if viewing own profile or someone else's
  useEffect(() => {
    if (!userId && user) {
      setViewingOwnProfile(true);
      setViewedProfile(null);
    } else if (userId && user && userId === user.id) {
      setViewingOwnProfile(true);
      setViewedProfile(null);
    } else if (userId) {
      setViewingOwnProfile(false);
      setViewedProfileLoading(true);
      
      fetchUserProfile(userId)
        .then(profileData => {
          setViewedProfile(profileData);
          
          // Check buddy connection when viewing other profile
          if (user) {
            getBuddyConnection(userId)
              .then(connection => {
                setBuddyConnection(connection);
              })
              .catch(error => {
                console.error("Error checking buddy connection:", error);
              });
          }
        })
        .catch(error => {
          console.error("Error fetching user profile:", error);
        })
        .finally(() => {
          setViewedProfileLoading(false);
        });
    }
  }, [userId, user]);
  
  // Query posts
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['userPosts', viewingOwnProfile ? user?.id : userId],
    queryFn: async () => {
      const profileId = viewingOwnProfile ? user?.id : userId;
      if (!profileId) return [];
      const posts = await fetchPosts();
      return posts.filter(post => post.author.id === profileId);
    },
    enabled: !!(viewingOwnProfile ? user?.id : userId)
  });

  // Handle connect with buddy
  const handleConnect = async () => {
    if (!userId || !user) return;

    try {
      setIsConnecting(true);
      const connection = await connectWithBuddy(userId);
      setBuddyConnection(connection);
      toast({
        title: "Connected as buddies!",
        description: `You are now connected with ${viewedProfile?.pseudonym}`,
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
        description: `You are no longer connected with ${viewedProfile?.pseudonym}`,
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
  
  // If not loaded yet, return loading state
  if (loading || viewedProfileLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect to auth page if not logged in
  if (!user && !userId) {
    return <Navigate to="/auth" replace />;
  }
  
  // Get the profile to display (own profile or viewed profile)
  const displayProfile = viewingOwnProfile ? profile : viewedProfile;
  
  if (!displayProfile) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Profile not found</h2>
          <p className="text-muted-foreground">The requested user profile could not be found.</p>
          <Button onClick={() => navigate('/')} className="mt-4">Go to Home</Button>
        </div>
      </div>
    );
  }
  
  return (
    <PageLayout>
      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-4 w-full scrollbar-hide">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={displayProfile?.avatar} alt={displayProfile?.pseudonym} className="object-cover" />
            <AvatarFallback>
              <User className="h-12 w-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">{displayProfile?.pseudonym || (viewingOwnProfile ? user?.email?.split('@')[0] : 'Unknown User')}</h1>
          {displayProfile?.bio && <p className="text-muted-foreground text-center">{displayProfile.bio}</p>}
          {!displayProfile?.bio && <p className="text-muted-foreground text-center">No bio yet</p>}
          <p className="text-sm text-muted-foreground">
            Joined {displayProfile?.joinedAt?.toLocaleDateString() || 'recently'}
          </p>
        </div>
        
        {viewingOwnProfile ? (
          <div className="flex justify-center mb-8">
            <Button onClick={() => navigate('/settings')} variant="outline" className="flex items-center text-sm">
              <Settings size={16} className="mr-2" />
              Edit Profile
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-2 mb-8">
            {buddyConnection ? (
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex items-center"
              >
                {isDisconnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Disconnect
              </Button>
            ) : (
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center"
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Connect
              </Button>
            )}

            <Button 
              variant={buddyConnection ? "default" : "outline"}
              onClick={handleStartChat}
              disabled={isStartingChat}
              className="flex items-center"
            >
              {isStartingChat ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Message
            </Button>
          </div>
        )}
        
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">{viewingOwnProfile ? 'My Posts' : 'Posts'}</h2>
          {isLoadingPosts ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {viewingOwnProfile ? "You haven't created any posts yet." : "This user hasn't created any posts yet."}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
