
import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '@/types';
import { languages } from '@/utils/formatUtils';

interface PostContentProps {
  post: Post;
  translatedText: string | null;
  detectedLanguage?: string | null;
}

const PostContent: React.FC<PostContentProps> = ({ post, translatedText, detectedLanguage }) => {
  return (
    <Link to={`/post/${post.id}`} className="block">
      {translatedText && detectedLanguage && (
        <div className="text-xs text-muted-foreground mb-1">
          Translated from {languages.find(l => l.value === detectedLanguage)?.label || detectedLanguage}
        </div>
      )}
      
      <p className="mb-3 text-foreground">{translatedText || post.text}</p>
    
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
  );
};

export default PostContent;
