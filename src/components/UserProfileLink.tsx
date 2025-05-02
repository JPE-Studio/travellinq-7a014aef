import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { User as UserType } from '@/types';
interface UserProfileLinkProps {
  user: UserType | {
    id: string;
    pseudonym: string;
    avatar?: string;
  };
  showAvatar?: boolean;
  className?: string;
}
const UserProfileLink: React.FC<UserProfileLinkProps> = ({
  user,
  showAvatar = true,
  className = ""
}) => {
  return <Link to={`/users/${user.id}`} className={`inline-flex items-center gap-2 hover:underline ${className}`}>
      {showAvatar && <Avatar className="h-6 w-6">
          <AvatarImage src={user.avatar} alt={user.pseudonym} />
          <AvatarFallback>
            <User className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>}
      <span className="delete this ">{user.pseudonym}</span>
    </Link>;
};
export default UserProfileLink;