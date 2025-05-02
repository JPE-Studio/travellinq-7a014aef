
import React from 'react';

const CreatePostButton: React.FC = () => {
  return (
    <button className="fixed bottom-6 right-6 bg-secondary text-secondary-foreground w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  );
};

export default CreatePostButton;
