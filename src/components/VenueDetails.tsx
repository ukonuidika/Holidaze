// components/VenueDetails.tsx
import React from "react";
import { Star, MapPin } from "lucide-react";
import type { Venue } from "../types";

interface VenueDetailsProps {
  venue: Venue;
}

export const VenueDetails = ({
  venue,
}: VenueDetailsProps): React.ReactElement => (
  <>
    <div className="flex justify-between items-start">
      <h1 className="text-2xl font-bold text-gray-900 truncate">
        {venue.name}
      </h1>
      <div className="flex items-center flex-shrink-0">
        <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
        <span className="ml-1 text-gray-700">{venue.rating}</span>
      </div>
    </div>

    <p className="mt-2 text-gray-600">{venue.description}</p>

    <div className="mt-4">
      <div className="flex items-center text-gray-700">
        <MapPin className="h-5 w-5 mr-2" />
        {venue.location.city}, {venue.location.country}
      </div>
    </div>
  </>
);
