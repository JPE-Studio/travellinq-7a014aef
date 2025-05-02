
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, MapPin } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface UserProfileHeaderProps {
  userData: {
    pseudonym: string;
    avatar?: string;
    location?: string | null;
  };
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ userData }) => {
  return (
    <>
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-32"></div>
        <div className="absolute bottom-0 translate-y-1/2 left-6">
          <Avatar className="h-24 w-24 ring-4 ring-background">
            <AvatarImage src={userData.avatar} alt={userData.pseudonym} />
            <AvatarFallback className="text-lg">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardHeader className="pt-16">
        <CardTitle className="text-2xl">{userData.pseudonym}</CardTitle>
        {userData.location && (
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {userData.location}
          </CardDescription>
        )}
      </CardHeader>
    </>
  );
};

export default UserProfileHeader;
