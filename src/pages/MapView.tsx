
import React, { useState, useEffect, useRef } from 'react';
import Map from '@/components/Map';
import { ChevronLeft, AlertCircle, Locate } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/services/postService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/PageLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { getBuddyIds } from '@/services/buddyConnectionQueries';
import { fetchBuddiesLocationData } from '@/services/userService';
import { User } from '@/types';

const MapView: React.FC = () => {
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const [currentLocation, setCurrentLocation] = useState({
    lat: 48.2082,
    // Vienna, Austria coordinates as default
    lng: 16.3719
  });
  const [expanded, setExpanded] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const locationInitializedRef = useRef(false);

  // Try to get user's location only once when component mounts
  useEffect(() => {
    if (!locationInitializedRef.current) {
      locationInitializedRef.current = true;
      getUserLocation();
    }
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(position => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      }, error => {
        console.log('Error getting location:', error);
        toast({
          title: "Location error",
          description: "We couldn't access your location. Using default location instead.",
          variant: "destructive"
        });
        setIsLocating(false);
        // Keep the default location
      });
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
    }
  };

  // Query for posts - use staleTime to prevent frequent refetching
  const {
    data: posts = [],
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ['posts', currentLocation],
    queryFn: () => fetchPosts(currentLocation.lat, currentLocation.lng),
    staleTime: 5 * 60 * 1000, // 5 minutes before considering data stale
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false // Don't refetch when component remounts
  });
  
  // Query for buddy IDs
  const {
    data: buddyIds = [],
    isLoading: isLoadingBuddyIds,
  } = useQuery({
    queryKey: ['buddyIds'],
    queryFn: getBuddyIds,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  // Query for buddy location data
  const {
    data: buddies = [],
    isLoading: isLoadingBuddies,
    error: buddiesError
  } = useQuery({
    queryKey: ['buddyLocations', buddyIds],
    queryFn: () => fetchBuddiesLocationData(buddyIds),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: buddyIds.length > 0, // Only run this query if we have buddy IDs
  });

  // Handle error separately with useEffect
  useEffect(() => {
    if (postsError) {
      toast({
        title: "Error loading map data",
        description: "Failed to load posts for the map view.",
        variant: "destructive"
      });
      console.error(postsError);
    }
    
    if (buddiesError) {
      toast({
        title: "Error loading buddy data",
        description: "Failed to load buddy location data.",
        variant: "destructive"
      });
      console.error(buddiesError);
    }
  }, [postsError, buddiesError, toast]);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleToggleFullscreen = () => {
    setFullscreen(!fullscreen);
    // When entering or exiting fullscreen, we want to update the map
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  // If in fullscreen mode, only show the map
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex-grow relative">
          <Map 
            posts={posts} 
            currentLocation={currentLocation} 
            expanded={expanded} 
            onToggleExpand={handleToggleExpand} 
            fullscreen={fullscreen} 
            onToggleFullscreen={handleToggleFullscreen}
            buddies={buddies}
          />
        </div>
        {/* Always show bottom navigation in fullscreen mode */}
        <div className="md:hidden">
          <div className="h-16"></div> {/* Spacer for the bottom navigation */}
        </div>
      </div>
    );
  }

  // Show loading state while fetching data
  const isLoading = isLoadingPosts || isLoadingBuddyIds || isLoadingBuddies;
  const error = postsError || buddiesError;

  return (
    <PageLayout>
      <div className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Explore Locations</h1>
        </div>
        {buddies.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {buddies.length} {buddies.length === 1 ? 'buddy' : 'buddies'} on map
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <div className="text-destructive text-center mb-4">
            <p className="font-semibold mb-1">Error loading map data</p>
            <p className="text-sm">Please try again later</p>
          </div>
          <Button onClick={() => refetchPosts()} variant="outline">
            Retry
          </Button>
        </div>
      ) : (
        /* Full-sized map with proper mobile handling */
        <div className={`flex-grow relative mx-4 mb-4 ${isMobile ? 'h-[calc(100vh-180px)]' : ''}`}>
          <Map 
            posts={posts} 
            currentLocation={currentLocation} 
            expanded={expanded} 
            onToggleExpand={handleToggleExpand} 
            fullscreen={fullscreen} 
            onToggleFullscreen={handleToggleFullscreen}
            buddies={buddies}
          />
        </div>
      )}

      {/* Post count indicator */}
      {!isLoading && !error && (
        <div className="text-center text-sm text-muted-foreground mb-4">
          Showing {posts.length} {posts.length === 1 ? 'post' : 'posts'} on the map
        </div>
      )}
    </PageLayout>
  );
};

export default MapView;
