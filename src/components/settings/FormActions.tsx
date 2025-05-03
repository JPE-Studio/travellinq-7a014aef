
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormActionsProps {
  isSaving: boolean;
  onSave: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ isSaving, onSave }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end space-x-4">
      <Button 
        variant="outline" 
        onClick={() => navigate('/profile')}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <Button 
        onClick={onSave} 
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
  );
};

export default FormActions;
