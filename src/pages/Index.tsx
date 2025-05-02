
import React, { useState, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import PostList from '@/components/PostList';
import PostFilters from '@/components/PostFilters';
import CreatePostButton from '@/components/CreatePostButton';
import OnboardingModal from '@/components/OnboardingModal';
import { toast } from '@/components/ui/use-toast';
import { fetchPosts } from '@/services/postService';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';
import { useIsMobile } from '@/hooks/use-mobile';

const POSTS_PER_PAGE = 10;

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 48.2082, lng: 16.3719 }); // Vienna, Austria
  const [filters, setFilters] = useState({
    radius: 50,
    autoRadius: true,
    categories: ['general', 'campsite', 'service', 'question'] as string[]
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

  // Use infinite query for posts with pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['posts', currentLocation, filters],
    queryFn: ({ pageParam = 1 }) => fetchPosts(
      currentLocation.lat,
      currentLocation.lng,
      filters.autoRadius ? undefined : filters.radius,
      filters.categories,
      pageParam,
      POSTS_PER_PAGE
    ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page had fewer posts than the limit, we've reached the end
      if (lastPage.length < POSTS_PER_PAGE) {
        return undefined;
      }
      return allPages.length + 1;
    }
  });

  // Flatten all pages of posts into a single array
  const posts = data?.pages.flatMap(page => page) || [];

  useEffect(() => {
    // Onboarding modal logic - show modal only if user doesn't have a pseudonym
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
    setFilters({
      radius: newFilters.radius,
      autoRadius: newFilters.autoRadius,
      categories: newFilters.categories,
    });
    toast({
      title: "Filters Applied",
      description: `Showing posts within ${newFilters.autoRadius ? 'automatic' : newFilters.radius + ' miles'} radius.`,
    });
  };

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    // Welcome toast is now shown in the OnboardingModal component after successful profile creation
  };

  return (
    <PageLayout showHeader={true}>
      {/* Main content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {isLocating ? (
          <div className="bg-primary/10 p-2 text-center text-sm">
            <span>Locating your position...</span>
          </div>
        ) : null}
        
        {/* Distance Filter at the top */}
        <div className="bg-background p-2 border-b">
          <PostFilters onFilterChange={handleFilterChange} />
        </div>
        
        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-destructive">
            <p>Error loading posts. Please try again later.</p>
            <button 
              onClick={() => fetchNextPage({ cancelRefetch: true })}
              className="mt-2 text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <PostList 
            posts={posts} 
            loading={isFetchingNextPage}
            hasMore={!!hasNextPage}
            onLoadMore={() => fetchNextPage()}
          />
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
