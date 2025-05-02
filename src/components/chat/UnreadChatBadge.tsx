
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getUnreadMessageCount } from '@/services/messageService';

interface UnreadChatBadgeProps {
  className?: string;
}

const UnreadChatBadge: React.FC<UnreadChatBadgeProps> = ({ className }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  
  // Don't show badge on chat pages
  const isInChatsSection = location.pathname.startsWith('/chat') || location.pathname === '/chats';
  // Check for query param that forces hiding badge (used after clicking notification)
  const forceHideBadge = location.search.includes('forceHideBadge=true');
  
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadMessageCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    // Initial fetch
    fetchUnreadCount();
    
    // Set up interval to check for new messages
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
    
    // Set up realtime subscription for new messages
    const { supabase } = require('@/integrations/supabase/client');
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          // If message is not from current user, increment count
          fetchUnreadCount();
        }
      )
      .subscribe();
      
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);
  
  if (unreadCount === 0 || isInChatsSection || forceHideBadge) {
    return null;
  }
  
  return (
    <span className={`absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center ${className}`}>
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};

export default UnreadChatBadge;
