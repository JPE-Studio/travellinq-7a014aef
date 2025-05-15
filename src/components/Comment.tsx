
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, MessageSquare, CornerDownRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Comment as CommentType } from '@/types';
import CommentReplyForm from './CommentReplyForm';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ModerationActions } from './moderation/ModerationActions';

interface CommentProps {
  comment: CommentType;
  postId: string;
  isReply?: boolean;
  voteOnComment: (commentId: string, voteType: number) => Promise<void>;
  userVote: Record<string, number>;
  depth?: number; // Make depth optional
}

const Comment: React.FC<CommentProps> = ({
  comment,
  postId,
  isReply = false,
  voteOnComment,
  userVote,
  depth = 0 // Default to 0
}) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const initials = comment.author.pseudonym
    ? comment.author.pseudonym
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : '??';

  // Format date for display
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });
  
  const handleVote = async (voteType: number) => {
    await voteOnComment(comment.id, voteType);
  };
  
  const isHidden = comment.isHidden;
  
  return (
    <div className={cn("mb-4", isReply ? "ml-8" : "")}>
      <Card className={cn("p-3", isHidden && "bg-muted/30 border-dashed")}>
        {isHidden ? (
          <div className="p-2 text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">This comment has been hidden by a moderator</span>
            </div>
            {comment.hiddenReason && (
              <p className="text-sm">Reason: {comment.hiddenReason}</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <Link to={`/user/${comment.author.id}`}>
                <Avatar>
                  <AvatarImage src={comment.author.avatar || undefined} alt={comment.author.pseudonym || 'User'} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/user/${comment.author.id}`}
                    className="font-semibold hover:underline"
                  >
                    {comment.author.pseudonym || 'Anonymous User'}
                  </Link>
                  <span className="text-xs text-muted-foreground">{formattedDate}</span>
                </div>
                <p className="text-sm">{comment.text}</p>
                
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("p-1 h-7", userVote[comment.id] === 1 && "text-green-500")}
                    onClick={() => handleVote(1)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">{comment.votes > 0 ? comment.votes : ''}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("p-1 h-7", userVote[comment.id] === -1 && "text-red-500")}
                    onClick={() => handleVote(-1)}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-7"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="text-xs">Reply</span>
                  </Button>
                  
                  <ModerationActions 
                    type="comment"
                    contentId={comment.id}
                    authorId={comment.author.id}
                  />
                </div>
                
                {showReplyForm && user && (
                  <CommentReplyForm
                    postId={postId}
                    parentCommentId={comment.id}
                    authorName={comment.author.pseudonym}
                    onCancel={() => setShowReplyForm(false)}
                  />
                )}
                
                {comment.replies?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <h4 className="text-xs font-medium text-muted-foreground flex items-center mb-2">
                      <CornerDownRight className="h-3 w-3 mr-1" /> Replies
                    </h4>
                    {comment.replies.map((reply) => (
                      <Comment
                        key={reply.id}
                        comment={reply}
                        postId={postId}
                        isReply={true}
                        voteOnComment={voteOnComment}
                        userVote={userVote}
                        depth={depth + 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Comment;
