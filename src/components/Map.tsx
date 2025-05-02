
import React, { useEffect } from 'react';
import { Post } from '@/types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for leaflet marker icons
// This is needed because leaflet's assets are not properly loaded in React
useEffect(() => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}, []);

interface MapProps {
  posts: Post[];
  currentLocation: {
    lat: number;
    lng: number;
  };
  expanded: boolean;
  onToggleExpand: () => void;
}

const Map: React.FC<MapProps> = ({ posts, currentLocation, expanded, onToggleExpand }) => {
  const zoomLevel = expanded ? 13 : 10;
  const mapHeight = expanded ? 'h-96' : 'h-48';

  return (
    <div className={`relative ${mapHeight} rounded-md overflow-hidden`}>
      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={zoomLevel}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {posts.map(post => (
          <Marker
            key={post.id}
            position={[post.location.lat, post.location.lng]}
          >
            <Popup>
              <b>{post.author.pseudonym}</b>
              <br />
              {post.text.substring(0, 50)}...
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <button
        className="absolute bottom-2 right-2 bg-card text-foreground p-2 rounded-md shadow-md hover:bg-muted transition-colors z-10"
        onClick={onToggleExpand}
      >
        {expanded ? 'Collapse Map' : 'Expand Map'}
      </button>
    </div>
  );
};

export default Map;
