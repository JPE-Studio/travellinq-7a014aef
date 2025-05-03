
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  return { isSubscribed, loading, handleSubscribe };
};
