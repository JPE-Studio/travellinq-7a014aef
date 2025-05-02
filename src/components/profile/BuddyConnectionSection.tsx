
import React from 'react';
import { Users, Loader2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BuddyConnection } from '@/types';

interface BuddyConnectionSectionProps {
  userId: string;
  isCurrentUser: boolean;
  userData: { id: string; pseudonym: string };
  buddyConnection: BuddyConnection | null;
  connectLoading: boolean;
  handleConnectWithBuddy: () => void;
  handleDisconnectBuddy: () => void;
  handleNotificationToggle: (distance: 100 | 50 | 20, checked: boolean) => void;
}

const BuddyConnectionSection: React.FC<BuddyConnectionSectionProps> = ({
  userId,
  isCurrentUser,
  userData,
  buddyConnection,
  connectLoading,
  handleConnectWithBuddy,
  handleDisconnectBuddy,
  handleNotificationToggle
}) => {
  if (isCurrentUser) return null;

  return (
    <>
      <div className="px-6 py-3 bg-muted/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary/70" />
            <span className="text-sm font-medium">Buddy Connection</span>
          </div>
          {buddyConnection ? (
            <Button 
              onClick={handleDisconnectBuddy} 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              disabled={connectLoading}
            >
              {connectLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                "Disconnect"
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleConnectWithBuddy}
              size="sm"
              className="text-xs h-7"
              disabled={connectLoading}
            >
              {connectLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <>
                  <Users className="h-3 w-3 mr-1" />
                  Connect
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {buddyConnection && (
        <div className="px-6 py-3 bg-muted/5">
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
                onCheckedChange={(checked) => handleNotificationToggle(100, checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-50km" className="text-xs cursor-pointer">
                Notify at 50km
              </Label>
              <Switch 
                id="notify-50km"
                checked={buddyConnection.notify_at_50km}
                onCheckedChange={(checked) => handleNotificationToggle(50, checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-20km" className="text-xs cursor-pointer">
                Notify at 20km
              </Label>
              <Switch 
                id="notify-20km"
                checked={buddyConnection.notify_at_20km}
                onCheckedChange={(checked) => handleNotificationToggle(20, checked)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BuddyConnectionSection;
