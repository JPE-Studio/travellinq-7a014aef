
import React from 'react';
import { User } from '../types';

interface ProfileButtonProps {
  user: User;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ user }) => {
  return (
    <button className="flex items-center justify-center rounded-full overflow-hidden w-8 h-8 bg-forest-light">
      {user.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.pseudonym}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-primary-foreground text-sm font-bold">
          {user.pseudonym.charAt(0).toUpperCase()}
        </span>
      )}
    </button>
  );
};

export default ProfileButton;
