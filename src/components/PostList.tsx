
import React, { useEffect, useRef } from 'react';
import { Post } from '../types';
import PostCard from './PostCard';

interface PostListProps {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const PostList: React.FC<PostListProps> = ({ posts, loading, hasMore, onLoadMore }) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Setup intersection observer to detect when we need to load more posts
  useEffect(() => {
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create a new IntersectionObserver
    observerRef.current = new IntersectionObserver(entries => {
      // If the loading element is visible and we have more posts to load
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    }, {
      // Start loading more when we're 200px from the bottom
      rootMargin: '0px 0px 200px 0px'
    });

    // Observe the load more element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="w-full bg-background overflow-x-hidden">
      {/* Content container with max width */}
      <div className="max-w-3xl mx-auto px-4 py-4 scrollbar-hide pb-safe">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        
        {/* Loading indicator or load more trigger */}
        <div 
          ref={loadMoreRef} 
          className="py-4 flex justify-center"
        >
          {loading && (
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          )}
          {!loading && hasMore && (
            <div className="h-8">
              {/* Invisible element to trigger loading */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostList;
