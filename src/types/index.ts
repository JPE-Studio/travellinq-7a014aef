
export interface User {
  id: string;
  pseudonym: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: Date;
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
