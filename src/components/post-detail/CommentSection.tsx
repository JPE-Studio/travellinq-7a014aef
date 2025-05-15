
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { addComment } from '@/services/commentService';
import Comment from '@/components/Comment';

interface CommentSectionProps {
  postId: string;
  comments: any[];
  areCommentsLoading: boolean;
  commentsError: unknown;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  areCommentsLoading,
  commentsError
}) => {
  const [comment, setComment] = useState('');
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  
  // Organize comments into a nested tree structure
  const organizedComments = React.useMemo(() => {
    const commentMap: Record<string, any> = {};
    const rootComments: any[] = [];
    
    // First, create a map of all comments by id
    comments.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        children: [],
      };
    });
    
    // Then, build the hierarchy by adding each comment to its parent's children array
    comments.forEach(comment => {
      if (comment.parentCommentId) {
        // This is a child comment, add it to its parent
        const parentComment = commentMap[comment.parentCommentId];
        if (parentComment) {
          parentComment.children.push(commentMap[comment.id]);
        } else {
          // Parent comment not found, treat as root comment
          rootComments.push(commentMap[comment.id]);
        }
      } else {
        // This is a root comment
        rootComments.push(commentMap[comment.id]);
      }
    });
    
    // Sort root comments by creation date (newest first)
    return rootComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments]);
  
  // Render a comment and its nested children recursively
  const renderCommentWithReplies = (comment: any, depth = 0) => {
    return (
      <React.Fragment key={comment.id}>
        <Comment 
          comment={comment} 
          postId={postId}
          depth={depth}
          voteOnComment={() => Promise.resolve()} // Add empty function to fix missing prop
          userVote={{}}
        />
        {comment.children.map((childComment: any) => 
          renderCommentWithReplies(childComment, depth + 1)
        )}
      </React.Fragment>
    );
  };
  
  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
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
    
    try {
      await addComment(postId, comment.trim());
      
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setComment('');
      
      toast({
        title: "Comment posted",
        description: "Your comment has been added to the discussion.",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-card rounded-lg shadow p-4">
      <h2 className="font-semibold mb-4">Comments ({comments.length})</h2>
      <form className="flex mb-4" onSubmit={handleSubmitComment}>
        <Avatar className="h-8 w-8 mr-3">
          <AvatarImage src={profile?.avatar} className="object-cover" />
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
            <Button type="submit" size="sm">
              Post
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
          {organizedComments.map(comment => renderCommentWithReplies(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
