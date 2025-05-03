
import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Loader2, Languages, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PostInteractionsProps {
  postId: string;
  authorId: string;
  votes: number;
  commentCount: number;
  userVote: 1 | -1 | null;
  handleVote: (direction: 'up' | 'down') => void;
  loading: boolean;
  translatedText: string | null;
  isTranslating: boolean;
  handleTranslate: () => void;
  showTranslateButton?: boolean;
  translationAvailable?: boolean;
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
  showTranslateButton = true,
  translationAvailable = true,
  onDelete,
}) => {
  const { user } = useAuth();
  const isAuthor = user?.id === authorId;
  
  return (
    <div className="flex items-center justify-between text-sm mt-3 pb-1">
      <div className="flex items-center space-x-4">
        <button 
          className={`flex items-center transition-colors ${userVote === 1 ? 'text-blue-500' : 'hover:text-foreground text-muted-foreground'}`}
          onClick={() => handleVote('up')}
          disabled={loading}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>{votes}</span>
        </button>
        <button 
          className={`flex items-center transition-colors ${userVote === -1 ? 'text-red-500' : 'hover:text-foreground text-muted-foreground'}`}
          onClick={() => handleVote('down')}
          disabled={loading}
        >
          <ThumbsDown className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex items-center">
        {showTranslateButton && (
          <Button 
            variant="ghost" 
            size="sm"
            className={`text-muted-foreground p-1 h-auto ${!translationAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleTranslate}
            disabled={isTranslating || loading || !translationAvailable}
            title={!translationAvailable ? "Translation service is currently unavailable" : "Translate"}
          >
            {isTranslating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Link 
          to={`/post/${postId}`}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{commentCount}</span>
        </Link>
        
        {isAuthor && onDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-destructive p-1 h-auto"
            onClick={onDelete}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default PostInteractions;
