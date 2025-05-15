
import React from 'react';
import { User, Post } from '@/types';

interface MapLegendProps {
  posts: Post[];
  buddies?: User[];
}

const MapLegend: React.FC<MapLegendProps> = ({ posts, buddies = [] }) => {
  if (posts.length === 0 && buddies.length === 0) {
    return null;
  }
  
  return (
    <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm rounded-md p-2 text-xs z-10">
      <div className="flex items-center space-x-2 mb-1">
        <div className="w-3 h-3 rounded-full bg-[#3FB1CE]"></div>
        <span>Your location</span>
      </div>
      {posts.length > 0 && (
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#2E5E4E]"></div>
          <span>Posts</span>
        </div>
      )}
      {buddies?.length > 0 && (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#EC4899]"></div>
          <span>Buddies</span>
        </div>
      )}
    </div>
  );
};

export default MapLegend;
