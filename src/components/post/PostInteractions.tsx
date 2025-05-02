
import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Loader2, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PostInteractionsProps {
  postId: string;
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
}

const PostInteractions: React.FC<PostInteractionsProps> = ({
  postId,
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
}) => {
  return (
    <div className="flex items-center justify-between text-sm mt-4">
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
        <Link 
          to={`/post/${postId}`}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{commentCount}</span>
        </Link>
      </div>
      
      {showTranslateButton && translationAvailable && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground"
          onClick={handleTranslate}
          disabled={isTranslating || loading}
        >
          {isTranslating ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Languages className="h-4 w-4 mr-1" />
              {translatedText ? 'Show Original' : 'Translate'}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default PostInteractions;
