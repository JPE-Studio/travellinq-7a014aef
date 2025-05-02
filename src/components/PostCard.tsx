
import React, { useState } from 'react';
import { Post } from '../types';
import { usePostSubscription } from '@/hooks/usePostSubscription';
import { usePostVoting } from '@/hooks/usePostVoting';
import { usePostTranslation } from '@/hooks/usePostTranslation';
import { useAuth } from '@/contexts/AuthContext';
import PostHeader from '@/components/post/PostHeader';
import PostContent from '@/components/post/PostContent';
import PostInteractions from '@/components/post/PostInteractions';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { profile } = useAuth();
  const autoTranslate = profile?.autoTranslate || false;
  
  // Post subscription logic
  const { isSubscribed, loading: subscriptionLoading, handleSubscribe } = usePostSubscription(post.id);
  
  // Post voting logic
  const { votes, userVote, loading: votingLoading, handleVote } = usePostVoting(post.id, post.votes);
  
  // Post translation logic - now with auto-translate
  const { isTranslating, translatedText, detectedLanguage, handleTranslate } = usePostTranslation(post.text, autoTranslate);
  
  // Combined loading state
  const loading = subscriptionLoading || votingLoading;
  
  return (
    <div className="bg-card rounded-lg shadow mb-4 overflow-hidden">
      <div className="p-4">
        {/* Post header with user info and subscribe button */}
        <PostHeader 
          post={post}
          isSubscribed={isSubscribed}
          handleSubscribe={handleSubscribe}
          loading={loading}
        />

        {/* Post content */}
        <PostContent 
          post={post}
          translatedText={translatedText}
          detectedLanguage={detectedLanguage}
        />
        
        {/* Post interactions */}
        <PostInteractions 
          postId={post.id}
          votes={votes}
          commentCount={post.commentCount}
          userVote={userVote}
          handleVote={handleVote}
          loading={loading}
          translatedText={translatedText}
          isTranslating={isTranslating}
          handleTranslate={handleTranslate}
          showTranslateButton={!autoTranslate || !translatedText}
        />
      </div>
    </div>
  );
};

export default PostCard;
