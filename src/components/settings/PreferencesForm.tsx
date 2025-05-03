
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const {
    permissionStatus,
    pushEnabled,
    loading,
    error,
    togglePushNotifications
  } = usePushNotifications();
  
  const isNotificationsUnsupported = permissionStatus === 'unsupported';

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
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive notifications when you're not using the app
            </p>
          </div>
          <Switch 
            id="notifications" 
            checked={pushEnabled}
            onCheckedChange={() => togglePushNotifications()}
            disabled={isNotificationsUnsupported || loading || permissionStatus === 'denied'}
          />
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {permissionStatus === 'denied' && (
          <Alert className="mt-2 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notification permission was denied. Please update your browser settings to enable notifications.
            </AlertDescription>
          </Alert>
        )}
        
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
