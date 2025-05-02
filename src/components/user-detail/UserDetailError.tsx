
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UserDetailError: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">User not found</CardTitle>
        <CardDescription>
          We couldn't find the profile you're looking for.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserDetailError;
