
import React from 'react';
import Header from '@/components/Header';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      <div className="flex-grow flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    </div>
  );
};

export default LoadingState;
