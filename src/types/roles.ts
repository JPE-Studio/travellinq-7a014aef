
import { User } from './index';

export type UserRole = 'user' | 'paid_user' | 'moderator' | 'admin' | 'superadmin';

export interface UserWithRole extends User {
  roles: UserRole[];
}

export interface PostReport {
  id: string;
  post_id: string;
  reporter_id: string | null;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  updated_at: string;
  resolved_by: string | null;
  resolution_notes: string | null;
  resolution_action: string | null;
  reporter?: User;
  post?: any;
}

export interface HashtagData {
  id: string;
  name: string;
  created_at: string;
  post_count?: number;
}

export interface AppMetrics {
  totalUsers: number;
  dailyActiveUsers: number;
  totalPosts: number;
  newSignups: number;
  postsByCategory: Record<string, number>;
  usersByLocation: {
    location: string;
    count: number;
  }[];
}

export interface UserExport {
  id: string;
  pseudonym: string;
  posts: number;
  votes: number;
  comments: number;
  location?: string;
  joinedAt: string;
}

// Add a new function to assign a superadmin role
export const assignSuperadmin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await fetch('/api/assign-superadmin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    }).then(res => res.json());
    
    return !error;
  } catch (error) {
    console.error("Error assigning superadmin role:", error);
    return false;
  }
};
