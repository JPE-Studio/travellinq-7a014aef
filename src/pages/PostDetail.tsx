
import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, User, ChevronLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { fetchPostById } from '@/services/postService';
import { fetchComments, addComment } from '@/services/commentService';
import { useAuth } from '@/contexts/AuthContext';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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
    data: comments = [], 
    isLoading: areCommentsLoading, 
    error: commentsError 
  } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => fetchComments(id as string),
    enabled: !!id
  });
  
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

  const handleVote = (direction: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on posts.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: direction === 'up' ? "Upvoted" : "Downvoted",
      description: `You ${direction === 'up' ? 'upvoted' : 'downvoted'} this post.`,
    });
  };

  const handleSubscribe = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to posts.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Subscribed to post",
      description: `You'll receive notifications for updates to this post.`,
    });
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
                <Link to={`/user/${post.author.id}`} className="mr-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} className="object-cover" />
                    <AvatarFallback>
                      <User className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link to={`/user/${post.author.id}`} className="font-semibold hover:underline">{post.author.pseudonym}</Link>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
                    {post.location && (
                      <>
                        <span className="mx-1">•</span>
                        <MapPin size={12} className="mr-1" />
                        <span>{post.distance?.toFixed(1) || "Unknown"} miles away</span>
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
                    className="flex items-center hover:text-foreground text-muted-foreground"
                    onClick={() => handleVote('up')}
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>{post.votes}</span>
                  </button>
                  <button 
                    className="flex items-center hover:text-foreground text-muted-foreground"
                    onClick={() => handleVote('down')}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                
                <button 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleSubscribe}
                >
                  Subscribe
                </button>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow p-4">
              <h2 className="font-semibold mb-4">Comments ({comments.length})</h2>
              <form className="flex mb-4" onSubmit={handleSubmitComment}>
                <Avatar className="h-8 w-8 mr-3">
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
                      {addCommentMutation.isPending ? 'Posting...' : 'Post'}
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
              ) : comments.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="border-t pt-4">
                      <div className="flex">
                        <Link to={`/user/${comment.author.id}`} className="mr-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar} className="object-cover" />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link to={`/user/${comment.author.id}`} className="font-medium text-sm hover:underline">
                              {comment.author.pseudonym}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="mt-1 text-sm">{comment.text}</p>
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <button className="flex items-center hover:text-foreground mr-3">
                              <ArrowUp className="h-3 w-3 mr-1" />
                              <span>{comment.votes}</span>
                            </button>
                            <button className="flex items-center hover:text-foreground mr-3">
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button className="hover:text-foreground">Reply</button>
                          </div>
                        </div>
                      </div>
                    </div>
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
