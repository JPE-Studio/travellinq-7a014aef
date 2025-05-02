import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, ChevronLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageLayout from '@/components/PageLayout';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
];

const Settings: React.FC = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.pseudonym || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setPreferredLanguage(profile.preferredLanguage || 'en');
    }
  }, [profile]);
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Upload avatar to storage if needed
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatar || !user) return null;
    
    try {
      const fileExt = avatar.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatar);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };
  
  // Save profile changes
  const handleSaveChanges = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Upload avatar if selected
      let avatarUrl = profile?.avatar;
      if (avatar) {
        avatarUrl = await uploadAvatar();
      }
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          pseudonym: displayName,
          bio: bio,
          avatar: avatarUrl,
          location: location,
          preferred_language: preferredLanguage
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-4 w-full">
        <Link to="/profile" className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground">
          <ChevronLeft size={16} className="mr-1" />
          Back to profile
        </Link>
        
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="bg-card rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          
          <div className="flex items-center mb-6">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={avatarPreview || profile?.avatar} />
              <AvatarFallback>
                <User className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <label className="px-4 py-2 border rounded-md text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Change Profile Photo
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
              />
            </label>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-1">Display Name</Label>
              <Input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Bio</Label>
              <Textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Location</Label>
              <Input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Portland, OR"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your location will be stored and used to show nearby posts
              </p>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Preferred Language</Label>
              <Select
                value={preferredLanguage}
                onValueChange={setPreferredLanguage}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Your preferred language for content translation
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          
          <div className="space-y-4">
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
                  Share your location with the community
                </p>
              </div>
              <Switch id="location-sharing" defaultChecked />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/profile')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveChanges} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
