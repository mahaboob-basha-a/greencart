import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex gap-2">
        <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:0s]"></div>
        <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
        <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
};

export default Loader;
