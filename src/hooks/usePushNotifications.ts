
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type PlatformType = 'ios' | 'android' | 'web';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect platform
  const getPlatform = (): PlatformType => {
    const userAgent = navigator.userAgent || navigator.vendor;
    if (/android/i.test(userAgent)) return 'android';
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    return 'web';
  };

  const platform = getPlatform();

  // Check if push notifications are supported and get permission status
  const checkPermission = async () => {
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
      return false;
    }

    const permission = Notification.permission;
    setPermissionStatus(permission as 'granted' | 'denied' | 'default');
    return permission === 'granted';
  };

  // Ask for permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission as 'granted' | 'denied' | 'default');
      return permission === 'granted';
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setError('Failed to request notification permission');
      return false;
    }
  };

  // Register device token with backend
  const registerToken = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Make sure we're authenticated when calling the function
      const { data, error: registrationError } = await supabase.functions.invoke('register-push-token', {
        body: { token, platform }
      });

      if (registrationError) {
        console.error('Registration error:', registrationError);
        throw new Error(registrationError.message || 'Failed to register token');
      }

      setPushEnabled(true);
      return true;
    } catch (err: any) {
      console.error('Error registering push token:', err);
      setError(err.message || 'Failed to register for push notifications');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle push notification subscription
  const togglePushNotifications = async () => {
    if (!user) {
      setError('You must be signed in to manage notifications');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      if (!pushEnabled) {
        // Request permission if not already granted
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          setError('Permission to send notifications was denied');
          return false;
        }

        // Here we would typically register with Firebase Cloud Messaging or other service
        // For this example, we'll simulate getting a token
        const mockToken = `device-${Math.random().toString(36).substring(2, 15)}`;
        return await registerToken(mockToken);
      } else {
        // Disable push notifications
        const { error: disableError } = await supabase.functions.invoke('register-push-token', {
          body: { 
            token: 'disable', 
            platform,
            enabled: false 
          }
        });

        if (disableError) {
          throw new Error(disableError.message || 'Failed to disable notifications');
        }

        setPushEnabled(false);
        return true;
      }
    } catch (err: any) {
      console.error('Error toggling push notifications:', err);
      setError(err.message || 'Failed to toggle push notifications');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check current permission status and enabled state on mount
  useEffect(() => {
    const checkCurrentState = async () => {
      await checkPermission();
      
      // Check if user has registered for push notifications by calling the edge function
      if (user && permissionStatus === 'granted') {
        try {
          const { data, error } = await supabase.functions.invoke('register-push-token', {
            body: { action: 'check-status' }
          });
          
          if (error) {
            console.error('Error checking push notification status:', error);
          } else {
            setPushEnabled(data?.enabled || false);
          }
        } catch (err) {
          console.error('Error checking push notification status:', err);
        }
      }
    };
    
    if (user) {
      checkCurrentState();
    }
  }, [user, permissionStatus]);

  return {
    permissionStatus,
    pushEnabled,
    loading,
    error,
    togglePushNotifications,
    registerToken,
    requestPermission
  };
};
