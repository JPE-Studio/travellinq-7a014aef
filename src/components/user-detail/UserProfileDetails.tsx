
import React from 'react';
import { Calendar, Globe, Link, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfileDetailsProps {
  userData: {
    bio?: string | null;
    joinedAt?: Date;
    preferredLanguage?: string;
    website?: string | null;
  };
  approximateDistance: number | null;
}

const UserProfileDetails: React.FC<UserProfileDetailsProps> = ({ 
  userData,
  approximateDistance
}) => {
  return (
    <div className="space-y-6">
      {/* Bio section */}
      {userData.bio && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium leading-none">Bio</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {userData.bio}
          </p>
        </div>
      )}

      {/* User details */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-none">Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {userData.joinedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {format(new Date(userData.joinedAt), 'MMMM yyyy')}</span>
            </div>
          )}
          
          {userData.preferredLanguage && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Speaks {userData.preferredLanguage}</span>
            </div>
          )}

          {userData.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link className="h-4 w-4" />
              <a 
                href={
                  userData.website.startsWith('http') 
                    ? userData.website 
                    : `https://${userData.website}`
                }
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {userData.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {approximateDistance !== null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Approximately {approximateDistance} km away</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetails;
