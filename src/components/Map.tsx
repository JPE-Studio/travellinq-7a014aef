import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Post } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
}

const MAPBOX_TOKEN_KEY = 'mapbox_token';
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoianBlLXN0dWRpbyIsImEiOiJjbWE2a2hwcjgwcWRlMmlzNjlsdGhqMWN3In0.DeZp50DLkrA8eI1AQs778w';

const Map: React.FC<MapProps> = ({ 
  posts, 
  currentLocation, 
  expanded, 
  onToggleExpand,
  fullscreen = false,
  onToggleFullscreen
}) => {
  const isMobile = useIsMobile();
  
  // Dynamic height based on state and device
  const mapHeight = fullscreen 
    ? 'h-full' 
    : (isMobile && expanded)
      ? 'h-full'
      : expanded 
        ? 'h-96' 
        : 'h-48';

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();
  const boundsSetRef = useRef(false);

  // Load token from localStorage or use default
  useEffect(() => {
    // Initialize with the saved token or the provided default
    const savedToken = localStorage.getItem(MAPBOX_TOKEN_KEY) || DEFAULT_MAPBOX_TOKEN;
    
    if (savedToken) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, savedToken); // Ensure it's saved
      setMapboxToken(savedToken);
    }
  }, []);

  // Clear markers when component unmounts or posts change
  useEffect(() => {
    return () => {
      // Remove all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [posts]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [currentLocation.lng, currentLocation.lat], // Will use Vienna coordinates from props
        zoom: 12,
      });

      // Add navigation controls
      newMap.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });
      
      newMap.addControl(geolocate, 'top-right');

      newMap.on('load', () => {
        setMapLoaded(true);
        // Attempt to automatically locate user once map is loaded
        setTimeout(() => {
          geolocate.trigger();
        }, 1000);
      });

      map.current = newMap;
    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
      toast({
        title: "Map Error",
        description: "Failed to initialize map. Please try again.",
        variant: "destructive",
      });
    }

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, currentLocation, toast]);

  // Add markers when map is ready and posts change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add a marker for current location
    const currentLocationMarker = new mapboxgl.Marker({ color: '#3FB1CE' })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .addTo(map.current);
    
    markersRef.current.push(currentLocationMarker);

    // Create bounds object to fit all markers
    const bounds = new mapboxgl.LngLatBounds();
    
    // Include current location in bounds
    bounds.extend([currentLocation.lng, currentLocation.lat]);

    // Add markers for posts with valid location data
    const validPosts = posts.filter(post => post.location && !isNaN(post.location.lat) && !isNaN(post.location.lng));
    
    validPosts.forEach(post => {
      if (post.location) {
        // Create a popup with post info
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${post.category}</h3>
              <p class="text-sm">${post.text.substring(0, 100)}${post.text.length > 100 ? '...' : ''}</p>
              <a href="/post/${post.id}" class="text-xs text-blue-500 hover:underline">View details</a>
            </div>
          `);

        // Determine marker color based on category
        let color = '#2E5E4E'; // Default forest green
        if (post.category === 'campsite') color = '#3A7D44';
        if (post.category === 'service') color = '#D5A021';
        if (post.category === 'question') color = '#61A8FF';

        // Add marker for this post
        const marker = new mapboxgl.Marker({ color })
          .setLngLat([post.location.lng, post.location.lat])
          .setPopup(popup)
          .addTo(map.current);
        
        markersRef.current.push(marker);
        
        // Add to bounds
        bounds.extend([post.location.lng, post.location.lat]);
      }
    });
    
    // Fit map to bounds if we have posts to show and bounds haven't been set
    if (validPosts.length > 0 && !boundsSetRef.current) {
      map.current.fitBounds(bounds, {
        padding: 70,
        maxZoom: 15
      });
      boundsSetRef.current = true;
    }
  }, [posts, mapLoaded, currentLocation]);

  // Resize map when expanded state or fullscreen state changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.resize();
    }
  }, [expanded, fullscreen, mapLoaded]);

  // Calculate z-index based on fullscreen state
  const zIndex = fullscreen ? 'z-50' : 'z-10';

  return (
    <div className={`relative ${mapHeight} rounded-md overflow-hidden transition-all duration-300 ease-in-out w-full ${fullscreen ? `fixed inset-0 ${zIndex} bg-background` : ''}`}>
      {!mapboxToken ? (
        <div className="text-muted-foreground text-center p-4 bg-muted h-full flex items-center justify-center">
          <p>Loading map...</p>
        </div>
      ) : (
        <div ref={mapContainer} className="h-full w-full" />
      )}
      
      <div className="absolute bottom-2 right-2 flex gap-2 z-10">
        {onToggleFullscreen && (
          <Button
            variant="outline"
            size="icon"
            className="bg-card text-foreground rounded-md shadow-md hover:bg-muted transition-colors"
            onClick={onToggleFullscreen}
          >
            {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="bg-card text-foreground rounded-md shadow-md hover:bg-muted transition-colors"
          onClick={onToggleExpand}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
    </div>
  );
};

export default Map;
