
import React from 'react';
import { User } from '../types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User as UserIcon, Settings, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileButtonProps {
  user: User;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ user }) => {
  const navigate = useNavigate();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-foreground/30">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.pseudonym} />
            <AvatarFallback>
              <UserIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="font-medium">{user.pseudonym}</p>
          <p className="text-xs text-muted-foreground truncate">
            {user.bio || 'No bio provided'}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/chats')}>
          <MessageCircle className="mr-2 h-4 w-4" />
          <span>Messages</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileButton;
