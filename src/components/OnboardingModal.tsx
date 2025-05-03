
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { Form } from '@/components/ui/form';
import OnboardingStep1 from './onboarding/OnboardingStep1';
import OnboardingStep2 from './onboarding/OnboardingStep2';
import OnboardingStep3 from './onboarding/OnboardingStep3';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  
  const form = useForm({
    defaultValues: {
      pseudonym: profile?.pseudonym || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
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
    const location = form.getValues('location');
    
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
        location: location || null
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
            <Form {...form}>
              {step === 1 && (
                <OnboardingStep1 
                  form={form} 
                  onNext={handleNextStep} 
                />
              )}
              
              {step === 2 && (
                <OnboardingStep2 
                  form={form} 
                  onNext={handleNextStep} 
                  onPrev={handlePrevStep} 
                />
              )}

              {step === 3 && (
                <OnboardingStep3 
                  avatarFile={avatarFile}
                  avatarPreview={avatarPreview}
                  isUploading={isUploading}
                  onPrev={handlePrevStep}
                  onComplete={handleSubmitOnboarding}
                  onAvatarChange={handleAvatarChange}
                  removeAvatar={removeAvatar}
                />
              )}
            </Form>
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
