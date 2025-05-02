
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Settings, User, Loader2 } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/services/postService';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';

const Profile: React.FC = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  
  // Query user's posts
  const { data: userPosts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['userPosts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const posts = await fetchPosts();
      return posts.filter(post => post.author.id === user.id);
    },
    enabled: !!user?.id
  });
  
  // If not loaded yet, return loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect to auth page if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0 overflow-hidden">
      {/* Full width header */}
      <Header />
      
      {/* Content area with ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Page specific content here */}
          <div className="max-w-3xl mx-auto px-4 py-4 w-full scrollbar-hide pb-safe">
            <div className="flex flex-col items-center space-y-4 mb-8">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar} alt={profile?.pseudonym} className="object-cover" />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{profile?.pseudonym || user.email?.split('@')[0]}</h1>
              {profile?.bio && <p className="text-muted-foreground text-center">{profile.bio}</p>}
              {!profile?.bio && <p className="text-muted-foreground text-center">No bio yet</p>}
              <p className="text-sm text-muted-foreground">
                Joined {profile?.joinedAt.toLocaleDateString() || 'recently'}
              </p>
            </div>
            
            <div className="flex justify-center mb-8">
              <Button onClick={() => navigate('/settings')} variant="outline" className="flex items-center text-sm">
                <Settings size={16} className="mr-2" />
                Edit Profile
              </Button>
            </div>
            
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold mb-4">My Posts</h2>
              {isLoadingPosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  You haven't created any posts yet.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
