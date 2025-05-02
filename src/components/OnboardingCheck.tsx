
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingModal from './OnboardingModal';

const OnboardingCheck: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    // Show onboarding if:
    // 1. User is logged in
    // 2. AND either profile doesn't exist OR username is auto-generated (starts with user_)
    // 3. OR username is missing or too short (less than 3 characters)
    const needsOnboarding = user && 
      (!profile || 
       !profile.pseudonym || 
       profile.pseudonym.startsWith('user_') ||
       profile.pseudonym.length < 3);
    
    setShowOnboarding(!!needsOnboarding);
  }, [user, profile, loading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <OnboardingModal 
      isOpen={showOnboarding} 
      onComplete={handleOnboardingComplete} 
    />
  );
};

export default OnboardingCheck;
