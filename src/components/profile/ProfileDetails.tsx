
import React from 'react';
import { Link2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProfileDetailsProps {
  userData: {
    preferredLanguage?: string;
    bio: string | null;
    website?: string | null;
    joinedAt?: Date;
  };
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ userData }) => {
  return (
    <>
      {userData.preferredLanguage && (
        <div className="mb-4">
          <Badge variant="outline" className="bg-primary/5 hover:bg-primary/5 text-xs font-normal">
            {userData.preferredLanguage === 'en' ? 'English' : userData.preferredLanguage}
          </Badge>
        </div>
      )}
      
      {userData.bio && (
        <div className="mb-4">
          <h2 className="text-sm font-medium mb-2 text-foreground/80">About</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{userData.bio}</p>
        </div>
      )}
      
      <div className="space-y-2.5">
        {userData.website && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Link2 className="h-3 w-3 mr-2 text-primary/50" />
            <a 
              href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary hover:underline transition-colors"
            >
              {userData.website}
            </a>
          </div>
        )}
        
        {userData.joinedAt && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-2 text-primary/50" />
            Joined {userData.joinedAt.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileDetails;
