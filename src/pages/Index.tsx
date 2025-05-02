
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Map from '@/components/Map';
import PostList from '@/components/PostList';
import CreatePostButton from '@/components/CreatePostButton';
import OnboardingModal from '@/components/OnboardingModal';
import { mockPosts } from '@/data/mockData';
import { toast } from '@/components/ui/use-toast';

const Index: React.FC = () => {
  const [mapExpanded, setMapExpanded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 45.5152, lng: -122.6784 });

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('travellinq-onboarding-completed');
    if (hasCompletedOnboarding === 'true') {
      setShowOnboarding(false);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('travellinq-onboarding-completed', 'true');
    toast({
      title: "Welcome to Travellinq!",
      description: "Your account has been created successfully.",
    });
  };

  const handleToggleMapExpand = () => {
    setMapExpanded(!mapExpanded);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Full width header */}
      <Header />
      
      {/* Content area with potential ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col">
          <Map 
            posts={mockPosts}
            currentLocation={currentLocation}
            expanded={mapExpanded}
            onToggleExpand={handleToggleMapExpand}
          />
          
          <PostList posts={mockPosts} />
        </div>
        
        {/* Right sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
      </div>
      
      <CreatePostButton />
      
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={handleCompleteOnboarding} 
      />
    </div>
  );
};

export default Index;
