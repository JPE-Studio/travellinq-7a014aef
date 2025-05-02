
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';
import { BuddyConnection } from '@/types';

interface NotificationSettingsProps {
  buddyConnection: BuddyConnection;
  onToggleNotification: (distance: 100 | 50 | 20, checked: boolean) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  buddyConnection,
  onToggleNotification
}) => {
  return (
    <div className="px-6 py-3 bg-muted/5 mt-3 rounded-md">
      <p className="text-xs text-muted-foreground mb-2 flex items-center">
        <Bell className="h-3 w-3 mr-1" />
        Proximity notifications
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="notify-100km" className="text-xs cursor-pointer">
            Notify at 100km
          </Label>
          <Switch 
            id="notify-100km"
            checked={buddyConnection.notify_at_100km}
            onCheckedChange={(checked) => onToggleNotification(100, checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="notify-50km" className="text-xs cursor-pointer">
            Notify at 50km
          </Label>
          <Switch 
            id="notify-50km"
            checked={buddyConnection.notify_at_50km}
            onCheckedChange={(checked) => onToggleNotification(50, checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="notify-20km" className="text-xs cursor-pointer">
            Notify at 20km
          </Label>
          <Switch 
            id="notify-20km"
            checked={buddyConnection.notify_at_20km}
            onCheckedChange={(checked) => onToggleNotification(20, checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
