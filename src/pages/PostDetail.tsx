import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, User, ChevronLeft, ThumbsUp, ThumbsDown, Bell, BellOff, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { fetchPostById, votePost } from '@/services/postService';
import { fetchComments, addComment } from '@/services/commentService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Comment from '@/components/Comment';
import UserProfileLink from '@/components/UserProfileLink';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [comment, setComment] = useState('');
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  
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
  
  // Update local state when post data comes in
  useEffect(() => {
    if (post) {
      setVotes(post.votes);
    }
  }, [post]);
  
  // Check if user is already subscribed to this post
  useEffect(() => {
    if (!user || !id) return;

    const checkSubscription = async () => {
      try {
        const { data } = await supabase
          .from('post_subscriptions')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single();
        
        setIsSubscribed(!!data);
      } catch (error) {
        // No subscription found
        setIsSubscribed(false);
      }
    };

    // Check if user has already voted on this post
    const checkUserVote = async () => {
      try {
        const { data } = await supabase
          .from('user_post_votes')
          .select('vote_type')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserVote(data.vote_type as 1 | -1);
        }
      } catch (error) {
        // No vote found
        setUserVote(null);
      }
    };

    checkSubscription();
    checkUserVote();
  }, [id, user]);
  
  // Organize comments into a tree structure with parent/child relationships
  const organizedComments = React.useMemo(() => {
    const commentMap: Record<string, typeof commentsData[0] & { replies?: typeof commentsData }> = {};
    const topLevelComments: (typeof commentsData[0] & { replies?: typeof commentsData })[] = [];
    
    // First pass: create a map of all comments
    commentsData.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });
    
    // Second pass: organize into parent/child relationships
    commentsData.forEach(comment => {
      if (comment.parentCommentId) {
        // This is a reply, add to parent's replies array
        if (commentMap[comment.parentCommentId]) {
          if (!commentMap[comment.parentCommentId].replies) {
            commentMap[comment.parentCommentId].replies = [];
          }
          commentMap[comment.parentCommentId].replies?.push(commentMap[comment.id]);
        } else {
          // Parent comment not found, treat as top-level
          topLevelComments.push(commentMap[comment.id]);
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(commentMap[comment.id]);
      }
    });
    
    return topLevelComments;
  }, [commentsData]);
  
  // Mutation for adding comments
  const addCommentMutation = useMutation({
    mutationFn: ({ postId, text }: { postId: string, text: string }) => 
      addComment(postId, text),
    onSuccess: () => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setComment('');
      toast({
        title: "Comment posted",
        description: "Your comment has been added to the discussion.",
      });
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to posts.",
        variant: "destructive"
      });
      return;
    }
    
    if (!id) return;
    
    setLoading(true);

    try {
      if (isSubscribed) {
        // Unsubscribe
        await supabase
          .from('post_subscriptions')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);

        setIsSubscribed(false);
        toast({
          title: "Unsubscribed",
          description: `You'll no longer receive notifications for this post.`,
        });
      } else {
        // Subscribe
        await supabase
          .from('post_subscriptions')
          .insert({
            post_id: id,
            user_id: user.id
          });

        setIsSubscribed(true);
        toast({
          title: "Subscribed",
          description: `You'll receive notifications for updates to this post.`,
        });
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (direction: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on posts.",
        variant: "destructive"
      });
      return;
    }
    
    if (!id) return;
    
    setLoading(true);
    
    try {
      const voteType = direction === 'up' ? 1 : -1;
      
      // If user already voted the same way, treat as removing vote
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from('user_post_votes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);
        
        setVotes(prev => prev - voteType); // Adjust the vote count
        setUserVote(null);
        
        toast({
          title: "Vote removed",
          description: `Your vote has been removed.`,
        });
      } else {
        // Add or change vote
        await votePost(id, voteType);
        
        // If changing vote, need to adjust by 2 (remove old vote and add new one)
        if (userVote !== null) {
          setVotes(prev => prev - userVote + voteType);
        } else {
          setVotes(prev => prev + voteType);
        }
        
        setUserVote(voteType);
        
        toast({
          title: direction === 'up' ? "Upvoted" : "Downvoted",
          description: `You ${direction === 'up' ? 'upvoted' : 'downvoted'} this post.`,
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Comment cannot be empty",
        description: "Please write something before posting your comment.",
        variant: "destructive"
      });
      return;
    }
    
    if (id) {
      addCommentMutation.mutate({
        postId: id,
        text: comment.trim()
      });
    }
  };

  if (isPostLoading) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-4">
              This post may have been removed or is not available.
            </p>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
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
            
            <div className="bg-card rounded-lg shadow p-4 mb-4">
              <div className="flex items-center mb-3">
                <Link to={`/profile/${post.author.id}`} className="mr-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} className="object-cover" />
                    <AvatarFallback>
                      <User className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <UserProfileLink user={post.author} showAvatar={false} className="font-semibold hover:underline" />
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
                    {post.location && (
                      <>
                        <span className="mx-1">•</span>
                        <MapPin size={12} className="mr-1" />
                        <span>
                          {post.distance !== undefined ? 
                            `${post.distance.toFixed(1)} miles away` : 
                            "Distance unknown"
                          }
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="mb-4">{post.text}</p>
              
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {post.images.map((image, index) => (
                    <img 
                      key={index} 
                      src={image} 
                      alt={`Post by ${post.author.pseudonym}`}
                      className="w-full rounded-md"
                    />
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm mt-4">
                <div className="flex items-center space-x-4">
                  <button 
                    className={`flex items-center transition-colors ${userVote === 1 ? 'text-blue-500' : 'hover:text-foreground text-muted-foreground'}`}
                    onClick={() => handleVote('up')}
                    disabled={loading}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{votes}</span>
                  </button>
                  <button 
                    className={`flex items-center transition-colors ${userVote === -1 ? 'text-red-500' : 'hover:text-foreground text-muted-foreground'}`}
                    onClick={() => handleVote('down')}
                    disabled={loading}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
                
                <button 
                  className={`flex items-center ${isSubscribed ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {isSubscribed ? (
                    <>
                      <Bell className="h-4 w-4 mr-1 fill-primary" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="h-4 w-4 mr-1" />
                      <span>Subscribe</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow p-4">
              <h2 className="font-semibold mb-4">Comments ({organizedComments.length})</h2>
              <form className="flex mb-4" onSubmit={handleSubmitComment}>
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <textarea 
                    className="w-full p-2 border rounded-md resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Add a comment..."
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={addCommentMutation.isPending}
                    >
                      {addCommentMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Posting...
                        </>
                      ) : 'Post'}
                    </Button>
                  </div>
                </div>
              </form>
              
              {areCommentsLoading ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : commentsError ? (
                <div className="text-center text-destructive my-4">
                  Error loading comments. Please try again.
                </div>
              ) : organizedComments.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-4">
                  {organizedComments.map(comment => (
                    <React.Fragment key={comment.id}>
                      <Comment comment={comment} postId={id as string} />
                      {comment.replies?.map(reply => (
                        <Comment 
                          key={reply.id} 
                          comment={reply} 
                          postId={id as string}
                          nested={true} 
                        />
                      ))}
                    </React.Fragment>
                  ))}
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
    </div>
  );
};

export default PostDetail;
