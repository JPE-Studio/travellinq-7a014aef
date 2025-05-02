
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { useProfileData } from '@/hooks/useProfileData';
import UserDetailCard from '@/components/user-detail/UserDetailCard';
import UserDetailError from '@/components/user-detail/UserDetailError';
import UserDetailLoading from '@/components/user-detail/UserDetailLoading';

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile: currentUser } = useAuth();

  // Use the existing hook to fetch user profile data
  const { 
    userData, 
    loading, 
    buddyConnection, 
    approximateDistance,
    setBuddyConnection 
  } = useProfileData(userId, currentUser);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view user profiles",
      });
      navigate('/auth', { replace: true });
    }
  }, [user, navigate, toast]);

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <div className="max-w-3xl mx-auto p-4">
          <UserDetailLoading />
        </div>
      </div>
    );
  }

  // Show error state if user data not found
  if (!userData) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <div className="max-w-3xl mx-auto p-4">
          <UserDetailError />
        </div>
      </div>
    );
  }

  // Render user profile
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <div className="max-w-3xl mx-auto p-4">
        <UserDetailCard 
          userData={userData}
          userId={userId!}
          buddyConnection={buddyConnection}
          approximateDistance={approximateDistance}
          setBuddyConnection={setBuddyConnection}
        />
      </div>
    </div>
  );
};

export default UserDetail;
