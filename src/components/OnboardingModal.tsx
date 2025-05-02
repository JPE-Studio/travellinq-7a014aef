
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Camera, User, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from "@/components/ui/textarea";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  
  const form = useForm({
    defaultValues: {
      pseudonym: profile?.pseudonym || '',
      bio: profile?.bio || '',
    },
  });

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmitOnboarding();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleLocationPermission = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      setLocationPermission('granted');

      if (user) {
        // Save location data in Supabase
        await supabase
          .from('profiles')
          .update({
            location: `${position.coords.latitude},${position.coords.longitude}`,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          .eq('id', user.id);
      }
      
      // Proceed to next step
      setStep(2);
      
    } catch (error) {
      console.error('Location request failed:', error);
      setLocationPermission('denied');
      // Still proceed to next step
      setStep(2);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmitOnboarding = async () => {
    const pseudonym = form.getValues('pseudonym');
    const bio = form.getValues('bio');
    
    // Validate username (required, min 3 chars)
    if (!pseudonym || pseudonym.length < 3) {
      form.setError('pseudonym', {
        type: 'manual',
        message: 'Username must be at least 3 characters'
      });
      setStep(2); // Go back to username step
      return;
    }

    try {
      setIsUploading(true);
      let avatarUrl = null;

      // Upload avatar if one was selected
      if (avatarFile && user) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload the file to Supabase storage
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = publicUrl;
      }

      // Prepare update data
      const updateData: Record<string, any> = {
        pseudonym,
        bio: bio || null,
      };

      // Only include avatar if we have a new one
      if (avatarUrl) {
        updateData.avatar = avatarUrl;
      }

      // Save the data in Supabase
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user?.id);
      
      if (error) throw error;
      
      // Update the local profile
      await refreshProfile();
      
      // Show success message
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      onComplete();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating your profile",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="bg-card h-full flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto">
            {step === 1 && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto">
                  <MapPin size={32} />
                </div>
                
                <div>
                  <DialogTitle className="text-2xl font-bold mb-2">Welcome to Travellinq</DialogTitle>
                  <p className="text-muted-foreground">
                    Connect with fellow travelers, share tips and discover hidden places on your journey.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={handleLocationPermission} 
                    className="w-full mb-4"
                    disabled={locationPermission === 'granted' || isUploading}
                  >
                    {locationPermission === 'granted' 
                      ? 'Location Access Granted' 
                      : 'Allow Location Access'}
                  </Button>
                  
                  <Button 
                    onClick={() => setStep(2)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Skip Location Access
                  </Button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <DialogTitle className="text-2xl font-bold mb-2">Create Your Profile</DialogTitle>
                  <p className="text-muted-foreground">
                    Set up your profile to connect with other travelers.
                  </p>
                </div>
                
                <Form {...form}>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="pseudonym"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. TravelExplorer"
                              {...field}
                              autoComplete="off"
                              minLength={3}
                              maxLength={30}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            Choose a unique username (minimum 3 characters).
                          </p>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share a bit about yourself and your travel interests..."
                              className="resize-none"
                              maxLength={300}
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Optional, max 300 characters
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
                
                <div className="pt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleNextStep}
                    disabled={!form.getValues('pseudonym') || form.getValues('pseudonym').length < 3}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <DialogTitle className="text-2xl font-bold mb-2">Add Profile Picture</DialogTitle>
                  <p className="text-muted-foreground">
                    Upload a profile picture to help other travelers recognize you.
                  </p>
                </div>
                
                <div className="flex flex-col items-center space-y-6">
                  {avatarPreview ? (
                    <div className="relative">
                      <Avatar className="w-32 h-32 border-2 border-primary">
                        <AvatarImage src={avatarPreview} alt="Avatar preview" />
                        <AvatarFallback>
                          <User className="h-16 w-16" />
                        </AvatarFallback>
                      </Avatar>
                      <button 
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        type="button"
                        aria-label="Remove avatar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground">
                      <Camera size={32} className="text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="w-full">
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="flex items-center justify-center gap-2 p-3 border border-input bg-background hover:bg-accent text-center rounded-md">
                        <Upload size={16} />
                        <span>{avatarPreview ? 'Change Picture' : 'Select Picture'}</span>
                      </div>
                      <input 
                        id="avatar" 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden" 
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Optional: JPG or PNG, max 5MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {step === 3 && (
            <div className="p-6 border-t flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handlePrevStep}
                disabled={isUploading}
              >
                Back
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSubmitOnboarding}
                disabled={isUploading}
              >
                {isUploading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
