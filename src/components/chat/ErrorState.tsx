
import React from 'react';

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">{error}</p>
      <button 
        onClick={onRetry}
        className="text-primary mt-2 hover:underline"
      >
        Try again
      </button>
    </div>
  );
};

export default ErrorState;
