
import { supabase } from "@/integrations/supabase/client";
import { Comment, User } from "@/types";
import { fetchUserProfile } from "./userService";

// Fetch all comments for a specific post
export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    
    if (!comments || comments.length === 0) return [];
    
    // Get unique author IDs
    const authorIds = [...new Set(comments.map(comment => comment.author_id))];
    
    // Fetch all required user profiles in one batch
    const userProfiles: Record<string, User> = {};
    
    for (const authorId of authorIds) {
      try {
        const userProfile = await fetchUserProfile(authorId);
        userProfiles[authorId] = userProfile;
      } catch (err) {
        console.error(`Error fetching profile for author ${authorId}:`, err);
        // Create placeholder user
        userProfiles[authorId] = {
          id: authorId,
          pseudonym: "Unknown User",
          joinedAt: new Date()
        };
      }
    }
    
    // Transform database comments to application comments
    return comments.map(comment => ({
      id: comment.id,
      author: userProfiles[comment.author_id],
      text: comment.text,
      postId: comment.post_id,
      parentCommentId: comment.parent_comment_id,
      votes: comment.votes,
      createdAt: new Date(comment.created_at)
    }));
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId: string, text: string, parentCommentId?: string): Promise<Comment> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("User not authenticated");
    
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: session.session.user.id,
        text: text,
        parent_comment_id: parentCommentId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Get author profile
    const author = await fetchUserProfile(session.session.user.id);
    
    return {
      id: comment.id,
      author,
      text: comment.text,
      postId: comment.post_id,
      parentCommentId: comment.parent_comment_id,
      votes: 0,
      createdAt: new Date(comment.created_at)
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Upvote or downvote a comment
export const voteComment = async (commentId: string, voteType: 1 | -1): Promise<void> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("User not authenticated");
    
    // Check if the user has already voted for this comment
    const { data: existingVotes, error: fetchError } = await supabase
      .from("user_comment_votes")
      .select()
      .eq("comment_id", commentId)
      .eq("user_id", session.session.user.id);
    
    if (fetchError) throw fetchError;
    
    if (existingVotes && existingVotes.length > 0) {
      // User has already voted, update their vote
      const { error: updateError } = await supabase
        .from("user_comment_votes")
        .update({ vote_type: voteType })
        .eq("id", existingVotes[0].id);
      
      if (updateError) throw updateError;
    } else {
      // User hasn't voted yet, insert a new vote
      const { error: insertError } = await supabase
        .from("user_comment_votes")
        .insert({
          comment_id: commentId,
          user_id: session.session.user.id,
          vote_type: voteType
        });
      
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error(`Error voting for comment ${commentId}:`, error);
    throw error;
  }
};
