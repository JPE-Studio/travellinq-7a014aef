
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { mockPosts } from '@/data/mockData';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, User, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = mockPosts.find(post => post.id === id);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Full width header */}
      <Header />
      
      {/* Content area with ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col">
          {/* Page specific content here */}
          <div className="max-w-3xl mx-auto px-4 py-4 w-full">
            <Link to="/" className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground">
              <ChevronLeft size={16} className="mr-1" />
              Back to feed
            </Link>
            
            <div className="bg-card rounded-lg shadow p-4 mb-4">
              <div className="flex items-center mb-3">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>
                    <User className="h-6 w-6 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.author.pseudonym}</p>
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
              
              <p className="mb-4">{post.text}</p>
              
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {post.images.map((image, index) => (
                    <img 
                      key={index} 
                      src={image} 
                      alt={`Post by ${post.author.pseudonym}`}
                      className="w-full rounded-md"
                    />
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <button className="flex items-center hover:text-foreground">
                    ▲ {post.votes}
                  </button>
                </div>
                <div>
                  {post.commentCount} comments
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow p-4">
              <h2 className="font-semibold mb-4">Comments ({post.commentCount})</h2>
              <div className="flex mb-4">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <textarea 
                    className="w-full p-2 border rounded-md resize-none text-sm"
                    placeholder="Add a comment..."
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button className="bg-primary text-primary-foreground px-3 py-1 text-sm rounded-md">
                      Post
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-muted-foreground py-4">
                No comments yet. Be the first to comment!
              </div>
            </div>
          </div>
        </div>
        
        {/* Right sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
