
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

// Fetch user profile by ID
export const fetchUserProfile = async (userId: string): Promise<User> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    pseudonym: data.pseudonym,
    avatar: data.avatar,
    bio: data.bio,
    location: data.location,
    joinedAt: new Date(data.joined_at),
    preferredLanguage: data.preferred_language,
    website: data.website,
    latitude: data.latitude,
    longitude: data.longitude
  };
};

// Fetch multiple user profiles by IDs
export const fetchUserProfiles = async (userIds: string[]): Promise<User[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);
  
  if (error) throw error;
  
  return data.map(profile => ({
    id: profile.id,
    pseudonym: profile.pseudonym,
    avatar: profile.avatar,
    bio: profile.bio,
    location: profile.location,
    joinedAt: new Date(profile.joined_at),
    preferredLanguage: profile.preferred_language,
    website: profile.website,
    latitude: profile.latitude,
    longitude: profile.longitude
  }));
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
  
  if (error) throw error;
  
  return data.map(profile => ({
    id: profile.id,
    pseudonym: profile.pseudonym,
    avatar: profile.avatar,
    bio: profile.bio,
    location: profile.location,
    joinedAt: new Date(profile.joined_at),
    preferredLanguage: profile.preferred_language,
    website: profile.website,
    latitude: profile.latitude,
    longitude: profile.longitude
  }));
};
