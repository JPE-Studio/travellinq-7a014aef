
import React, { useState } from 'react';
import Header from '@/components/Header';
import Map from '@/components/Map';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/services/postService';

const MapView: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState({ 
    lat: 45.5152, // Portland, OR coordinates
    lng: -122.6784 
  });

  // Query for posts
  const { data: posts = [] } = useQuery({
    queryKey: ['posts', currentLocation],
    queryFn: () => fetchPosts(
      currentLocation.lat,
      currentLocation.lng
    )
  });

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
          
          {/* Full-sized map */}
          <div className="flex-grow relative mx-4 mb-4">
            <Map 
              posts={posts}
              currentLocation={currentLocation}
              expanded={true}
              onToggleExpand={() => {}}
            />
          </div>
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
