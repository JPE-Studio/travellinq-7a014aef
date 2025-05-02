
import { supabase } from "@/integrations/supabase/client";
import { Post, User } from "@/types";
import { fetchUserProfile } from "./userService";

// Fetch all posts with distance calculation and pagination
export const fetchPosts = async (
  latitude?: number,
  longitude?: number,
  radius?: number,
  categories?: string[],
  page: number = 1,
  limit: number = 10
): Promise<Post[]> => {
  try {
    const offset = (page - 1) * limit;
    
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        post_images (
          id,
          image_url,
          order_index
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;

    if (!posts || posts.length === 0) return [];

    // Get all the author IDs to fetch profiles in one go
    const authorIds = [...new Set(posts.map(post => post.author_id))];
    
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

    // Count comments for each post - use a separate query for each post ID
    const postIds = posts.map(post => post.id);
    
    // Get comment counts for all posts in one query
    const { data: commentCounts, error: countError } = await supabase
      .from("comments")
      .select("post_id, id")
      .in("post_id", postIds);
    
    if (countError) {
      console.error("Error fetching comment counts:", countError);
    }

    // Process the results to create a count map
    const commentCountMap: Record<string, number> = {};
    if (commentCounts) {
      commentCounts.forEach(item => {
        if (!commentCountMap[item.post_id]) {
          commentCountMap[item.post_id] = 0;
        }
        commentCountMap[item.post_id]++;
      });
    }
    
    // Transform database posts to application posts
    const transformedPosts: Post[] = posts.map(post => {
      // Calculate distance from user (if coordinates provided)
      let distance = undefined;
      if (latitude && longitude) {
        const R = 6371; // Earth radius in km
        const dLat = (post.location_lat - latitude) * Math.PI / 180;
        const dLon = (post.location_lng - longitude) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(latitude * Math.PI / 180) * Math.cos(post.location_lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        distance = R * c * 0.621371; // Convert to miles
      }
      
      // Prepare the post images
      const images = post.post_images?.map(img => img.image_url) || [];
      
      return {
        id: post.id,
        author: userProfiles[post.author_id],
        text: post.text,
        images: images.length > 0 ? images : undefined,
        category: post.category,
        location: {
          lat: post.location_lat,
          lng: post.location_lng
        },
        distance: distance,
        votes: post.votes,
        createdAt: new Date(post.created_at),
        commentCount: commentCountMap[post.id] || 0
      };
    });
    
    // Apply filters if provided
    let filteredPosts = transformedPosts;
    
    if (categories && categories.length > 0) {
      filteredPosts = filteredPosts.filter(post => categories.includes(post.category));
    }
    
    if (radius && latitude && longitude) {
      filteredPosts = filteredPosts.filter(post => 
        post.distance !== undefined && post.distance <= radius
      );
    }
    
    return filteredPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

// Fetch a single post by ID
export const fetchPostById = async (postId: string): Promise<Post | null> => {
  try {
    const { data: post, error } = await supabase
      .from("posts")
      .select(`
        *,
        post_images (
          id,
          image_url,
          order_index
        )
      `)
      .eq("id", postId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    if (!post) return null;
    
    // Get author profile
    let author: User;
    try {
      author = await fetchUserProfile(post.author_id);
    } catch (err) {
      console.error("Error fetching author profile:", err);
      author = {
        id: post.author_id,
        pseudonym: "Unknown User",
        joinedAt: new Date()
      };
    }
    
    // Get comment count
    const { count, error: countError } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    
    if (countError) {
      console.error("Error fetching comment count:", countError);
    }
    
    // Prepare images array
    const images = post.post_images?.map(img => img.image_url) || [];
    
    return {
      id: post.id,
      author,
      text: post.text,
      images: images.length > 0 ? images : undefined,
      category: post.category,
      location: {
        lat: post.location_lat,
        lng: post.location_lng
      },
      votes: post.votes,
      createdAt: new Date(post.created_at),
      commentCount: count || 0
    };
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error;
  }
};

// Create a new post
export const createPost = async (
  text: string,
  category: 'campsite' | 'service' | 'question' | 'general',
  location: { lat: number, lng: number },
  images?: string[]
): Promise<Post> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("User not authenticated");
    
    // Insert the post
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        text,
        category,
        location_lat: location.lat,
        location_lng: location.lng,
        author_id: session.session.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // If there are images, insert them
    if (images && images.length > 0) {
      const imageEntries = images.map((url, index) => ({
        post_id: post.id,
        image_url: url,
        order_index: index
      }));
      
      const { error: imagesError } = await supabase
        .from("post_images")
        .insert(imageEntries);
      
      if (imagesError) {
        console.error("Error inserting post images:", imagesError);
      }
    }
    
    // Get author profile
    const author = await fetchUserProfile(session.session.user.id);
    
    return {
      id: post.id,
      author,
      text: post.text,
      images,
      category: post.category,
      location: {
        lat: post.location_lat,
        lng: post.location_lng
      },
      votes: 0,
      createdAt: new Date(post.created_at),
      commentCount: 0
    };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Upvote or downvote a post
export const votePost = async (postId: string, voteType: 1 | -1): Promise<void> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("User not authenticated");
    
    // Check if the user has already voted for this post
    const { data: existingVotes, error: fetchError } = await supabase
      .from("user_post_votes")
      .select()
      .eq("post_id", postId)
      .eq("user_id", session.session.user.id);
    
    if (fetchError) throw fetchError;
    
    if (existingVotes && existingVotes.length > 0) {
      // User has already voted, update their vote
      const { error: updateError } = await supabase
        .from("user_post_votes")
        .update({ vote_type: voteType })
        .eq("id", existingVotes[0].id);
      
      if (updateError) throw updateError;
    } else {
      // User hasn't voted yet, insert a new vote
      const { error: insertError } = await supabase
        .from("user_post_votes")
        .insert({
          post_id: postId,
          user_id: session.session.user.id,
          vote_type: voteType
        });
      
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error(`Error voting for post ${postId}:`, error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId: string): Promise<void> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("User not authenticated");
    
    // First, check if the user is the author of the post
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!post || post.author_id !== session.session.user.id) {
      throw new Error("You don't have permission to delete this post");
    }
    
    // Delete the post - related records like comments and votes will be deleted through cascading
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);
    
    if (deleteError) throw deleteError;
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    throw error;
  }
};
