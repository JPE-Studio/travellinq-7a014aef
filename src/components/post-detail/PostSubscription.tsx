
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePostSubscription = (postId: string | undefined) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is already subscribed to this post
  useEffect(() => {
    if (!user || !postId) return;

    const checkSubscription = async () => {
      try {
        const { data } = await supabase
          .from('post_subscriptions')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();
        
        setIsSubscribed(!!data);
      } catch (error) {
        // No subscription found
        setIsSubscribed(false);
      }
    };

    checkSubscription();
  }, [postId, user]);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to posts.",
        variant: "destructive"
      });
      return;
    }
    
    if (!postId) return;
    
    setLoading(true);

    try {
      if (isSubscribed) {
        // Unsubscribe
        await supabase
          .from('post_subscriptions')
          .delete()
          .eq('post_id', postId)
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
            post_id: postId,
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

  return { isSubscribed, loading, handleSubscribe };
};
