import React from "react";

// Loading State Component
export const LoadingState = (): React.ReactElement => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">Loading venues...</p>
    </div>
  </div>
);

// Error State Component
interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps): React.ReactElement => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center text-center max-w-md">
      <div className="text-red-500 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-gray-700 text-lg font-medium">{error}</p>
      <button
        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  </div>
);
