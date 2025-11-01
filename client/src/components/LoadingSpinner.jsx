import React from 'react';
import { Gamepad2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8FFD7] to-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex p-6 bg-gradient-to-r from-[#5E936C] to-[#93DA97] rounded-full shadow-2xl animate-bounce">
            <Gamepad2 className="h-12 w-12 text-white" />
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-[#3E5F44] rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-[#5E936C] rounded-full animate-pulse delay-100"></div>
          <div className="w-4 h-4 bg-[#93DA97] rounded-full animate-pulse delay-200"></div>
        </div>
        <p className="text-[#3E5F44] text-xl font-bold mt-4">Loading Your Adventure...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;