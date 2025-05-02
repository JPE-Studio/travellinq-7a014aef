
import React, { ReactNode } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  showHeader = true 
}) => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background overflow-hidden">
      {/* Full width header */}
      {showHeader && <Header />}
      
      {/* Content area with potential ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col overflow-hidden pb-16 md:pb-0">
          {children}
        </div>
        
        {/* Right sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default PageLayout;
