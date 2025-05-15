
import React, { useState } from 'react';
import { MoreHorizontal, EyeOff, AlertTriangle, CornerUpLeft, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useUserRole } from '@/hooks/useUserRole';
import { useQueryClient } from '@tanstack/react-query';
import { hidePost, hideComment, warnUser } from '@/services/moderationService';
import { ModerationDialog } from './ModerationDialog';

interface ModerationActionsProps {
  type: 'post' | 'comment';
  contentId: string;
  authorId: string;
}

export const ModerationActions: React.FC<ModerationActionsProps> = ({
  type,
  contentId,
  authorId,
}) => {
  const { isAtLeastRole } = useUserRole();
  const queryClient = useQueryClient();
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [isHideDialogOpen, setIsHideDialogOpen] = useState(false);
  
  const isModerator = isAtLeastRole('moderator');
  
  if (!isModerator) {
    return null;
  }
  
  const handleHide = async (reason: string) => {
    try {
      let success = false;
      
      if (type === 'post') {
        success = await hidePost(contentId, reason);
      } else {
        success = await hideComment(contentId, reason);
      }
      
      if (success) {
        toast({
          title: "Content hidden",
          description: `The ${type} has been hidden from regular users.`,
        });
        
        // Invalidate queries to refresh content
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['post', contentId] });
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      } else {
        toast({
          title: "Action failed",
          description: `Failed to hide the ${type}.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Error hiding ${type}:`, error);
      toast({
        title: "Action failed",
        description: `Failed to hide the ${type}.`,
        variant: "destructive"
      });
    }
    
    setIsHideDialogOpen(false);
  };
  
  const handleWarn = async (
    reason: string, 
    severity: 'minor' | 'moderate' | 'severe'
  ) => {
    try {
      const relatedPostId = type === 'post' ? contentId : undefined;
      const relatedCommentId = type === 'comment' ? contentId : undefined;
      
      const success = await warnUser(
        authorId,
        reason,
        severity,
        relatedPostId,
        relatedCommentId
      );
      
      if (success) {
        toast({
          title: "Warning issued",
          description: `The user has been warned for this ${type}.`,
        });
      } else {
        toast({
          title: "Action failed",
          description: `Failed to warn the user.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error warning user:", error);
      toast({
        title: "Action failed",
        description: "Failed to warn the user.",
        variant: "destructive"
      });
    }
    
    setIsWarningDialogOpen(false);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Moderation options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Moderation Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsHideDialogOpen(true)}>
            <EyeOff className="mr-2 h-4 w-4" />
            Hide {type}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsWarningDialogOpen(true)}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Warn user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ModerationDialog
        type="hide"
        contentType={type}
        isOpen={isHideDialogOpen}
        onOpenChange={setIsHideDialogOpen}
        onAction={handleHide}
      />
      
      <ModerationDialog
        type="warn"
        contentType={type}
        isOpen={isWarningDialogOpen}
        onOpenChange={setIsWarningDialogOpen}
        onAction={handleWarn}
      />
    </>
  );
};
