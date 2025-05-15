
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, ThumbsDown, Trash, Globe, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ModerationActions } from '@/components/moderation/ModerationActions';

interface PostInteractionsProps {
  postId: string;
  authorId: string;
  votes: number;
  commentCount: number;
  userVote: number | null;
  handleVote: (voteType: number) => void;
  loading: boolean;
  translatedText?: string;
  isTranslating: boolean;
  handleTranslate: () => void;
  showTranslateButton?: boolean;
  translationAvailable: boolean;
  onDelete?: () => void;
}

const PostInteractions: React.FC<PostInteractionsProps> = ({
  postId,
  authorId,
  votes,
  commentCount,
  userVote,
  handleVote,
  loading,
  translatedText,
  isTranslating,
  handleTranslate,
  showTranslateButton = false,
  translationAvailable,
  onDelete,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <div className="flex items-center space-x-4">
        {/* Vote buttons */}
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${userVote === 1 ? 'text-green-500' : ''}`}
                  onClick={() => handleVote(1)}
                  disabled={loading}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upvote</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className={`font-semibold ${votes > 0 ? 'text-green-500' : votes < 0 ? 'text-red-500' : ''}`}>
            {votes}
          </span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${userVote === -1 ? 'text-red-500' : ''}`}
                  onClick={() => handleVote(-1)}
                  disabled={loading}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Downvote</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Comments button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => navigate(`/post/${postId}`)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{commentCount}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View comments</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center space-x-1">
        {/* Translate button */}
        {showTranslateButton && translationAvailable && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                >
                  {isTranslating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{translatedText ? "Show original" : "Translate"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Delete button if user is the author */}
        {onDelete && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={onDelete}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete post</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Moderation actions for moderators */}
        <ModerationActions 
          type="post"
          contentId={postId}
          authorId={authorId}
        />
      </div>
    </div>
  );
};

export default PostInteractions;
