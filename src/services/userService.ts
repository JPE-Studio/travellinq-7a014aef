
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

// Helper function to map profile data to User type
const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  pseudonym: profile.pseudonym,
  avatar: profile.avatar,
  bio: profile.bio,
  location: profile.location,
  joinedAt: new Date(profile.joined_at),
  preferredLanguage: profile.preferred_language,
  website: profile.website,
  latitude: profile.latitude,
  longitude: profile.longitude,
  autoTranslate: profile.auto_translate || false,
  locationSharing: profile.location_sharing !== false
});

// Fetch user profile by ID
export const fetchUserProfile = async (userId: string): Promise<User> => {
  console.log(`Fetching user profile for ID: ${userId}`);
  
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
  
  if (!data) {
    throw new Error("User profile not found");
  }
  
  const user = mapProfileToUser(data);
  console.log("Profile data received:", user);
  return user;
};

// Fetch multiple user profiles by IDs
export const fetchUserProfiles = async (userIds: string[]): Promise<User[]> => {
  if (!userIds.length) return [];
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);
  
  if (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }
  
  return data.map(mapProfileToUser);
};

// Fetch all user profiles except current user
export const fetchOtherUsers = async (): Promise<User[]> => {
  const { data: session } = await supabase.auth.getSession();
  
  const query = supabase
    .from("profiles")
    .select("*");
  
  if (session?.session?.user.id) {
    query.neq("id", session.session.user.id);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching other users:", error);
    throw error;
  }
  
  return data.map(mapProfileToUser);
};

// Fetch location data for buddies (new function)
export const fetchBuddiesLocationData = async (buddyIds: string[]): Promise<User[]> => {
  if (!buddyIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("id", buddyIds)
      .eq("location_sharing", true);
    
    if (error) {
      console.error("Error fetching buddy location data:", error);
      throw error;
    }
    
    // Filter out buddies without location data
    const buddiesWithLocation = data
      .map(mapProfileToUser)
      .filter(buddy => buddy.latitude && buddy.longitude);
    
    console.log(`Found ${buddiesWithLocation.length} buddies with location data`);
    
    return buddiesWithLocation;
  } catch (error) {
    console.error("Exception in fetchBuddiesLocationData:", error);
    return [];
  }
};
