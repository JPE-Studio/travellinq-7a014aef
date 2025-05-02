
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Camera, User, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
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
    if (profile?.pseudonym && profile.pseudonym !== '') {
      // If user already has a pseudonym, skip onboarding
      onComplete();
    }
  }, [profile, onComplete]);
  
  if (!isOpen || !user) return null;
  
  const handleNextStep = () => {
    if (step === 4) {
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
      setStep(3);
      
      // Save location data in Supabase (optional)
      await supabase
        .from('profiles')
        .update({
          location: `${position.coords.latitude},${position.coords.longitude}`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        .eq('id', user.id);
        
      toast({
        title: "Standort gespeichert",
        description: "Dein Standort wurde erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error('Standortabfrage fehlgeschlagen:', error);
      toast({
        title: "Standortabfrage fehlgeschlagen",
        description: "Bitte aktiviere den Standortzugriff in deinem Browser und versuche es erneut.",
        variant: "destructive",
      });
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
      toast({
        title: "Ungültiger Pseudonym",
        description: "Dein Pseudonym muss mindestens 3 Zeichen enthalten.",
        variant: "destructive",
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
      
      // The welcome toast is now only shown here after successful profile creation
      toast({
        title: "Willkommen bei Travellinq!",
        description: "Dein Profil wurde erfolgreich erstellt.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Profils:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Dein Profil konnte nicht gespeichert werden. Bitte versuche es später erneut.",
        variant: "destructive",
      });
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
                <h2 className="text-2xl font-bold mb-4">Willkommen bei Travellinq</h2>
                <p className="text-muted-foreground mb-6">
                  Verbinde dich mit Vanlifern in der Nähe, teile Tipps und entdecke versteckte Orte auf deiner Reise.
                </p>
                <Button onClick={() => setStep(2)} className="w-full">
                  Los geht's
                </Button>
              </div>
            )}
            
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Standortzugriff</h2>
                <p className="text-muted-foreground mb-6">
                  Travellinq benötigt deinen Standort, um dir relevante Beiträge und Vanlifer in der Nähe anzuzeigen.
                </p>
                <div className="flex items-center p-4 bg-muted rounded-lg mb-6">
                  <MapPin size={24} className="text-primary mr-3" />
                  <div>
                    <p className="font-medium">Standortzugriff erlauben</p>
                    <p className="text-sm text-muted-foreground">Wird für die Funktionalität der App benötigt</p>
                  </div>
                </div>
                <Button 
                  onClick={handleLocationPermission}
                  className="w-full"
                >
                  Standortzugriff erlauben
                </Button>
              </div>
            )}
            
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Wähle einen Pseudonym</h2>
                <p className="text-muted-foreground mb-6">
                  Erstelle einen einzigartigen Nickname, der dich in der Travellinq-Community repräsentiert.
                </p>
                <Form {...form}>
                  <div className="space-y-4 mb-6">
                    <FormField
                      control={form.control}
                      name="pseudonym"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pseudonym</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="z.B. BergNomade"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            Wähle mit Bedacht! Du kannst deinen Pseudonym nur alle 30 Tage ändern.
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
                <Button 
                  onClick={() => setStep(4)}
                  disabled={form.getValues('pseudonym').length < 3}
                  className="w-full"
                >
                  Weiter
                </Button>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Profilbild hinzufügen</h2>
                <p className="text-muted-foreground mb-6">
                  Lade ein Profilbild hoch, damit andere Vanlifer dich leichter erkennen können.
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
                        <span>{avatarPreview ? 'Anderes Bild auswählen' : 'Bild auswählen'}</span>
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
                      Optional: Du kannst diesen Schritt auch überspringen.
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleOnboardingComplete}
                  className="w-full mt-8"
                  disabled={isUploading}
                >
                  {isUploading ? 'Wird gespeichert...' : 'Travellinq beitreten'}
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
                Zurück
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OnboardingModal;
