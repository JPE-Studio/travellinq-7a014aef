
import React, { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { MessageSquare, Flag, ThumbsUp, ThumbsDown, Languages } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { reportPost } from '@/services/adminService';

interface PostInteractionsProps {
  postId: string;
  authorId: string;
  commentCount: number;
  onCommentClick?: () => void;
  votes?: number;
  userVote?: 1 | -1 | null;
  handleVote?: (direction: 'up' | 'down') => void;
  loading?: boolean;
  translatedText?: string | null;
  isTranslating?: boolean;
  handleTranslate?: () => void;
  showTranslateButton?: boolean;
  translationAvailable?: boolean;
  onDelete?: () => void;
}

const PostInteractions: React.FC<PostInteractionsProps> = ({ 
  postId,
  authorId,
  commentCount,
  onCommentClick = () => {},
  votes = 0,
  userVote,
  handleVote,
  loading = false,
  translatedText,
  isTranslating = false,
  handleTranslate,
  showTranslateButton = false,
  translationAvailable = false,
  onDelete
}) => {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast({
        title: "Report incomplete",
        description: "Please provide a reason for your report.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const success = await reportPost(postId, reportReason.trim());
      
      if (success) {
        toast({
          title: "Report submitted",
          description: "Thank you for helping keep the community safe.",
        });
        setReportDialogOpen(false);
        setReportReason('');
      } else {
        throw new Error("Failed to submit report");
      }
    } catch (err: any) {
      console.error("Error reporting post:", err);
      toast({
        title: "Report failed",
        description: err.message || "An error occurred while submitting your report.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center mt-2 gap-x-3">
        {/* Voting buttons */}
        {handleVote && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 ${userVote === 1 ? 'text-primary' : 'text-muted-foreground'} hover:bg-transparent`}
              onClick={() => handleVote('up')}
              disabled={loading}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="mx-1 text-sm font-medium">{votes}</span>
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 ${userVote === -1 ? 'text-primary' : 'text-muted-foreground'} hover:bg-transparent`}
              onClick={() => handleVote('down')}
              disabled={loading}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Comment button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground p-0 hover:bg-transparent" 
          onClick={onCommentClick}
        >
          <MessageSquare className="h-4 w-4 mr-1" /> 
          {commentCount}
        </Button>
        
        {/* Translate button */}
        {showTranslateButton && handleTranslate && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground p-0 hover:bg-transparent"
            onClick={handleTranslate}
            disabled={isTranslating || !translationAvailable}
          >
            <Languages className="h-4 w-4 mr-1" />
            {isTranslating ? 'Translating...' : translatedText ? 'Original' : 'Translate'}
          </Button>
        )}
        
        {/* Report button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground p-0 hover:bg-transparent ml-auto"
          onClick={() => setReportDialogOpen(true)}
        >
          <Flag className="h-4 w-4 mr-1" /> Report
        </Button>

        {/* Delete button */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive p-0 hover:bg-transparent"
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
      </div>

      {/* Report dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Please provide details about why you're reporting this post.
              Our moderators will review your report.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="What's the issue with this post?"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setReportDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReport}
              disabled={submitting || !reportReason.trim()}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostInteractions;
