
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/integrations/supabase/client';

const BecomeAdmin: React.FC = () => {
  const { user, refreshRoles } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMakeSuperadmin = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to become an admin",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('make-superadmin');
      
      if (functionError) {
        throw new Error(functionError.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSuccess(true);
      toast({
        title: "Success!",
        description: "You are now a superadmin",
      });
      
      // Refresh the user's roles
      await refreshRoles();
      
    } catch (err: any) {
      console.error("Error becoming superadmin:", err);
      setError(err.message || "Failed to become superadmin");
      toast({
        title: "Error",
        description: err.message || "Failed to become superadmin",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You must be logged in to access this page.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => window.location.href = '/auth'}>
                Go to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-purple-500" />
            </div>
            <CardTitle className="text-center">Become a Superadmin</CardTitle>
            <CardDescription className="text-center">
              This will grant you full access to all system features.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-lg font-semibold">Success!</p>
                <p>You are now a superadmin with full access to the system.</p>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 p-4 rounded-md flex gap-3 items-center">
                <AlertCircle className="text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
            ) : (
              <p className="text-center mb-4">
                Click the button below to grant yourself superadmin privileges.
                As a superadmin, you'll have full control over all aspects of the system.
              </p>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            {!success && (
              <Button 
                onClick={handleMakeSuperadmin} 
                disabled={loading}
                size="lg"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Processing..." : "Make Me Superadmin"}
              </Button>
            )}
            {success && (
              <Button onClick={() => window.location.href = '/admin'}>
                Go to Admin Dashboard
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BecomeAdmin;
