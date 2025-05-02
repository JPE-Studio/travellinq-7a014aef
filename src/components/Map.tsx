
import React from 'react';
import { Post } from '@/types';

interface MapProps {
  posts: Post[];
  currentLocation: {
    lat: number;
    lng: number;
  };
  expanded: boolean;
  onToggleExpand: () => void;
}

const Map: React.FC<MapProps> = ({ expanded, onToggleExpand }) => {
  const mapHeight = expanded ? 'h-96' : 'h-48';

  return (
    <div className={`relative ${mapHeight} bg-muted rounded-md overflow-hidden flex items-center justify-center`}>
      <div className="text-muted-foreground text-center p-4">
        <p>Map functionality has been removed</p>
      </div>
      <button
        className="absolute bottom-2 right-2 bg-card text-foreground p-2 rounded-md shadow-md hover:bg-muted transition-colors z-10"
        onClick={onToggleExpand}
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
  );
};

export default Map;
