
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Map from '@/components/Map';
import PostList from '@/components/PostList';
import PostFilters from '@/components/PostFilters';
import CreatePostButton from '@/components/CreatePostButton';
import OnboardingModal from '@/components/OnboardingModal';
import { toast } from '@/components/ui/use-toast';
import { fetchPosts } from '@/services/postService';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 45.5152, lng: -122.6784 });
  const [filters, setFilters] = useState({
    radius: 50,
    autoRadius: true,
    categories: ['general', 'campsite', 'service', 'question'],
  });
  const [isLocating, setIsLocating] = useState(false);

  const { user, profile } = useAuth();

  // Get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.log('Error getting location:', error);
          setIsLocating(false);
          // Keep using default location
        }
      );
    }
  }, []);

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
    // Onboarding modal logic
    if (user && (!profile || !profile.pseudonym || profile.pseudonym === '')) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
    
    // Friend nearby notification
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
  }, [user, profile]);

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
    toast({
      title: "Willkommen bei Travellinq!",
      description: "Dein Profil wurde erfolgreich erstellt.",
    });
  };

  const handleToggleMapExpand = () => {
    setMapExpanded(!mapExpanded);
  };

  const handleToggleMapFullscreen = () => {
    setMapFullscreen(!mapFullscreen);
    // When entering or exiting fullscreen, we want to update the map
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  // If map is in fullscreen mode, only show the map
  if (mapFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex-grow relative">
          <Map 
            posts={posts}
            currentLocation={currentLocation}
            expanded={mapExpanded}
            onToggleExpand={handleToggleMapExpand}
            fullscreen={mapFullscreen}
            onToggleFullscreen={handleToggleMapFullscreen}
          />
        </div>
        {/* Always show bottom navigation in fullscreen mode on mobile */}
        <div className="md:hidden">
          <div className="h-16"></div> {/* Spacer for the bottom navigation */}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <PageLayout showHeader={true}>
      {/* Main content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {isLocating ? (
          <div className="bg-primary/10 p-2 text-center text-sm">
            <span>Locating your position...</span>
          </div>
        ) : null}
        
        <Map 
          posts={posts}
          currentLocation={currentLocation}
          expanded={mapExpanded}
          onToggleExpand={handleToggleMapExpand}
          fullscreen={mapFullscreen}
          onToggleFullscreen={handleToggleMapFullscreen}
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
      
      <CreatePostButton />
      
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={handleCompleteOnboarding} 
      />
    </PageLayout>
  );
};

export default Index;
