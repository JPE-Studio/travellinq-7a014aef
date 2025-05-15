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
