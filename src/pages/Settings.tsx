
import React from 'react';
import Header from '@/components/Header';
import { currentUser } from '@/data/mockData';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Full width header */}
      <Header />
      
      {/* Content area with ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col">
          {/* Page specific content here */}
          <div className="max-w-3xl mx-auto px-4 py-4 w-full">
            <Link to="/profile" className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground">
              <ChevronLeft size={16} className="mr-1" />
              Back to profile
            </Link>
            
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            
            <div className="bg-card rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
              
              <div className="flex items-center mb-6">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>
                    <User className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <button className="px-4 py-2 border rounded-md text-sm">
                  Change Profile Photo
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Display Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md"
                    defaultValue={currentUser.pseudonym} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea 
                    className="w-full p-2 border rounded-md resize-none"
                    rows={3}
                    defaultValue={currentUser.bio || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md" 
                    defaultValue="Portland, OR"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Enable push notifications
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Location Sharing</p>
                    <p className="text-sm text-muted-foreground">
                      Share your location with the community
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button className="px-4 py-2 border rounded-md">Cancel</button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                Save Changes
              </button>
            </div>
          </div>
        </div>
        
        {/* Right sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
      </div>
    </div>
  );
};

export default Settings;
