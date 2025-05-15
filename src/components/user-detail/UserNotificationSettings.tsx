
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bell, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { BuddyConnection } from '@/types';
import { updateBuddyNotificationSettings } from '@/services/chatService';

interface NotificationSettingsProps {
  buddyId: string;
  buddyConnection: BuddyConnection;
  setBuddyConnection: (connection: BuddyConnection | null) => void;
}

const UserNotificationSettings: React.FC<NotificationSettingsProps> = ({
  buddyId,
  buddyConnection,
  setBuddyConnection
}) => {
  const { toast } = useToast();
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [notifyAt100km, setNotifyAt100km] = useState(buddyConnection.notifyAt100km || buddyConnection.notify_at_100km || false);
  const [notifyAt50km, setNotifyAt50km] = useState(buddyConnection.notifyAt50km || buddyConnection.notify_at_50km || false);
  const [notifyAt20km, setNotifyAt20km] = useState(buddyConnection.notifyAt20km || buddyConnection.notify_at_20km || false);

  // Update notification settings
  const handleNotificationSettingChange = async (settingName: string, value: boolean) => {
    if (!buddyConnection) return;

    try {
      setIsUpdatingSettings(true);
      
      const settings: {
        notify_at_100km?: boolean;
        notify_at_50km?: boolean;
        notify_at_20km?: boolean;
      } = {};
      
      settings[settingName as keyof typeof settings] = value;
      
      const updatedConnection = await updateBuddyNotificationSettings(buddyId, settings);
      setBuddyConnection(updatedConnection);
      
      toast({
        title: "Settings updated",
        description: "Your proximity notification settings were updated",
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast({
        variant: "destructive",
        title: "Failed to update settings",
        description: error instanceof Error ? error.message : "Could not update notification settings",
      });
      
      // Revert UI state on error
      if (settingName === 'notify_at_100km') setNotifyAt100km(!value);
      if (settingName === 'notify_at_50km') setNotifyAt50km(!value);
      if (settingName === 'notify_at_20km') setNotifyAt20km(!value);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  return (
    <div className="bg-muted/20 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Proximity Notifications
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="notify-100km" className="text-sm">
            Notify when within 100km
          </label>
          <Switch 
            id="notify-100km"
            checked={notifyAt100km}
            disabled={isUpdatingSettings}
            onCheckedChange={(checked) => {
              setNotifyAt100km(checked);
              handleNotificationSettingChange('notify_at_100km', checked);
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label htmlFor="notify-50km" className="text-sm">
            Notify when within 50km
          </label>
          <Switch 
            id="notify-50km"
            checked={notifyAt50km}
            disabled={isUpdatingSettings}
            onCheckedChange={(checked) => {
              setNotifyAt50km(checked);
              handleNotificationSettingChange('notify_at_50km', checked);
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label htmlFor="notify-20km" className="text-sm">
            Notify when within 20km
          </label>
          <Switch 
            id="notify-20km"
            checked={notifyAt20km}
            disabled={isUpdatingSettings}
            onCheckedChange={(checked) => {
              setNotifyAt20km(checked);
              handleNotificationSettingChange('notify_at_20km', checked);
            }}
          />
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          You'll only receive notifications when both you and your buddy have enabled location sharing.
        </div>
      </div>
    </div>
  );
};

export default UserNotificationSettings;
