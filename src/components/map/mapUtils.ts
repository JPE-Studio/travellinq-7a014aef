
import mapboxgl from 'mapbox-gl';
import { Post, User } from '@/types';

// Function to add markers to the map
export const addMarkersToMap = (
  map: mapboxgl.Map, 
  posts: Post[], 
  currentLocation: {lat: number, lng: number},
  buddies: User[] = [],
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>
): mapboxgl.LngLatBounds => {
  // Clear previous markers
  markersRef.current.forEach(marker => marker.remove());
  markersRef.current = [];

  // Create bounds object to fit all markers
  const bounds = new mapboxgl.LngLatBounds();

  // Add a marker for current location
  const currentLocationMarker = new mapboxgl.Marker({
    color: '#3FB1CE'
  }).setLngLat([currentLocation.lng, currentLocation.lat]).addTo(map);
  markersRef.current.push(currentLocationMarker);

  // Include current location in bounds
  bounds.extend([currentLocation.lng, currentLocation.lat]);

  // Add markers for posts with valid location data
  const validPosts = posts.filter(post => post.locationLat && post.locationLng && !isNaN(post.locationLat) && !isNaN(post.locationLng));
  validPosts.forEach(post => {
    // Determine marker color based on category
    let color = '#2E5E4E'; // Default forest green
    if (post.category === 'campsite') color = '#3A7D44';
    if (post.category === 'service') color = '#D5A021';
    if (post.category === 'question') color = '#61A8FF';

    // Add marker for this post without popup
    const marker = new mapboxgl.Marker({
      color
    }).setLngLat([post.locationLng, post.locationLat]).addTo(map);
    markersRef.current.push(marker);

    // Add to bounds
    bounds.extend([post.locationLng, post.locationLat]);
  });
  
  // Add markers for buddies with location data
  buddies.forEach(buddy => {
    if (buddy.latitude && buddy.longitude) {
      // Use a distinctive color for buddy markers
      const buddyMarker = new mapboxgl.Marker({
        color: '#EC4899', // Pink color for buddies
        scale: 0.9
      })
      .setLngLat([buddy.longitude, buddy.latitude])
      .addTo(map);
      
      // Add popup with buddy name
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div class="p-2">
            <p class="font-semibold">${buddy.pseudonym}</p>
            <p class="text-xs text-gray-600">Buddy</p>
          </div>
        `);
        
      buddyMarker.setPopup(popup);
      markersRef.current.push(buddyMarker);
      
      // Add to bounds
      bounds.extend([buddy.longitude, buddy.latitude]);
    }
  });

  return bounds;
};

// Function to initialize the map
export const initializeMap = (
  mapContainer: HTMLDivElement,
  mapboxToken: string,
  center: [number, number]
): mapboxgl.Map => {
  mapboxgl.accessToken = mapboxToken;
  
  const newMap = new mapboxgl.Map({
    container: mapContainer,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: center,
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
  
  // Auto-trigger geolocation after map loads
  newMap.once('load', () => {
    setTimeout(() => {
      geolocate.trigger();
    }, 1000);
  });

  return newMap;
};
