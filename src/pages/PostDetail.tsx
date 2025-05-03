
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import { ChevronLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { fetchPostById, deletePost } from '@/services/postService';
import { fetchComments } from '@/services/commentService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePostTranslation } from '@/hooks/usePostTranslation';
import { usePostDetailVoting } from '@/components/post-detail/PostVoting';
import { usePostSubscription } from '@/components/post-detail/PostSubscription';
import LoadingState from '@/components/post-detail/LoadingState';
import ErrorState from '@/components/post-detail/ErrorState';
import PostContent from '@/components/post-detail/PostContent';
import CommentSection from '@/components/post-detail/CommentSection';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Query for post data
  const { 
    data: post, 
    isLoading: isPostLoading, 
    error: postError 
  } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPostById(id as string),
    enabled: !!id
  });
  
  // Query for comments
  const { 
    data: commentsData = [], 
    isLoading: areCommentsLoading, 
    error: commentsError 
  } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => fetchComments(id as string),
    enabled: !!id
  });
  
  // Use the post subscription hook
  const { isSubscribed, loading: subscriptionLoading, handleSubscribe } = usePostSubscription(id);
  
  // Use the post voting hook
  const { votes, userVote, loading: votingLoading, handleVote } = usePostDetailVoting(
    id as string, 
    post?.votes || 0
  );
  
  // Use the post translation hook
  const { 
    isTranslating, 
    translatedText, 
    detectedLanguage, 
    handleTranslate,
    translationAvailable 
  } = usePostTranslation(post?.text || '', false);
  
  // Combined loading state
  const loading = subscriptionLoading || votingLoading;
  
  // Listen for real-time comment updates
  useEffect(() => {
    if (!id) return;
    
    const channel = supabase
      .channel('comment-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'comments',
          filter: `post_id=eq.${id}`
        }, 
        (payload) => {
          // Refresh comments when a new one is added
          queryClient.invalidateQueries({ queryKey: ['comments', id] });
          
          toast({
            title: "New comment",
            description: "Someone just commented on this post.",
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  const handleDeletePost = async () => {
    if (!user || !id || !post) return;
    
    if (user.id !== post.author.id) {
      toast({
        title: "Permission denied",
        description: "You can only delete your own posts.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
        await deletePost(id);
        toast({
          title: "Post deleted",
          description: "Your post has been successfully deleted",
        });
        navigate('/');
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isPostLoading) {
    return <LoadingState />;
  }

  if (postError || !post) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
      {/* Full width header */}
      <Header />
      
      {/* Content area with ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col overflow-x-hidden">
          {/* Page specific content here */}
          <div className="max-w-3xl mx-auto px-4 py-4 w-full scrollbar-hide">
            <Link to="/" className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground">
              <ChevronLeft size={16} className="mr-1" />
              Back to feed
            </Link>
            
            <PostContent 
              post={post}
              votes={votes}
              userVote={userVote}
              loading={loading}
              translatedText={translatedText}
              isTranslating={isTranslating}
              detectedLanguage={detectedLanguage}
              handleVote={handleVote}
              handleTranslate={handleTranslate}
              translationAvailable={translationAvailable}
              handleDeletePost={handleDeletePost}
            />
            
            <CommentSection 
              postId={id as string}
              comments={commentsData}
              areCommentsLoading={areCommentsLoading}
              commentsError={commentsError}
            />
          </div>
        </div>
        
        {/* Right sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
