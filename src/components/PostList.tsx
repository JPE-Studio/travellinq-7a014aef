
import React from 'react';
import { Post } from '../types';
import PostCard from './PostCard';

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <div className="w-full bg-background overflow-x-hidden">
      {/* Content container with max width */}
      <div className="max-w-3xl mx-auto px-4 py-4 scrollbar-hide pb-safe">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default PostList;
