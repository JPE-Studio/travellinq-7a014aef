
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Comment as CommentType } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CommentReplyForm from './CommentReplyForm';
import { voteComment } from '@/services/commentService';
import { supabase } from '@/integrations/supabase/client';

interface CommentProps {
  comment: CommentType;
  postId: string;
  nested?: boolean;
}

const Comment: React.FC<CommentProps> = ({ comment, postId, nested = false }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [votes, setVotes] = useState(comment.votes);
  const [loading, setLoading] = useState(false);
  
  React.useEffect(() => {
    if (!user) return;
    
    // Check if user has already voted on this comment
    const checkUserVote = async () => {
      try {
        const { data } = await supabase
          .from('user_comment_votes')
          .select('vote_type')
          .eq('comment_id', comment.id)
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
    
    checkUserVote();
  }, [comment.id, user]);
  
  const handleVote = async (direction: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on comments.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const voteType = direction === 'up' ? 1 : -1;
      
      // If user already voted the same way, treat as removing vote
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from('user_comment_votes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', user.id);
        
        setVotes(prev => prev - voteType); // Adjust the vote count
        setUserVote(null);
        
        toast({
          title: "Vote removed",
          description: `Your vote has been removed.`,
        });
      } else {
        // Add or change vote
        await voteComment(comment.id, voteType);
        
        // If changing vote, need to adjust by 2 (remove old vote and add new one)
        if (userVote !== null) {
          setVotes(prev => prev - userVote + voteType);
        } else {
          setVotes(prev => prev + voteType);
        }
        
        setUserVote(voteType);
        
        toast({
          title: direction === 'up' ? "Upvoted" : "Downvoted",
          description: `You ${direction === 'up' ? 'upvoted' : 'downvoted'} this comment.`,
        });
      }
    } catch (error) {
      console.error("Error voting on comment:", error);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`${nested ? 'pl-6 border-l ml-4' : 'border-t'} pt-4`}>
      <div className="flex">
        <Link to={`/user/${comment.author.id}`} className="mr-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.avatar} className="object-cover" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
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
            <button 
              className={`flex items-center transition-colors ${userVote === 1 ? 'text-blue-500' : 'hover:text-foreground'} mr-3`}
              onClick={() => handleVote('up')}
              disabled={loading}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              <span>{votes}</span>
            </button>
            <button 
              className={`flex items-center transition-colors ${userVote === -1 ? 'text-red-500' : 'hover:text-foreground'} mr-3`}
              onClick={() => handleVote('down')}
              disabled={loading}
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
            <button 
              className="hover:text-foreground"
              onClick={() => setShowReplyForm(!showReplyForm)}
              disabled={loading}
            >
              Reply
            </button>
          </div>
          {showReplyForm && (
            <CommentReplyForm 
              postId={postId} 
              parentCommentId={comment.id} 
              onCancel={() => setShowReplyForm(false)}
              authorName={comment.author.pseudonym}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
