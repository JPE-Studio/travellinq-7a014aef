
import React from 'react';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const MapView: React.FC = () => {
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
          
          {/* Map placeholder */}
          <div className="flex-grow relative bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Map functionality has been removed</p>
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
