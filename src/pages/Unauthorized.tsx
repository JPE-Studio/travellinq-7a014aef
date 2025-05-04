
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';

const Unauthorized: React.FC = () => {
  const { roles } = useUserRole();
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[70vh]">
        <Shield className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          You don't have sufficient privileges to access this page. 
          Please contact an administrator if you believe this is an error.
        </p>
        
        <div className="mb-6 p-4 bg-muted rounded-md">
          <p className="text-sm">Your current role(s): {roles.join(', ')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="default">
            <Link to="/">Return to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/profile">Go to Profile</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/become-admin">Become Admin</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Unauthorized;
