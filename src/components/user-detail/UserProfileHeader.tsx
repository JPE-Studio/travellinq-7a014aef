
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, ArrowLeft } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserProfileHeaderProps {
  userData: {
    pseudonym: string;
    avatar?: string;
    location?: string | null;
    bannerImage?: string;
  };
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ userData }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-2 left-2 z-10 bg-background/50 backdrop-blur-sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className={`${userData.bannerImage ? '' : 'bg-gradient-to-r from-blue-500 to-purple-500'} h-32`}>
          {userData.bannerImage && (
            <img 
              src={userData.bannerImage} 
              alt="Profile banner"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="absolute bottom-0 translate-y-1/2 left-6">
          <Avatar className="h-24 w-24 ring-4 ring-background">
            <AvatarImage src={userData.avatar} alt={userData.pseudonym} className="object-cover" />
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
            {userData.location}
          </CardDescription>
        )}
      </CardHeader>
    </>
  );
};

export default UserProfileHeader;
