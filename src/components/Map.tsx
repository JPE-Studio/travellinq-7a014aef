
import React from 'react';
import { Post } from '../types';
import { MapPin } from 'lucide-react';

interface MapProps {
  posts: Post[];
  currentLocation: { lat: number, lng: number };
  expanded: boolean;
  onToggleExpand: () => void;
}

const Map: React.FC<MapProps> = ({ posts, currentLocation, expanded, onToggleExpand }) => {
  return (
    <div className={`relative transition-all duration-300 ${expanded ? 'h-[60vh]' : 'h-[30vh]'}`}>
      <div className="absolute top-0 left-0 w-full h-full bg-muted rounded-b-lg overflow-hidden">
        {/* Placeholder for actual map integration */}
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center">
          {/* Markers for posts */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="map-marker bg-forest animate-pulse-light" />
          </div>
          {posts.map((post) => {
            // Calculate relative position - simplistic approach for demo
            const offsetX = (post.location.lng - currentLocation.lng) * 100;
            const offsetY = (currentLocation.lat - post.location.lat) * 100;
            
            return (
              <div 
                key={post.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  top: `calc(50% + ${offsetY}px)`, 
                  left: `calc(50% + ${offsetX}px)` 
                }}
              >
                <div className={`map-marker ${post.category === 'campsite' ? 'bg-earth' : 'bg-sky'}`} />
              </div>
            );
          })}
        </div>
        
        {/* Map controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
            <MapPin size={20} className="text-forest" />
          </button>
          <button onClick={onToggleExpand} className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
            {expanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-forest">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-forest">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Map;
