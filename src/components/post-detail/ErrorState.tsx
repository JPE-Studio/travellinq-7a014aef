
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const ErrorState: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      <div className="flex-grow flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This post may have been removed or is not available.
          </p>
          <Link to="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
