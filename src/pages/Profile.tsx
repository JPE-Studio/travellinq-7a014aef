
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Settings, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PageLayout from '@/components/PageLayout';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboardLink from '@/components/AdminDashboardLink';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (!user || !profile) {
    navigate('/auth');
    return null;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-4">
        <Link 
          to="/" 
          className="inline-flex items-center mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center">
            <Avatar className="h-16 w-16 md:h-20 md:w-20 mr-4">
              {profile.avatar ? (
                <AvatarImage src={profile.avatar} alt={profile.pseudonym} />
              ) : (
                <AvatarFallback>
                  {profile.pseudonym.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{profile.pseudonym}</h1>
              {profile.location && (
                <p className="text-muted-foreground">
                  {profile.location}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Joined {profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
          
          <div className="flex mt-4 sm:mt-0 space-x-2">
            <AdminDashboardLink />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        
        {profile.bio && (
          <div className="mb-6">
            <p>{profile.bio}</p>
          </div>
        )}
        
        <Separator className="my-6" />
        
        <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="upvoted">Upvoted</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            <div className="text-center py-10 text-muted-foreground">
              <p>Your posts will appear here.</p>
            </div>
          </TabsContent>
          <TabsContent value="comments" className="mt-6">
            <div className="text-center py-10 text-muted-foreground">
              <p>Your comments will appear here.</p>
            </div>
          </TabsContent>
          <TabsContent value="upvoted" className="mt-6">
            <div className="text-center py-10 text-muted-foreground">
              <p>Posts you've upvoted will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Profile;
