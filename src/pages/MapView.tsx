import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Map from '@/components/Map';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/services/postService';
import { useToast } from '@/components/ui/use-toast';

const MapView: React.FC = () => {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState({ 
    lat: 45.5152, // Portland, OR coordinates
    lng: -122.6784 
  });
  const [expanded, setExpanded] = useState(true);

  // Try to get user's location if allowed
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
          // Keep the default location
        }
      );
    }
  }, []);

  // Query for posts
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['posts', currentLocation],
    queryFn: () => fetchPosts(
      currentLocation.lat,
      currentLocation.lng
    )
  });

  // Handle error separately with useEffect
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading map data",
        description: "Failed to load posts for the map view.",
        variant: "destructive",
      });
      console.error(error);
    }
  }, [error, toast]);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Full width header */}
      <Header />
      
      {/* Content area with ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col">
          <div className="p-4">
            <Link to="/" className="flex items-center text-sm text-muted-foreground mb-2 hover:text-foreground">
              <ChevronLeft size={16} className="mr-1" />
              Back to feed
            </Link>
            <h1 className="text-xl font-bold mb-4">Explore Locations</h1>
          </div>
          
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-destructive text-center">
                <p>Error loading map data</p>
                <p className="text-sm">Please try again later</p>
              </div>
            </div>
          ) : (
            /* Full-sized map */
            <div className="flex-grow relative mx-4 mb-4">
              <Map 
                posts={posts}
                currentLocation={currentLocation}
                expanded={expanded}
                onToggleExpand={handleToggleExpand}
              />
            </div>
          )}
        </div>
        
        {/* Right sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
      </div>
    </div>
  );
};

export default MapView;
