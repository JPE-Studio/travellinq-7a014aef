
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchUserProfile } from '@/services/userService';
import { getBuddyConnection } from '@/services/chatService';
import { BuddyConnection, User } from '@/types';

interface UserProfileData {
  id: string;
  pseudonym: string;
  avatar?: string;
  location: string | null;
  bio: string | null;
  website?: string | null;
  joinedAt?: Date;
  preferredLanguage?: string;
  latitude?: number;
  longitude?: number;
}

interface UseProfileDataReturn {
  userData: UserProfileData | null;
  loading: boolean;
  buddyConnection: BuddyConnection | null;
  approximateDistance: number | null;
  setBuddyConnection: (connection: BuddyConnection | null) => void;
  setApproximateDistance: (distance: number | null) => void;
}

export const useProfileData = (userId: string | undefined, currentUser: User | null): UseProfileDataReturn => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buddyConnection, setBuddyConnection] = useState<BuddyConnection | null>(null);
  const [approximateDistance, setApproximateDistance] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No user ID provided.",
      });
      setLoading(false);
      return;
    }

    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profileData = await fetchUserProfile(userId);
        
        setUserData({
          id: profileData.id,
          pseudonym: profileData.pseudonym,
          avatar: profileData.avatar || '',
          location: profileData.location || null,
          bio: profileData.bio || null,
          website: profileData.website || null,
          joinedAt: profileData.joinedAt,
          preferredLanguage: profileData.preferredLanguage,
          latitude: profileData.latitude,
          longitude: profileData.longitude
        });

        // Check if already connected as buddies
        if (currentUser) {
          const connection = await getBuddyConnection(userId);
          setBuddyConnection(connection);
        }

        // Calculate approximate distance if user location is available
        if (currentUser && currentUser.latitude && currentUser.longitude && 
            profileData.latitude && profileData.longitude) {
          const distance = calculateDistance(
            currentUser.latitude, 
            currentUser.longitude, 
            profileData.latitude, 
            profileData.longitude
          );
          setApproximateDistance(distance);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load user profile. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, toast, currentUser]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return Math.round(distance);
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  return {
    userData,
    loading,
    buddyConnection,
    approximateDistance,
    setBuddyConnection,
    setApproximateDistance
  };
};
