// components/BackButton.tsx
import React from "react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({
  onClick,
}: BackButtonProps): React.ReactElement => (
  <button
    onClick={onClick}
    className="m-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
  >
    <ArrowLeft className="h-4 w-4 mr-2" />
    Back to venues
  </button>
);
