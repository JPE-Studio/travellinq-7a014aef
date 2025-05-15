
export interface User {
  id: string;
  pseudonym: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  preferredLanguage?: string;
  autoTranslate: boolean;
  locationSharing: boolean;
  ghostMode?: boolean;
  isBlocked?: boolean;
  feedRadius?: number;
  joinedAt: Date;
}

export interface Post {
  id: string;
  text: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  locationLat: number;
  locationLng: number;
  distance?: number;
  commentCount: number;
  images?: PostImage[];
  category: string;
  isHidden?: boolean;  // New field
  hiddenReason?: string; // New field
  hiddenBy?: string; // New field
  hiddenAt?: string; // New field
}

export interface Comment {
  id: string;
  text: string;
  author: User;
  createdAt: Date;
  postId: string;
  parentCommentId?: string;
  votes: number;
  replies?: Comment[];
  isHidden?: boolean;  // New field
  hiddenReason?: string; // New field
  hiddenBy?: string; // New field
  hiddenAt?: string; // New field
}

export interface PostImage {
  id: string;
  imageUrl: string;
  orderIndex: number;
}

// Update BuddyConnection to match both database and application naming
export interface BuddyConnection {
  id: string;
  userId: string;
  buddyId: string;
  status: string;
  createdAt: Date;
  // Database fields
  user_id?: string;
  buddy_id?: string;
  created_at?: string;
  // Notification settings with both naming conventions for compatibility
  notifyAt20km: boolean;
  notifyAt50km: boolean;
  notifyAt100km: boolean;
  notify_at_20km?: boolean;
  notify_at_50km?: boolean;
  notify_at_100km?: boolean;
}
