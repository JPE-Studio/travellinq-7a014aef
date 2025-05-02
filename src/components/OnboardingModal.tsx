
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [pseudonym, setPseudonym] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);
  
  if (!isOpen) return null;
  
  const handleNextStep = () => {
    if (step === 3) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <div className="bg-card shadow-lg rounded-lg w-full max-w-md p-6 animate-fade-in">
        {step === 1 && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-forest-light text-white flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Welcome to Travellinq</h2>
            <p className="text-muted-foreground mb-6">
              Connect with vanlifers nearby, share tips, and discover hidden gems along your journey.
            </p>
            <Button onClick={() => setStep(2)} className="w-full btn-primary">
              Get Started
            </Button>
          </div>
        )}
        
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Location Access</h2>
            <p className="text-muted-foreground mb-6">
              Travellinq needs your location to show you relevant posts and vanlifers nearby.
            </p>
            <div className="flex items-center p-4 bg-muted rounded-lg mb-6">
              <MapPin size={24} className="text-forest mr-3" />
              <div>
                <p className="font-medium">Allow location access</p>
                <p className="text-sm text-muted-foreground">Required for the app to function</p>
              </div>
            </div>
            <Button 
              onClick={() => {
                setLocationPermission(true);
                setStep(3);
              }} 
              className="w-full btn-primary"
            >
              Allow Location Access
            </Button>
          </div>
        )}
        
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Choose a Pseudonym</h2>
            <p className="text-muted-foreground mb-6">
              Create a unique nickname that will represent you in the Travellinq community.
            </p>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="pseudonym">Pseudonym</Label>
                <Input
                  id="pseudonym"
                  placeholder="e.g. MountainNomad"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Choose wisely! You can only change your pseudonym once every 30 days.
              </p>
            </div>
            <Button 
              onClick={handleNextStep} 
              disabled={pseudonym.trim().length < 3}
              className="w-full btn-primary"
            >
              Join Travellinq
            </Button>
          </div>
        )}
        
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)} 
            className="mt-4 text-sm text-muted-foreground hover:text-foreground w-full text-center"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
