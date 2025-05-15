
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserProfileLink from '@/components/UserProfileLink';
import PostInteractions from '@/components/post/PostInteractions';
import { Post } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface PostContentProps {
  post: Post;
  votes: number;
  userVote: 1 | -1 | null;
  loading: boolean;
  translatedText: string | null;
  isTranslating: boolean;
  detectedLanguage: string | null;
  handleVote: (direction: 'up' | 'down') => void;
  handleTranslate: () => void;
  translationAvailable: boolean;
  handleDeletePost: () => void;
}

const PostContent: React.FC<PostContentProps> = ({
  post,
  votes,
  userVote,
  loading,
  translatedText,
  isTranslating,
  detectedLanguage,
  handleVote,
  handleTranslate,
  translationAvailable,
  handleDeletePost,
}) => {
  const { user } = useAuth();
  const isAuthor = user?.id === post.author.id;
  
  // Convert direction to vote type
  const handleVoteWrapper = (direction: 'up' | 'down') => {
    const voteType = direction === 'up' ? 1 : -1;
    handleVote(direction);
  };
  
  return (
    <div className="w-full py-4">
      <div className="px-4">
        <div className="flex items-center mb-3">
          <Link to={`/users/${post.author.id}`} className="mr-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} className="object-cover" />
              <AvatarFallback>
                <User className="h-6 w-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <UserProfileLink user={post.author} showAvatar={false} className="font-semibold hover:underline" />
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
              {post.locationLat && post.locationLng && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin size={12} className="mr-1" />
                  <span>
                    {post.distance !== undefined ? 
                      `${post.distance.toFixed(1)} miles away` : 
                      `${post.locationLat.toFixed(4)}, ${post.locationLng.toFixed(4)}`
                    }
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <p className="mb-4">{translatedText || post.text}</p>
        {detectedLanguage && translatedText && (
          <p className="text-xs text-muted-foreground mb-4">
            Translated from {detectedLanguage}
          </p>
        )}
        
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mb-4">
            {post.images.map((image, index) => (
              <img 
                key={index} 
                src={image.imageUrl} 
                alt={`Post by ${post.author.pseudonym}`}
                className="w-full rounded-md aspect-square object-cover"
              />
            ))}
          </div>
        )}
        
        <PostInteractions 
          postId={post.id}
          authorId={post.author.id}
          votes={votes}
          commentCount={post.commentCount}
          userVote={userVote}
          handleVote={handleVoteWrapper}
          loading={loading}
          translatedText={translatedText}
          isTranslating={isTranslating}
          handleTranslate={handleTranslate}
          showTranslateButton={true}
          translationAvailable={translationAvailable}
          onDelete={isAuthor ? handleDeletePost : undefined}
        />
      </div>
    </div>
  );
};

export default PostContent;
