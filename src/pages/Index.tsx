import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Map from '@/components/Map';
import PostList from '@/components/PostList';
import PostFilters from '@/components/PostFilters';
import CreatePostButton from '@/components/CreatePostButton';
import OnboardingModal from '@/components/OnboardingModal';
import { toast } from '@/components/ui/use-toast';
import { Post } from '@/types';
import { fetchPosts } from '@/services/postService';

const Index: React.FC = () => {
  const [mapExpanded, setMapExpanded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 45.5152, lng: -122.6784 });
  const [filters, setFilters] = useState({
    radius: 50,
    autoRadius: true,
    categories: ['general', 'campsite', 'service', 'question'],
  });

  // Query for posts with filters
  const { 
    data: posts = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['posts', currentLocation, filters],
    queryFn: () => fetchPosts(
      currentLocation.lat,
      currentLocation.lng,
      filters.autoRadius ? undefined : filters.radius,
      filters.categories
    )
  });

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('travellinq-onboarding-completed');
    if (hasCompletedOnboarding === 'true') {
      setShowOnboarding(false);
    }
    
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          // Keep default location
        }
      );
    }
    
    // Mock notification for nearby friend
    const timer = setTimeout(() => {
      const friendNearby = localStorage.getItem('friend-notification-shown');
      if (!friendNearby) {
        toast({
          title: "Connection Nearby!",
          description: "Alex is within 5 miles of your location.",
        });
        localStorage.setItem('friend-notification-shown', 'true');
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (newFilters: {
    radius: number;
    autoRadius: boolean;
    categories: string[];
  }) => {
    setFilters(newFilters);
    toast({
      title: "Filters Applied",
      description: `Showing posts within ${newFilters.autoRadius ? 'automatic' : newFilters.radius + ' miles'} radius.`,
    });
  };

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
    <div className="min-h-screen flex flex-col w-full bg-background overflow-hidden">
      {/* Full width header */}
      <Header />
      
      {/* Content area with potential ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col overflow-hidden pb-safe">
          <Map 
            posts={posts}
            currentLocation={currentLocation}
            expanded={mapExpanded}
            onToggleExpand={handleToggleMapExpand}
          />
          
          {/* Filters */}
          <div className="bg-background border-b p-2 flex justify-end">
            <PostFilters onFilterChange={handleFilterChange} />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-destructive">
              <p>Error loading posts. Please try again later.</p>
              <button 
                onClick={() => refetch()}
                className="mt-2 text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <PostList posts={posts} />
          )}
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
