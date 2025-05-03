
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

      const { error: registrationError } = await supabase.functions.invoke('register-push-token', {
        body: { token, platform }
      });

      if (registrationError) {
        throw registrationError;
      }

      setPushEnabled(true);
      return true;
    } catch (err) {
      console.error('Error registering push token:', err);
      setError('Failed to register for push notifications');
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

        // Here we would typically register for push notifications via Firebase or other service
        // For this example, we'll simulate getting a token
        const mockToken = `device-${Math.random().toString(36).substring(2, 15)}`;
        return await registerToken(mockToken);
      } else {
        // Disable push notifications logic would go here
        // For now we'll just update the UI state
        setPushEnabled(false);
        return true;
      }
    } catch (err) {
      console.error('Error toggling push notifications:', err);
      setError('Failed to toggle push notifications');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check current permission status on mount
  useEffect(() => {
    checkPermission();
  }, []);

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
