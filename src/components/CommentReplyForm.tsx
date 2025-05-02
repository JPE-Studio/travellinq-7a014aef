
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { addComment } from '@/services/commentService';
import { useQueryClient } from '@tanstack/react-query';

interface CommentReplyFormProps {
  postId: string;
  parentCommentId: string;
  onCancel: () => void;
  authorName: string;
}

const CommentReplyForm: React.FC<CommentReplyFormProps> = ({ 
  postId, 
  parentCommentId,
  onCancel,
  authorName
}) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to reply to comments.",
        variant: "destructive"
      });
      return;
    }
    
    if (!replyText.trim()) {
      toast({
        title: "Reply cannot be empty",
        description: "Please write something before posting your reply.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addComment(postId, replyText, parentCommentId);
      
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      
      setReplyText('');
      onCancel();
      
      toast({
        title: "Reply posted",
        description: "Your reply has been added to the discussion.",
      });
    } catch (error) {
      console.error("Error posting reply:", error);
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form className="pl-8 mt-2 mb-2" onSubmit={handleSubmitReply}>
      <div className="flex">
        <Avatar className="h-8 w-8 mr-3">
          <AvatarImage src={profile?.avatar} className="object-cover" />
          <AvatarFallback>
            <User className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <textarea 
            className="w-full p-2 border rounded-md resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={`Reply to ${authorName}...`}
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="flex justify-end mt-2 space-x-2">
            <Button 
              type="button" 
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Posting...
                </>
              ) : 'Reply'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentReplyForm;
