
import React from 'react';
import { Post } from '../types';
import { usePostSubscription } from '@/hooks/usePostSubscription';
import { usePostVoting } from '@/hooks/usePostVoting';
import { usePostTranslation } from '@/hooks/usePostTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { deletePost } from '@/services/postService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PostHeader from '@/components/post/PostHeader';
import PostContent from '@/components/post/PostContent';
import PostInteractions from '@/components/post/PostInteractions';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  // Always set autoTranslate to false to disable automatic translation
  const autoTranslate = false;
  
  // Post subscription logic
  const { isSubscribed, loading: subscriptionLoading, handleSubscribe } = usePostSubscription(post.id);
  
  // Post voting logic
  const { votes, userVote, loading: votingLoading, handleVote } = usePostVoting(post.id, post.votes);
  
  // Post translation logic - now with auto-translate disabled
  const { isTranslating, translatedText, detectedLanguage, handleTranslate, translationAvailable } = usePostTranslation(post.text, autoTranslate);
  
  // Combined loading state
  const loading = subscriptionLoading || votingLoading || isDeleting;
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted",
      });
      // Invalidate posts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // If on post detail page, navigate back to home
      if (window.location.pathname.includes(`/post/${post.id}`)) {
        navigate('/');
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  return (
    <>
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
            authorId={post.author.id}
            votes={votes}
            commentCount={post.commentCount}
            userVote={userVote}
            handleVote={handleVote}
            loading={loading}
            translatedText={translatedText}
            isTranslating={isTranslating}
            handleTranslate={handleTranslate}
            showTranslateButton={true}
            translationAvailable={translationAvailable}
            onDelete={profile?.id === post.author.id ? handleDeleteClick : undefined}
          />
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post
              and all associated comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostCard;
