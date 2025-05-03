
import { supabase } from "@/integrations/supabase/client";

// Shared notification type definition
export type NotificationType = 
  | "mention" 
  | "reply" 
  | "vote" 
  | "subscription" 
  | "nearby" 
  | "buddy_request" 
  | "comment_on_same_post" 
  | "message";

// Notification interface used throughout the application
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: Date;
  read: boolean;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  postId?: string;
  link?: string;
}

// Shared CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};
