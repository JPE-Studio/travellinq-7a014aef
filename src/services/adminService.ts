
import { supabase } from "@/integrations/supabase/client";
import { PostReport, AppMetrics, UserExport, HashtagData } from "@/types/roles";
import { User } from "@/types";

// Fetch post reports for moderation
export const fetchPostReports = async (status?: string): Promise<PostReport[]> => {
  try {
    let query = supabase
      .from('post_reports')
      .select(`
        *,
        post:posts(*),
        reporter:profiles!reporter_id(id, pseudonym, avatar)
      `)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching post reports:", error);
      throw error;
    }
    
    // Ensure the status is cast to the correct type
    return (data as any[]).map(report => ({
      ...report,
      status: report.status as 'pending' | 'resolved' | 'rejected'
    }));
  } catch (error) {
    console.error("Error in fetchPostReports:", error);
    throw error;
  }
};

// Update post report status
export const updatePostReport = async (
  reportId: string, 
  status: 'pending' | 'resolved' | 'rejected',
  resolution_notes?: string,
  resolution_action?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('post_reports')
      .update({
        status,
        resolution_notes,
        resolution_action,
        resolved_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);
    
    if (error) {
      console.error("Error updating post report:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updatePostReport:", error);
    return false;
  }
};

// Block a user
export const blockUser = async (userId: string, blocked: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: blocked })
      .eq('id', userId);
    
    if (error) {
      console.error("Error blocking user:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in blockUser:", error);
    return false;
  }
};

// Set user's ghost mode
export const setGhostMode = async (userId: string, ghostMode: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ghost_mode: ghostMode })
      .eq('id', userId);
    
    if (error) {
      console.error("Error setting ghost mode:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in setGhostMode:", error);
    return false;
  }
};

// Update feed radius for a user
export const updateFeedRadius = async (userId: string, radius: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ feed_radius: radius })
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating feed radius:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateFeedRadius:", error);
    return false;
  }
};

// Get app metrics
export const getAppMetrics = async (): Promise<AppMetrics> => {
  try {
    // Get total users
    const { count: totalUsers, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (userError) throw userError;
    
    // Get new signups in last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const { count: newSignups, error: signupError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('joined_at', lastWeek.toISOString());
    
    if (signupError) throw signupError;
    
    // Get total posts
    const { count: totalPosts, error: postError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
    
    if (postError) throw postError;
    
    // Get posts by category
    const { data: postCategories, error: categoryError } = await supabase
      .from('posts')
      .select('category');
    
    if (categoryError) throw categoryError;
    
    const postsByCategory = postCategories.reduce((acc: Record<string, number>, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {});
    
    // Get users by location
    const { data: userLocations, error: locationError } = await supabase
      .from('profiles')
      .select('location')
      .not('location', 'is', null);
    
    if (locationError) throw locationError;
    
    const usersByLocationMap: Record<string, number> = {};
    userLocations.forEach(user => {
      if (user.location) {
        usersByLocationMap[user.location] = (usersByLocationMap[user.location] || 0) + 1;
      }
    });
    
    const usersByLocation = Object.entries(usersByLocationMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Estimate daily active users (this is simplified - in a real app, you'd track this more accurately)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { data: activePostUsers, error: activePostError } = await supabase
      .from('posts')
      .select('author_id', { count: 'exact' })
      .gte('created_at', oneDayAgo.toISOString());
    
    if (activePostError) throw activePostError;
    
    const { data: activeCommentUsers, error: activeCommentError } = await supabase
      .from('comments')
      .select('author_id', { count: 'exact' })
      .gte('created_at', oneDayAgo.toISOString());
    
    if (activeCommentError) throw activeCommentError;
    
    // Count unique users who have been active
    const activeUserIds = new Set([
      ...(activePostUsers || []).map((p: any) => p.author_id),
      ...(activeCommentUsers || []).map((c: any) => c.author_id)
    ]);
    
    return {
      totalUsers: totalUsers || 0,
      dailyActiveUsers: activeUserIds.size,
      totalPosts: totalPosts || 0,
      newSignups: newSignups || 0,
      postsByCategory,
      usersByLocation
    };
  } catch (error) {
    console.error("Error in getAppMetrics:", error);
    throw error;
  }
};

// Export top contributors
export const exportTopContributors = async (limit: number = 50): Promise<UserExport[]> => {
  try {
    // This is a simplified approach - in a real app, you'd use a more sophisticated query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, pseudonym, location, joined_at');
    
    if (profilesError) throw profilesError;
    
    // Get post counts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('author_id, votes');
    
    if (postsError) throw postsError;
    
    // Get comment counts
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('author_id');
    
    if (commentsError) throw commentsError;
    
    // Calculate metrics for each user
    const userMetrics = profiles.map(profile => {
      const userPosts = posts.filter((post: any) => post.author_id === profile.id);
      const userComments = comments.filter((comment: any) => comment.author_id === profile.id);
      const totalVotes = userPosts.reduce((sum: number, post: any) => sum + (post.votes || 0), 0);
      
      return {
        id: profile.id,
        pseudonym: profile.pseudonym,
        posts: userPosts.length,
        votes: totalVotes,
        comments: userComments.length,
        location: profile.location,
        joinedAt: profile.joined_at
      };
    });
    
    // Sort by total contribution (posts + comments + votes)
    return userMetrics
      .sort((a, b) => (b.posts + b.comments + b.votes) - (a.posts + a.comments + a.votes))
      .slice(0, limit);
  } catch (error) {
    console.error("Error in exportTopContributors:", error);
    throw error;
  }
};

// Get hashtag data
export const getHashtags = async (): Promise<HashtagData[]> => {
  try {
    const { data, error } = await supabase
      .from('hashtags')
      .select(`
        *,
        post_count:post_hashtags(count)
      `)
      .order('name');
    
    if (error) throw error;
    
    return data.map((hashtag: any) => ({
      id: hashtag.id,
      name: hashtag.name,
      created_at: hashtag.created_at,
      post_count: hashtag.post_count[0]?.count || 0
    }));
  } catch (error) {
    console.error("Error in getHashtags:", error);
    throw error;
  }
};

// Report a post
export const reportPost = async (
  postId: string,
  reason: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('post_reports')
      .insert({
        post_id: postId,
        reporter_id: (await supabase.auth.getUser()).data.user?.id,
        reason
      });
    
    if (error) {
      console.error("Error reporting post:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in reportPost:", error);
    return false;
  }
};
