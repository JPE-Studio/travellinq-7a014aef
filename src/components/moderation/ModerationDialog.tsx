
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModerationDialogProps {
  type: 'hide' | 'warn';
  contentType: 'post' | 'comment';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (reason: string, severity?: 'minor' | 'moderate' | 'severe') => void;
}

export const ModerationDialog: React.FC<ModerationDialogProps> = ({
  type,
  contentType,
  isOpen,
  onOpenChange,
  onAction,
}) => {
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'severe'>('minor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    
    setIsSubmitting(true);
    
    try {
      if (type === 'hide') {
        await onAction(reason);
      } else {
        await onAction(reason, severity);
      }
    } finally {
      setIsSubmitting(false);
      setReason('');
      setSeverity('minor');
    }
  };
  
  const title = type === 'hide' 
    ? `Hide ${contentType}` 
    : `Warn user for this ${contentType}`;
  
  const description = type === 'hide'
    ? `This will hide the ${contentType} from regular users. Moderators and admins will still be able to see it.`
    : `This will issue a warning to the user who created this ${contentType}.`;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder={`Why is this ${contentType} being ${type === 'hide' ? 'hidden' : 'reported'}?`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
                rows={3}
                required
              />
            </div>
            
            {type === 'warn' && (
              <div className="grid gap-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={severity}
                  onValueChange={(value) => setSeverity(value as 'minor' | 'moderate' | 'severe')}
                >
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Severity</SelectLabel>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!reason || isSubmitting}>
              {isSubmitting ? 'Submitting...' : type === 'hide' ? 'Hide' : 'Warn'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
