
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { UserWarning } from "@/types/roles";

// Hide a post
export const hidePost = async (
  postId: string,
  reason: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('posts')
      .update({
        is_hidden: true,
        hidden_reason: reason,
        hidden_by: (await supabase.auth.getUser()).data.user?.id,
        hidden_at: new Date().toISOString()
      })
      .eq('id', postId);
    
    if (error) {
      console.error("Error hiding post:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in hidePost:", error);
    return false;
  }
};

// Unhide a post
export const unhidePost = async (postId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('posts')
      .update({
        is_hidden: false,
        hidden_reason: null,
        hidden_by: null,
        hidden_at: null
      })
      .eq('id', postId);
    
    if (error) {
      console.error("Error unhiding post:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in unhidePost:", error);
    return false;
  }
};

// Hide a comment
export const hideComment = async (
  commentId: string,
  reason: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comments')
      .update({
        is_hidden: true,
        hidden_reason: reason,
        hidden_by: (await supabase.auth.getUser()).data.user?.id,
        hidden_at: new Date().toISOString()
      })
      .eq('id', commentId);
    
    if (error) {
      console.error("Error hiding comment:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in hideComment:", error);
    return false;
  }
};

// Unhide a comment
export const unhideComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comments')
      .update({
        is_hidden: false,
        hidden_reason: null,
        hidden_by: null,
        hidden_at: null
      })
      .eq('id', commentId);
    
    if (error) {
      console.error("Error unhiding comment:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in unhideComment:", error);
    return false;
  }
};

// Warn a user
export const warnUser = async (
  userId: string,
  reason: string,
  severity: 'minor' | 'moderate' | 'severe',
  relatedPostId?: string,
  relatedCommentId?: string,
  expiresAt?: Date
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_warnings')
      .insert({
        user_id: userId,
        moderator_id: (await supabase.auth.getUser()).data.user?.id,
        reason,
        severity,
        related_post_id: relatedPostId,
        related_comment_id: relatedCommentId,
        expires_at: expiresAt ? expiresAt.toISOString() : null
      });
    
    if (error) {
      console.error("Error warning user:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in warnUser:", error);
    return false;
  }
};

// Get user warnings
export const getUserWarnings = async (userId: string): Promise<UserWarning[]> => {
  try {
    const { data, error } = await supabase
      .from('user_warnings')
      .select(`
        id,
        user_id,
        moderator_id,
        reason,
        severity,
        related_post_id,
        related_comment_id,
        created_at,
        expires_at,
        is_active,
        moderator:profiles!moderator_id(pseudonym)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching user warnings:", error);
      throw error;
    }
    
    return data as unknown as UserWarning[];
  } catch (error) {
    console.error("Error in getUserWarnings:", error);
    throw error;
  }
};

// Remove a warning
export const removeWarning = async (warningId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_warnings')
      .update({ is_active: false })
      .eq('id', warningId);
    
    if (error) {
      console.error("Error removing warning:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removeWarning:", error);
    return false;
  }
};

// Get all active warnings (for admin panel)
export const getAllActiveWarnings = async (): Promise<UserWarning[]> => {
  try {
    const { data, error } = await supabase
      .from('user_warnings')
      .select(`
        id,
        user_id,
        moderator_id,
        reason,
        severity,
        related_post_id,
        related_comment_id,
        created_at,
        expires_at,
        is_active,
        user:profiles!user_id(pseudonym),
        moderator:profiles!moderator_id(pseudonym)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching all warnings:", error);
      throw error;
    }
    
    return data as unknown as UserWarning[];
  } catch (error) {
    console.error("Error in getAllActiveWarnings:", error);
    throw error;
  }
};

// Get post moderation history
export const getPostModerationHistory = async (postId: string): Promise<any[]> => {
  try {
    // Fetch post warnings
    const { data: warnings, error: warningsError } = await supabase
      .from('user_warnings')
      .select(`
        id,
        user_id,
        moderator_id,
        reason,
        severity,
        created_at,
        moderator:profiles!moderator_id(pseudonym)
      `)
      .eq('related_post_id', postId);
    
    if (warningsError) {
      console.error("Error fetching post warnings:", warningsError);
      throw warningsError;
    }
    
    // Fetch post itself to see if it's hidden
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        is_hidden,
        hidden_reason,
        hidden_by,
        hidden_at,
        moderator:profiles!hidden_by(pseudonym)
      `)
      .eq('id', postId)
      .single();
    
    if (postError) {
      console.error("Error fetching post moderation info:", postError);
      throw postError;
    }
    
    // Combine data
    const history = [];
    
    if (post && post.is_hidden) {
      history.push({
        type: 'hide',
        reason: post.hidden_reason,
        moderator: post.moderator?.pseudonym || 'Unknown Moderator',
        timestamp: post.hidden_at,
      });
    }
    
    if (warnings) {
      warnings.forEach(warning => {
        history.push({
          type: 'warning',
          reason: warning.reason,
          severity: warning.severity,
          moderator: warning.moderator?.pseudonym || 'Unknown Moderator',
          timestamp: warning.created_at,
        });
      });
    }
    
    // Sort by timestamp descending
    return history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Error in getPostModerationHistory:", error);
    throw error;
  }
};

// Get comment moderation history
export const getCommentModerationHistory = async (commentId: string): Promise<any[]> => {
  try {
    // Fetch comment warnings
    const { data: warnings, error: warningsError } = await supabase
      .from('user_warnings')
      .select(`
        id,
        user_id,
        moderator_id,
        reason,
        severity,
        created_at,
        moderator:profiles!moderator_id(pseudonym)
      `)
      .eq('related_comment_id', commentId);
    
    if (warningsError) {
      console.error("Error fetching comment warnings:", warningsError);
      throw warningsError;
    }
    
    // Fetch comment itself to see if it's hidden
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select(`
        is_hidden,
        hidden_reason,
        hidden_by,
        hidden_at,
        moderator:profiles!hidden_by(pseudonym)
      `)
      .eq('id', commentId)
      .single();
    
    if (commentError) {
      console.error("Error fetching comment moderation info:", commentError);
      throw commentError;
    }
    
    // Combine data
    const history = [];
    
    if (comment && comment.is_hidden) {
      history.push({
        type: 'hide',
        reason: comment.hidden_reason,
        moderator: comment.moderator?.pseudonym || 'Unknown Moderator',
        timestamp: comment.hidden_at,
      });
    }
    
    if (warnings) {
      warnings.forEach(warning => {
        history.push({
          type: 'warning',
          reason: warning.reason,
          severity: warning.severity,
          moderator: warning.moderator?.pseudonym || 'Unknown Moderator',
          timestamp: warning.created_at,
        });
      });
    }
    
    // Sort by timestamp descending
    return history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Error in getCommentModerationHistory:", error);
    throw error;
  }
};
