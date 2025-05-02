import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import { Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/services/postService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/PageLayout';

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
  const { data: posts = [], isLoading, error, refetch } = useQuery({
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
    <PageLayout>
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
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <div className="text-destructive text-center mb-4">
            <p className="font-semibold mb-1">Error loading map data</p>
            <p className="text-sm">Please try again later</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
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
    </PageLayout>
  );
};

export default MapView;
