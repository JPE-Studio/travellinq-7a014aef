
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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

const MAPBOX_TOKEN_KEY = 'mapbox_token';
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoianBlLXN0dWRpbyIsImEiOiJjbWE2a2hwcjgwcWRlMmlzNjlsdGhqMWN3In0.DeZp50DLkrA8eI1AQs778w';

const Map: React.FC<MapProps> = ({ posts, currentLocation, expanded, onToggleExpand }) => {
  const mapHeight = expanded ? 'h-96' : 'h-48';
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 12,
      });

      // Add navigation controls
      newMap.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      newMap.on('load', () => {
        setMapLoaded(true);
      });

      map.current = newMap;
    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
    }

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, currentLocation]);

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

    // Add markers for posts
    posts.forEach(post => {
      if (post.location) {
        // Create a popup with post info
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <h3 class="font-semibold">${post.category}</h3>
            <p class="text-sm">${post.text.substring(0, 100)}${post.text.length > 100 ? '...' : ''}</p>
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
      }
    });
  }, [posts, mapLoaded, currentLocation]);

  // Resize map when expanded state changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.resize();
    }
  }, [expanded, mapLoaded]);

  return (
    <div className={`relative ${mapHeight} rounded-md overflow-hidden transition-all duration-300 ease-in-out`}>
      {!mapboxToken ? (
        <div className="text-muted-foreground text-center p-4 bg-muted h-full flex items-center justify-center">
          <p>Loading map...</p>
        </div>
      ) : (
        <div ref={mapContainer} className="h-full w-full" />
      )}
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
