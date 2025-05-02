
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { votePost } from '@/services/postService';

export const usePostVoting = (postId: string, initialVotes: number) => {
  const { user } = useAuth();
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user has already voted on this post
  useEffect(() => {
    if (!user) return;
    
    const checkUserVote = async () => {
      try {
        const { data } = await supabase
          .from('user_post_votes')
          .select('vote_type')
          .eq('post_id', postId)
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
  }, [postId, user]);

  const handleVote = async (direction: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on posts.",
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
          .from('user_post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        setVotes(prev => prev - voteType); // Adjust the vote count
        setUserVote(null);
        
        toast({
          title: "Vote removed",
          description: `Your vote has been removed.`
        });
      } else {
        // Add or change vote
        await votePost(postId, voteType);

        // If changing vote, need to adjust by 2 (remove old vote and add new one)
        if (userVote !== null) {
          setVotes(prev => prev - userVote + voteType);
        } else {
          setVotes(prev => prev + voteType);
        }
        
        setUserVote(voteType);
        
        toast({
          title: direction === 'up' ? "Upvoted" : "Downvoted",
          description: `You ${direction === 'up' ? 'upvoted' : 'downvoted'} this post.`
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

  return { votes, userVote, loading, handleVote };
};
