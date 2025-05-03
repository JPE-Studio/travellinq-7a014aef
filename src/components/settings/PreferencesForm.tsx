
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface PreferencesFormProps {
  autoTranslate: boolean;
  setAutoTranslate: (value: boolean) => void;
  locationSharing: boolean;
  setLocationSharing: (value: boolean) => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({
  autoTranslate,
  setAutoTranslate,
  locationSharing,
  setLocationSharing,
}) => {
  return (
    <div className="bg-card rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Auto-Translate Content</p>
            <p className="text-sm text-muted-foreground">
              Automatically translate posts to your preferred language
            </p>
          </div>
          <Switch 
            id="auto-translate" 
            checked={autoTranslate}
            onCheckedChange={setAutoTranslate}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notifications</p>
            <p className="text-sm text-muted-foreground">
              Enable push notifications
            </p>
          </div>
          <Switch id="notifications" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Location Sharing</p>
            <p className="text-sm text-muted-foreground">
              Share your location with the community and see distances to posts
            </p>
          </div>
          <Switch 
            id="location-sharing"
            checked={locationSharing}
            onCheckedChange={setLocationSharing}
          />
        </div>
      </div>
    </div>
  );
};

export default PreferencesForm;
