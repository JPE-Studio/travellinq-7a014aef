export interface User {
  id: string;
  pseudonym: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: Date;
  preferredLanguage?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
}

export interface Post {
  id: string;
  author: User;
  text: string;
  images?: string[];
  category: 'campsite' | 'service' | 'question' | 'general';
  location: {
    lat: number;
    lng: number;
  };
  distance?: number; // in km
  votes: number;
  createdAt: Date;
  commentCount: number;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  postId: string;
  parentCommentId?: string;
  votes: number;
  createdAt: Date;
}

export interface BuddyConnection {
  id: string;
  user_id: string;
  buddy_id: string;
  status: 'pending' | 'active' | 'rejected';
  notify_at_100km: boolean;
  notify_at_50km: boolean;
  notify_at_20km: boolean;
  created_at: Date;
}
