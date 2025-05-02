
import React from 'react';
import { Post } from '../types';
import { ArrowUp, ArrowDown, MessageCircle, MapPin } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'campsite': return 'bg-earth text-secondary-foreground';
      case 'service': return 'bg-sky text-white';
      case 'question': return 'bg-forest-light text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="post-card">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-forest-light flex items-center justify-center">
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.pseudonym} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-medium">
                {post.author.pseudonym.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-medium">{post.author.pseudonym}</h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{formatDate(post.createdAt)}</span>
              <span className="mx-1">•</span>
              <span className={`px-2 py-0.5 rounded-full ${getCategoryColor(post.category)}`}>
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin size={14} className="mr-1" />
          <span>{post.distance} km</span>
        </div>
      </div>
      
      <p className="mb-3">{post.text}</p>
      
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-2 mb-3 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.map((image, index) => (
            <div key={index} className="rounded-md overflow-hidden aspect-[4/3]">
              <img 
                src={image} 
                alt={`Post by ${post.author.pseudonym}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center pt-2 border-t border-border">
        <div className="flex items-center">
          <button className="p-1.5 rounded-full hover:bg-muted">
            <ArrowUp size={18} className="text-forest" />
          </button>
          <span className="mx-1 font-medium text-sm">{post.votes}</span>
          <button className="p-1.5 rounded-full hover:bg-muted">
            <ArrowDown size={18} className="text-muted-foreground" />
          </button>
        </div>
        <button className="flex items-center text-sm text-muted-foreground hover:text-forest transition-colors">
          <MessageCircle size={18} className="mr-1.5" />
          <span>{post.commentCount} comments</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
