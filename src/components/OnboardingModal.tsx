
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Camera, User, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [locationPermission, setLocationPermission] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  
  const form = useForm({
    defaultValues: {
      pseudonym: '',
    },
  });

  useEffect(() => {
    // Only skip if user has completed onboarding (has valid pseudonym)
    if (profile?.pseudonym && profile.pseudonym.length >= 3 && !profile.pseudonym.startsWith('user_')) {
      onComplete();
    }
  }, [profile, onComplete]);
  
  if (!isOpen || !user) return null;
  
  const handleNextStep = () => {
    if (step === 3) {
      handleOnboardingComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handleLocationPermission = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      setLocationPermission(true);
      setStep(2); // Move to username step
      
      // Save location data in Supabase
      await supabase
        .from('profiles')
        .update({
          location: `${position.coords.latitude},${position.coords.longitude}`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Location request failed:', error);
      // Continue to next step even if location fails
      setStep(2);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
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

  const handleOnboardingComplete = async () => {
    const pseudonym = form.getValues('pseudonym');
    
    if (pseudonym.length < 3) {
      form.setError('pseudonym', {
        type: 'manual',
        message: 'Username must be at least 3 characters'
      });
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

      // Save the pseudonym and avatar URL in Supabase
      await supabase
        .from('profiles')
        .update({
          pseudonym: pseudonym,
          ...(avatarUrl ? { avatar: avatarUrl } : {})
        })
        .eq('id', user.id);
      
      // Update the local profile
      await refreshProfile();
      
      onComplete();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={() => {}}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-lg p-0">
        <div className="bg-card h-full flex flex-col">
          <div className="flex-1 p-6 overflow-auto">
            {step === 1 && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-4">Welcome to Travellinq</h2>
                <p className="text-muted-foreground mb-6">
                  Connect with fellow travelers, share tips and discover hidden places on your journey.
                </p>
                <Button onClick={handleLocationPermission} className="w-full mb-4">
                  Allow Location Access
                </Button>
                <Button onClick={() => setStep(2)} variant="outline" className="w-full">
                  Skip Location Access
                </Button>
              </div>
            )}
            
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Choose a Username</h2>
                <p className="text-muted-foreground mb-6">
                  Create a unique username that represents you in the Travellinq community.
                </p>
                <Form {...form}>
                  <div className="space-y-4 mb-6">
                    <FormField
                      control={form.control}
                      name="pseudonym"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. MountainNomad"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            Choose carefully! You can only change your username every 30 days.
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={form.getValues('pseudonym').length < 3}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Add a Profile Picture</h2>
                <p className="text-muted-foreground mb-6">
                  Upload a profile picture to help other travelers recognize you.
                </p>
                
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
                      <div className="flex items-center justify-center gap-2 p-2 border border-input bg-background hover:bg-accent text-center rounded-md">
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
                      Optional: You can skip this step.
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleOnboardingComplete}
                  className="w-full mt-8"
                  disabled={isUploading}
                >
                  {isUploading ? 'Saving...' : 'Join Travellinq'}
                </Button>
              </div>
            )}
          </div>

          {step > 1 && (
            <div className="p-4 border-t">
              <button 
                onClick={() => setStep(step - 1)} 
                className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OnboardingModal;
