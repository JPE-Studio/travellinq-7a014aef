
/// <reference types="vite/client" />

// Add custom badge variants
import '@radix-ui/react-alert-dialog';

declare module '@radix-ui/react-alert-dialog' {
  interface AlertDialogContentProps {
    className?: string;
  }
}

declare module '@/components/ui/badge' {
  interface BadgeProps {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning';
  }
}
