
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/PageLayout';
import ProfileInformationForm from '@/components/settings/ProfileInformationForm';
import PreferencesForm from '@/components/settings/PreferencesForm';
import FormActions from '@/components/settings/FormActions';

const Settings: React.FC = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
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
      setAutoTranslate(profile.autoTranslate || false);
      // Default to true if the property doesn't exist
      setLocationSharing(profile.locationSharing !== false);
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
          preferred_language: preferredLanguage,
          auto_translate: autoTranslate,
          location_sharing: locationSharing
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
        
        <ProfileInformationForm 
          profile={profile}
          displayName={displayName}
          setDisplayName={setDisplayName}
          bio={bio}
          setBio={setBio}
          location={location}
          setLocation={setLocation}
          preferredLanguage={preferredLanguage}
          setPreferredLanguage={setPreferredLanguage}
          avatar={avatar}
          avatarPreview={avatarPreview}
          handleImageChange={handleImageChange}
        />
        
        <PreferencesForm 
          autoTranslate={autoTranslate}
          setAutoTranslate={setAutoTranslate}
          locationSharing={locationSharing}
          setLocationSharing={setLocationSharing}
        />
        
        <FormActions 
          isSaving={isSaving}
          onSave={handleSaveChanges}
        />
      </div>
    </PageLayout>
  );
};

export default Settings;
