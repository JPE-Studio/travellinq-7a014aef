
import React, { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Post, User } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMap } from '@/hooks/use-map';
import MapLegend from './map/MapLegend';
import MapControls from './map/MapControls';
import BuddyMarker from './map/BuddyMarker';

interface MapProps {
  posts: Post[];
  currentLocation: {
    lat: number;
    lng: number;
  };
  expanded: boolean;
  onToggleExpand: () => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  buddies?: User[];
}

const Map: React.FC<MapProps> = ({
  posts,
  currentLocation,
  expanded,
  onToggleExpand,
  fullscreen = false,
  onToggleFullscreen,
  buddies = []
}) => {
  const isMobile = useIsMobile();
  const mapContainer = useRef<HTMLDivElement>(null);
  
  // Dynamic height based on state and device
  const mapHeight = fullscreen ? 'h-full' : isMobile && expanded ? 'h-full' : expanded ? 'h-96' : 'h-48';
  
  // Use our custom hook for map functionality
  const { map, mapLoaded, mapboxToken, handleMapResize, updateMapCenter, markersRef } = useMap(
    mapContainer,
    currentLocation,
    posts,
    buddies
  );

  // Resize map when expanded state or fullscreen state changes
  useEffect(() => {
    handleMapResize();
  }, [expanded, fullscreen]);

  // Handle drastic current location change by updating the map center
  useEffect(() => {
    updateMapCenter();
  }, [currentLocation]);

  // Calculate z-index based on fullscreen state
  const zIndex = fullscreen ? 'z-50' : 'z-10';

  return (
    <div className={`relative ${mapHeight} rounded-md overflow-hidden transition-all duration-300 ease-in-out w-full ${fullscreen ? `fixed inset-0 ${zIndex} bg-background` : ''}`}>
      {!mapboxToken ? (
        <div className="text-muted-foreground text-center p-4 bg-muted h-full flex items-center justify-center">
          <p>Loading map...</p>
        </div>
      ) : (
        <>
          <div ref={mapContainer} className="h-full w-full" />
          
          {/* Render buddy markers */}
          {mapLoaded && map && buddies.map(buddy => (
            buddy.latitude && buddy.longitude ? (
              <BuddyMarker 
                key={buddy.id} 
                buddy={buddy} 
                map={map} 
                markersRef={markersRef} 
              />
            ) : null
          ))}
        </>
      )}
      
      <MapControls 
        fullscreen={fullscreen} 
        onToggleFullscreen={onToggleFullscreen} 
      />
      
      <MapLegend posts={posts} buddies={buddies} />
    </div>
  );
};

export default Map;
