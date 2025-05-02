import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, User, ThumbsUp, ThumbsDown, Bell, BellOff, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { votePost } from '@/services/postService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user, profile } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState(post.votes);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  // Check if user is already subscribed to this post
  useEffect(() => {
    if (!user) return;

    const checkSubscription = async () => {
      try {
        const { data } = await supabase
          .from('post_subscriptions')
          .select('id')
          .eq('post_id', post.id)
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
          .eq('post_id', post.id)
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
  }, [post.id, user]);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to posts.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (isSubscribed) {
        // Unsubscribe
        await supabase
          .from('post_subscriptions')
          .delete()
          .eq('post_id', post.id)
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
            post_id: post.id,
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

    setLoading(true);
    
    try {
      const voteType = direction === 'up' ? 1 : -1;
      
      // If user already voted the same way, treat as removing vote
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from('user_post_votes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        setVotes(prev => prev - voteType); // Adjust the vote count
        setUserVote(null);
        
        toast({
          title: "Vote removed",
          description: `Your vote has been removed.`,
        });
      } else {
        // Add or change vote
        await votePost(post.id, voteType);
        
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
  
  const handleTranslate = async () => {
    // We would typically use a translation API here
    // For now we'll just simulate translation
    setIsTranslating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple mock translation - in a real app, use a translation API
      const targetLang = profile?.preferredLanguage || 'en';
      setTranslatedText(`[Translated to ${languages.find(l => l.value === targetLang)?.label || 'your language'}] ${post.text}`);
      
      toast({
        title: "Post translated",
        description: `Post has been translated to ${languages.find(l => l.value === targetLang)?.label || 'your language'}.`,
      });
    } catch (error) {
      console.error("Error translating post:", error);
      toast({
        title: "Translation failed",
        description: "We couldn't translate this post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow mb-4 overflow-hidden">
      {/* Post header with user info */}
      <div className="p-4">
        <div className="flex items-center mb-3">
          <Link to={`/user/${post.author.id}`} className="mr-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} className="object-cover" />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/user/${post.author.id}`} className="font-medium hover:underline">{post.author.pseudonym}</Link>
            <div className="flex flex-wrap items-center text-xs text-muted-foreground">
              <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
              {post.location && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin size={12} className="mr-1" />
                  <span className="flex items-center">
                    {post.distance !== undefined ? (
                      <>
                        <span className={post.distance <= 10 ? "text-forest font-medium" : ""}>
                          {post.distance.toFixed(1)} miles away
                        </span>
                        {post.distance <= 5 && (
                          <span className="ml-1 bg-forest/20 text-forest px-1 rounded text-[10px]">Near you</span>
                        )}
                      </>
                    ) : (
                      <span>Distance unknown</span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <Link to={`/post/${post.id}`} className="block">
          <p className="mb-3 text-foreground">{translatedText || post.text}</p>
        
          {/* Post images if available */}
          {post.images && post.images.length > 0 && (
            <div className={`grid gap-2 mb-3 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {post.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`Post by ${post.author.pseudonym}`}
                  className="w-full h-48 object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </Link>
        
        {/* Translate button - updated to be smaller with gray outline */}
        {!translatedText && user && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTranslate}
            disabled={isTranslating}
            className="mb-2 text-xs border border-gray-300 h-8 px-3"
          >
            <Languages className="h-3 w-3 mr-1" />
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>
        )}
        
        {/* Post interactions */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <div className="flex items-center space-x-4">
            <button 
              className={`flex items-center transition-colors ${userVote === 1 ? 'text-blue-500' : 'hover:text-foreground'}`}
              onClick={() => handleVote('up')}
              disabled={loading}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{votes}</span>
            </button>
            <button 
              className={`flex items-center transition-colors ${userVote === -1 ? 'text-red-500' : 'hover:text-foreground'}`}
              onClick={() => handleVote('down')}
              disabled={loading}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className={`flex items-center hover:text-foreground ${isSubscribed ? 'text-primary' : ''}`}
              onClick={handleSubscribe}
              disabled={loading}
            >
              {!isSubscribed ? (
                <>
                  <Bell className="h-4 w-4 mr-1" />
                  <span>Subscribe</span>
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4 mr-1" />
                  <span>Unsubscribe</span>
                </>
              )}
            </button>
            <Link to={`/post/${post.id}`} className="hover:text-foreground">
              {post.commentCount} comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Language options array for reference
const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
];

export default PostCard;
