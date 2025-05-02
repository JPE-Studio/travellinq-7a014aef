
import React from 'react';
import { Post } from '@/types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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
        center={currentLocation}
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
