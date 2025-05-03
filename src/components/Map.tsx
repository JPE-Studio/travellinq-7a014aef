
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
  const mapHeight = fullscreen ? 'h-full' : isMobile && expanded ? 'h-full' : expanded ? 'h-96' : 'h-48';
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const {
    toast
  } = useToast();
  const boundsSetRef = useRef(false);
  // Track if map initialization has been attempted to prevent repeated attempts
  const mapInitializedRef = useRef(false);

  // Load token from localStorage or use default (only once)
  useEffect(() => {
    // Initialize with the saved token or the provided default
    const savedToken = localStorage.getItem(MAPBOX_TOKEN_KEY) || DEFAULT_MAPBOX_TOKEN;
    if (savedToken) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, savedToken); // Ensure it's saved
      setMapboxToken(savedToken);
    }
  }, []);

  // Initialize map once when component mounts and token is available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current || mapInitializedRef.current) return;

    // Mark that we've attempted to initialize the map
    mapInitializedRef.current = true;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 12
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
        variant: "destructive"
      });
    }

    // Cleanup on unmount only
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, [mapboxToken]); // Only depends on mapboxToken

  // Update markers when posts change or map becomes ready
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add a marker for current location
    const currentLocationMarker = new mapboxgl.Marker({
      color: '#3FB1CE'
    }).setLngLat([currentLocation.lng, currentLocation.lat]).addTo(map.current);
    markersRef.current.push(currentLocationMarker);

    // Create bounds object to fit all markers
    const bounds = new mapboxgl.LngLatBounds();

    // Include current location in bounds
    bounds.extend([currentLocation.lng, currentLocation.lat]);

    // Add markers for posts with valid location data
    const validPosts = posts.filter(post => post.location && !isNaN(post.location.lat) && !isNaN(post.location.lng));
    validPosts.forEach(post => {
      if (post.location) {
        // Determine marker color based on category
        let color = '#2E5E4E'; // Default forest green
        if (post.category === 'campsite') color = '#3A7D44';
        if (post.category === 'service') color = '#D5A021';
        if (post.category === 'question') color = '#61A8FF';

        // Add marker for this post without popup
        const marker = new mapboxgl.Marker({
          color
        }).setLngLat([post.location.lng, post.location.lat]).addTo(map.current);
        markersRef.current.push(marker);

        // Add to bounds
        bounds.extend([post.location.lng, post.location.lat]);
      }
    });

    // Fit map to bounds if we have posts to show and bounds haven't been set
    if (validPosts.length > 0 && !boundsSetRef.current && map.current) {
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
      setTimeout(() => {
        map.current?.resize();
      }, 100);
    }
  }, [expanded, fullscreen, mapLoaded]);

  // Handle drastic current location change (like first load) by updating the map center
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setCenter([currentLocation.lng, currentLocation.lat]);
    }
  }, [currentLocation, mapLoaded]);

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
            variant="secondary" 
            size="sm" 
            className="bg-card/80 backdrop-blur-sm"
            onClick={onToggleFullscreen}
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Map;
