
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Map from '@/components/Map';
import PostList from '@/components/PostList';
import PostFilters from '@/components/PostFilters';
import CreatePostButton from '@/components/CreatePostButton';
import OnboardingModal from '@/components/OnboardingModal';
import { mockPosts } from '@/data/mockData';
import { toast } from '@/components/ui/use-toast';
import { Post } from '@/types';

const Index: React.FC = () => {
  const [mapExpanded, setMapExpanded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 45.5152, lng: -122.6784 });
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(mockPosts);
  const [filters, setFilters] = useState({
    radius: 50,
    autoRadius: true,
    categories: ['general', 'campsite', 'service', 'question'],
  });

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('travellinq-onboarding-completed');
    if (hasCompletedOnboarding === 'true') {
      setShowOnboarding(false);
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

  useEffect(() => {
    // Filter posts based on selected filters
    const filtered = mockPosts.filter(post => {
      // Filter by category
      if (!filters.categories.includes(post.category)) {
        return false;
      }
      
      // Filter by radius (if not auto)
      if (!filters.autoRadius && post.distance && post.distance > filters.radius) {
        return false;
      }
      
      return true;
    });
    
    setFilteredPosts(filtered);
  }, [filters]);

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
    <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
      {/* Full width header */}
      <Header />
      
      {/* Content area with potential ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col overflow-x-hidden">
          <Map 
            posts={filteredPosts}
            currentLocation={currentLocation}
            expanded={mapExpanded}
            onToggleExpand={handleToggleMapExpand}
          />
          
          {/* Filters */}
          <div className="bg-background border-b p-2 flex justify-end">
            <PostFilters onFilterChange={handleFilterChange} />
          </div>
          
          <PostList posts={filteredPosts} />
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
