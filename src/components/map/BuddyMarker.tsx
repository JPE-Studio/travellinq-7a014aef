
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types';

interface BuddyMarkerProps {
  buddy: User;
  map: mapboxgl.Map;
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>;
}

const BuddyMarker: React.FC<BuddyMarkerProps> = ({ buddy, map, markersRef }) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const markerElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!map || !buddy.latitude || !buddy.longitude) return;

    // Create marker element
    if (!markerElementRef.current) {
      markerElementRef.current = document.createElement('div');
      markerElementRef.current.className = 'buddy-marker-container';

      // Style the container for the avatar
      markerElementRef.current.style.borderRadius = '50%';
      markerElementRef.current.style.border = '2px solid #EC4899';
      markerElementRef.current.style.backgroundColor = 'white';
      markerElementRef.current.style.padding = '1px';
      markerElementRef.current.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      markerElementRef.current.style.cursor = 'pointer';
      
      // Create avatar element inside marker
      const avatar = document.createElement('div');
      avatar.className = 'buddy-avatar';
      avatar.style.width = '32px';
      avatar.style.height = '32px';
      avatar.style.borderRadius = '50%';
      avatar.style.overflow = 'hidden';
      
      // Add avatar image or fallback
      if (buddy.avatar) {
        const img = document.createElement('img');
        img.src = buddy.avatar;
        img.alt = buddy.pseudonym;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        avatar.appendChild(img);
      } else {
        // Fallback with initials
        avatar.style.backgroundColor = '#f1f5f9';
        avatar.style.display = 'flex';
        avatar.style.justifyContent = 'center';
        avatar.style.alignItems = 'center';
        avatar.style.color = '#64748b';
        avatar.style.fontWeight = 'bold';
        avatar.style.fontSize = '14px';
        avatar.textContent = buddy.pseudonym.substring(0, 2).toUpperCase();
      }
      
      markerElementRef.current.appendChild(avatar);
    }
    
    // Create marker with custom element
    const marker = new mapboxgl.Marker({
      element: markerElementRef.current,
      anchor: 'bottom',
    })
    .setLngLat([buddy.longitude, buddy.latitude])
    .addTo(map);
    
    // Add popup with buddy name
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      className: 'buddy-popup'
    })
    .setHTML(`
      <div class="p-2">
        <p class="font-semibold">${buddy.pseudonym}</p>
        <p class="text-xs text-gray-600">Buddy</p>
      </div>
    `);
    
    marker.setPopup(popup);
    markersRef.current.push(marker);
    markerRef.current = marker;
    
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [buddy, map, markersRef]);

  return null;
};

export default BuddyMarker;
