import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8FFD7] to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="bg-red-100 border border-red-300 rounded-full p-6">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold bg-gradient-to-r from-[#3E5F44] to-[#5E936C] bg-clip-text text-transparent mb-4">
          Oops!
        </h1>
        
        <h2 className="text-2xl font-semibold text-[#3E5F44] mb-4">
          Something went wrong
        </h2>
        
        <p className="text-[#557063] mb-8">
          {error?.statusText || error?.message || 'An unexpected error occurred'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#3E5F44] rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
          
          <Link 
            to="/"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:shadow-lg text-white rounded-lg transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-[#557063] hover:text-[#3E5F44] mb-2">
              Debug Information
            </summary>
            <pre className="bg-[#E8FFD7]/50 border border-[#93DA97]/50 p-4 rounded-lg text-xs text-[#3E5F44] overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
