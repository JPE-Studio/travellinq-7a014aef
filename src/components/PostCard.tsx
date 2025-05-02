
import React from 'react';
import { Post } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, User, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const handleSubscribe = () => {
    toast({
      title: "Subscribed to post",
      description: `You'll receive notifications for updates to this post.`,
    });
  };

  const handleVote = (direction: 'up' | 'down') => {
    toast({
      title: direction === 'up' ? "Upvoted" : "Downvoted",
      description: `You ${direction === 'up' ? 'upvoted' : 'downvoted'} this post.`,
    });
  };

  return (
    <div className="bg-card rounded-lg shadow mb-4 overflow-hidden">
      {/* Post header with user info */}
      <div className="p-4">
        <div className="flex items-center mb-3">
          <Link to={`/user/${post.author.id}`} className="mr-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} className="object-cover" />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/user/${post.author.id}`} className="font-medium hover:underline">{post.author.pseudonym}</Link>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
              {post.location && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin size={12} className="mr-1" />
                  <span>{post.distance.toFixed(1)} miles away</span>
                </>
              )}
            </div>
          </div>
        </div>

        <Link to={`/post/${post.id}`} className="block">
          <p className="mb-3 text-foreground">{post.text}</p>
        
          {/* Post images if available */}
          {post.images && post.images.length > 0 && (
            <div className={`grid gap-2 mb-3 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {post.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`Post by ${post.author.pseudonym}`}
                  className="w-full h-48 object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </Link>
        
        {/* Post interactions */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <div className="flex items-center space-x-4">
            <button 
              className="flex items-center hover:text-foreground"
              onClick={() => handleVote('up')}
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>{post.votes}</span>
            </button>
            <button 
              className="flex items-center hover:text-foreground"
              onClick={() => handleVote('down')}
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="hover:text-foreground"
              onClick={handleSubscribe}
            >
              Subscribe
            </button>
            <Link to={`/post/${post.id}`} className="hover:text-foreground">
              {post.commentCount} comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
