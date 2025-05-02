
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePostSubscription = (postId: string) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is already subscribed to this post
  useEffect(() => {
    if (!user) return;
    
    const checkSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('post_subscriptions')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking subscription:", error);
          return;
        }
          
        setIsSubscribed(!!data);
      } catch (error) {
        console.error("Error in subscription check:", error);
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
    
    setLoading(true);
    try {
      if (isSubscribed) {
        // Unsubscribe
        const { error } = await supabase
          .from('post_subscriptions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error unsubscribing:", error);
          throw error;
        }
        
        setIsSubscribed(false);
        toast({
          title: "Unsubscribed",
          description: `You'll no longer receive notifications for this post.`
        });
      } else {
        // Subscribe
        const { error } = await supabase
          .from('post_subscriptions')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) {
          console.error("Error subscribing:", error);
          throw error;
        }
          
        setIsSubscribed(true);
        toast({
          title: "Subscribed",
          description: `You'll receive notifications for updates to this post.`
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
