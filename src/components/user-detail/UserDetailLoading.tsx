
import React from 'react';
import { Loader2 } from 'lucide-react';

const UserDetailLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      <p className="mt-4 text-muted-foreground">Loading user profile...</p>
    </div>
  );
};

export default UserDetailLoading;
