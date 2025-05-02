
import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Languages, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  handleTranslate
}) => {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
      <div className="flex items-center space-x-4">
        <button 
          className={`flex items-center transition-colors ${userVote === 1 ? 'text-blue-500' : 'hover:text-foreground'}`} 
          onClick={() => handleVote('up')} 
          disabled={loading}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>{votes}</span>
        </button>
        <button 
          className={`flex items-center transition-colors ${userVote === -1 ? 'text-red-500' : 'hover:text-foreground'}`} 
          onClick={() => handleVote('down')} 
          disabled={loading}
        >
          <ThumbsDown className="h-4 w-4" />
        </button>
      </div>
      
      {/* Translate button in the center */}
      {!translatedText && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleTranslate} 
          disabled={isTranslating} 
          className="text-xs border border-gray-300 h-8 px-3"
        >
          <Languages className="h-3 w-3 mr-1" />
          {isTranslating ? 'Translating...' : 'Translate'}
        </Button>
      )}
      
      {/* Comments link with icon */}
      <Link to={`/post/${postId}`} className="flex items-center hover:text-foreground">
        <MessageCircle className="h-4 w-4 mr-1" />
        <span>{commentCount}</span>
      </Link>
    </div>
  );
};

export default PostInteractions;
