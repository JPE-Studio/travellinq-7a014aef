
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, User, Bell, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatDistance } from '@/utils/formatUtils';
import { Post } from '@/types';

interface PostHeaderProps {
  post: Post;
  isSubscribed: boolean;
  handleSubscribe: () => void;
  loading: boolean;
}

const PostHeader: React.FC<PostHeaderProps> = ({ 
  post,
  isSubscribed,
  handleSubscribe,
  loading
}) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <Link to={`/profile/${post.author.id}`} className="flex items-center">
        <div className="mr-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar} className="object-cover" />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <div className="font-medium hover:underline">{post.author.pseudonym}</div>
          <div className="flex flex-wrap items-center text-xs text-muted-foreground">
            <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
            {post.location && (
              <>
                <span className="mx-1">•</span>
                <MapPin size={12} className="mr-1" />
                <span className="flex items-center">
                  {post.distance !== undefined ? (
                    <>
                      <span className={post.distance <= 10 ? "text-forest font-medium" : ""}>
                        {formatDistance(post.distance)}
                      </span>
                      {post.distance <= 5 && (
                        <span className="ml-1 bg-forest/20 text-forest px-1 rounded text-[10px]">
                          Near you
                        </span>
                      )}
                    </>
                  ) : (
                    <span>Location available</span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
      
      {/* Subscribe button */}
      <button 
        className={`flex items-center hover:text-foreground ${isSubscribed ? 'text-primary' : ''}`} 
        onClick={handleSubscribe} 
        disabled={loading}
      >
        {!isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
      </button>
    </div>
  );
};

export default PostHeader;
