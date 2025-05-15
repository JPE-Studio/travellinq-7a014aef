
import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

interface MapControlsProps {
  fullscreen: boolean;
  onToggleFullscreen?: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ fullscreen, onToggleFullscreen }) => {
  if (!onToggleFullscreen) return null;
  
  return (
    <div className="absolute bottom-2 right-2 flex gap-2 z-10">
      <Button 
        variant="secondary" 
        size="sm" 
        className="bg-card/80 backdrop-blur-sm"
        onClick={onToggleFullscreen}
      >
        {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </Button>
    </div>
  );
};

export default MapControls;
