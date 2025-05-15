
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Post, User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { initializeMap, addMarkersToMap } from '@/components/map/mapUtils';

const MAPBOX_TOKEN_KEY = 'mapbox_token';
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoianBlLXN0dWRpbyIsImEiOiJjbWE2a2hwcjgwcWRlMmlzNjlsdGhqMWN3In0.DeZp50DLkrA8eI1AQs778w';

export const useMap = (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  currentLocation: {lat: number, lng: number},
  posts: Post[],
  buddies: User[] = []
) => {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const mapInitializedRef = useRef(false);
  const boundsSetRef = useRef(false);
  const { toast } = useToast();

  // Load token from localStorage or use default
  useEffect(() => {
    const savedToken = localStorage.getItem(MAPBOX_TOKEN_KEY) || DEFAULT_MAPBOX_TOKEN;
    if (savedToken) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, savedToken); // Ensure it's saved
      setMapboxToken(savedToken);
    }
  }, []);

  // Initialize map once when component mounts and token is available
  useEffect(() => {
    if (!mapContainerRef.current || !mapboxToken || map.current || mapInitializedRef.current) return;

    // Mark that we've attempted to initialize the map
    mapInitializedRef.current = true;

    try {
      const newMap = initializeMap(
        mapContainerRef.current,
        mapboxToken,
        [currentLocation.lng, currentLocation.lat]
      );
      
      newMap.on('load', () => {
        setMapLoaded(true);
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

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, [mapboxToken, currentLocation, toast, mapContainerRef]);

  // Update markers when posts change or map becomes ready
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Add markers and calculate bounds
    const bounds = addMarkersToMap(
      map.current, 
      posts, 
      currentLocation, 
      buddies,
      markersRef
    );

    // Fit map to bounds if we have posts or buddies to show and bounds haven't been set
    const hasValidMarkers = 
      posts.some(post => post.locationLat && post.locationLng) || 
      buddies.some(b => b.latitude && b.longitude);
      
    if (hasValidMarkers && !boundsSetRef.current && map.current) {
      map.current.fitBounds(bounds, {
        padding: 70,
        maxZoom: 15
      });
      boundsSetRef.current = true;
    }
  }, [posts, buddies, mapLoaded, currentLocation]);

  // Handle map resize and center updates
  const handleMapResize = () => {
    if (map.current && mapLoaded) {
      setTimeout(() => map.current?.resize(), 100);
    }
  };

  const updateMapCenter = () => {
    if (map.current && mapLoaded) {
      map.current.setCenter([currentLocation.lng, currentLocation.lat]);
    }
  };

  return {
    map: map.current,
    mapLoaded,
    mapboxToken,
    handleMapResize,
    updateMapCenter,
    markersRef
  };
};
