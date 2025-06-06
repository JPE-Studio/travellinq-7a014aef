
import React, { useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { setGhostMode } from '@/services/adminService';

interface PreferencesFormProps {
  autoTranslate: boolean;
  setAutoTranslate: (value: boolean) => void;
  locationSharing: boolean;
  setLocationSharing: (value: boolean) => void;
  ghostMode?: boolean;
  setGhostMode?: (value: boolean) => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({
  autoTranslate,
  setAutoTranslate,
  locationSharing,
  setLocationSharing,
  ghostMode = false,
  setGhostMode: setParentGhostMode,
}) => {
  const { user, profile } = useAuth();
  const { isPaidUser } = useUserRole();
  const {
    permissionStatus,
    pushEnabled,
    loading,
    error,
    togglePushNotifications
  } = usePushNotifications();
  
  const isNotificationsUnsupported = permissionStatus === 'unsupported';

  const handleTogglePushNotifications = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be signed in to enable push notifications",
        variant: "destructive"
      });
      return;
    }
    
    const result = await togglePushNotifications();
    if (result) {
      toast({
        title: pushEnabled ? "Notifications disabled" : "Notifications enabled",
        description: pushEnabled 
          ? "You will no longer receive push notifications" 
          : "You will now receive push notifications",
      });
    }
  };

  const handleRetry = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be signed in to enable push notifications",
        variant: "destructive"
      });
      return;
    }
    
    const result = await togglePushNotifications();
    if (result) {
      toast({
        title: "Registration successful",
        description: "Push notifications have been enabled",
      });
    }
  };

  const handleToggleGhostMode = async (value: boolean) => {
    if (!user) return;
    
    try {
      const success = await setGhostMode(user.id, value);
      
      if (success) {
        if (setParentGhostMode) {
          setParentGhostMode(value);
        }
        
        toast({
          title: value ? "Ghost mode enabled" : "Ghost mode disabled",
          description: value 
            ? "Your location is now hidden from other users" 
            : "Your location is now visible to other users",
        });
      } else {
        throw new Error("Failed to update ghost mode");
      }
    } catch (error: any) {
      toast({
        title: "Failed to update ghost mode",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

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
            onCheckedChange={() => handleTogglePushNotifications()}
            disabled={!user || isNotificationsUnsupported || loading || permissionStatus === 'denied'}
          />
        </div>
        
        {!user && (
          <Alert className="mt-2 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to be signed in to enable push notifications.
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between w-full">
              <span>{error}</span>
              {user && !isNotificationsUnsupported && permissionStatus !== 'denied' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  disabled={loading}
                  className="ml-2"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Retry"}
                </Button>
              )}
            </AlertDescription>
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

        {/* Ghost mode - only visible to paid users */}
        {isPaidUser && (
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-medium">Ghost Mode</p>
              <p className="text-sm text-muted-foreground">
                Hide your location from other users (premium feature)
              </p>
            </div>
            <Switch 
              id="ghost-mode"
              checked={ghostMode}
              onCheckedChange={handleToggleGhostMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesForm;
