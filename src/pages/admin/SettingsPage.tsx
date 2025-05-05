
import React, { useState } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

const SettingsPage: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [feedMaxRadius, setFeedMaxRadius] = useState('20');
  const [enableRealtime, setEnableRealtime] = useState(true);
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [enableGhostMode, setEnableGhostMode] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated.',
    });
  };

  return (
    <DashboardLayout title="Admin Settings">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default User Settings</CardTitle>
              <CardDescription>
                Configure default settings for new users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="feedRadius">Default Feed Radius (km)</Label>
                <Input 
                  id="feedRadius" 
                  type="number" 
                  value={feedMaxRadius} 
                  onChange={(e) => setFeedMaxRadius(e.target.value)}
                  min="1" 
                  max="100"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum radius in kilometers for users' feeds
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Input 
                  id="defaultLanguage" 
                  value={defaultLanguage} 
                  onChange={(e) => setDefaultLanguage(e.target.value)} 
                />
                <p className="text-sm text-muted-foreground">
                  ISO language code for default user language
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ghostMode">Ghost Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable ghost mode by default for new users
                  </p>
                </div>
                <Switch 
                  id="ghostMode" 
                  checked={enableGhostMode} 
                  onCheckedChange={setEnableGhostMode}
                />
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isSaving && <Check className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enablePush">System Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable push notifications for important system events
                  </p>
                </div>
                <Switch id="enablePush" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for critical events
                  </p>
                </div>
                <Switch id="emailNotifications" defaultChecked />
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isSaving && <Check className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                These settings affect system performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="realtimeUpdates">Realtime Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable realtime database updates
                  </p>
                </div>
                <Switch 
                  id="realtimeUpdates"
                  checked={enableRealtime}
                  onCheckedChange={setEnableRealtime}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debugMode">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable extended logging for debugging
                  </p>
                </div>
                <Switch id="debugMode" />
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isSaving && <Check className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SettingsPage;
