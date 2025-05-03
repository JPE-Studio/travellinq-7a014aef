
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

const UserDetailError: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="border-destructive/50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <UserX className="h-16 w-16 text-destructive/70" />
        </div>
        <CardTitle className="text-destructive">User not found</CardTitle>
        <CardDescription className="text-base">
          We couldn't find the profile you're looking for.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserDetailError;
