
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Settings, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PageLayout from '@/components/PageLayout';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboardLink from '@/components/AdminDashboardLink';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '@/components/PostCard';
import Comment from '@/components/Comment';

interface UserPost {
  id: string;
  text: string;
  created_at: string;
  votes: number;
  author: {
    pseudonym: string;
    avatar: string | null;
  };
}

interface UserComment {
  id: string;
  text: string;
  created_at: string;
  post: {
    id: string;
    text: string;
  };
}

interface UpvotedPost {
  post_id: string;
  post: {
    id: string;
    text: string;
    created_at: string;
    votes: number;
    author: {
      pseudonym: string;
      avatar: string | null;
    };
  };
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [upvotedPosts, setUpvotedPosts] = useState<UpvotedPost[]>([]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchUserContent = async () => {
      setLoading(true);
      try {
        // Fetch based on active tab to avoid unnecessary queries
        if (activeTab === 'posts') {
          const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select(`
              id, 
              text, 
              created_at, 
              votes,
              author:profiles!author_id (
                pseudonym,
                avatar
              )
            `)
            .eq('author_id', user.id)
            .order('created_at', { ascending: false });

          if (postsError) throw postsError;
          setUserPosts(posts || []);
        } 
        else if (activeTab === 'comments') {
          const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select(`
              id, 
              text, 
              created_at,
              post:posts!post_id (
                id,
                text
              )
            `)
            .eq('author_id', user.id)
            .order('created_at', { ascending: false });

          if (commentsError) throw commentsError;
          setUserComments(comments || []);
        } 
        else if (activeTab === 'upvoted') {
          const { data: upvoted, error: upvotedError } = await supabase
            .from('user_post_votes')
            .select(`
              post_id,
              post:posts!post_id (
                id, 
                text, 
                created_at, 
                votes,
                author:profiles!author_id (
                  pseudonym,
                  avatar
                )
              )
            `)
            .eq('user_id', user.id)
            .eq('vote_type', 1)
            .order('created_at', { ascending: false });

          if (upvotedError) throw upvotedError;
          setUpvotedPosts(upvoted || []);
        }
      } catch (error) {
        console.error('Error fetching user content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [user?.id, activeTab]);

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
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-20 w-full mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>You haven't created any posts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map(post => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    content={post.text}
                    authorName={post.author?.pseudonym}
                    authorAvatar={post.author?.avatar || undefined}
                    createdAt={new Date(post.created_at)}
                    votes={post.votes}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="comments" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : userComments.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>You haven't commented on any posts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userComments.map(comment => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <Link to={`/post/${comment.post.id}`} className="text-sm font-medium hover:underline mb-1 block">
                      On post: {comment.post.text.length > 100 ? `${comment.post.text.slice(0, 100)}...` : comment.post.text}
                    </Link>
                    <Comment
                      id={comment.id}
                      text={comment.text}
                      authorId={user.id}
                      authorName={profile.pseudonym}
                      authorAvatar={profile.avatar || undefined}
                      createdAt={new Date(comment.created_at)}
                      showActions={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="upvoted" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-20 w-full mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upvotedPosts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>You haven't upvoted any posts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upvotedPosts.map(item => (
                  <PostCard
                    key={item.post.id}
                    id={item.post.id}
                    content={item.post.text}
                    authorName={item.post.author?.pseudonym}
                    authorAvatar={item.post.author?.avatar || undefined}
                    createdAt={new Date(item.post.created_at)}
                    votes={item.post.votes}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Profile;
