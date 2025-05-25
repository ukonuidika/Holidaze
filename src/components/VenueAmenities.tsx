// components/VenueAmenities.tsx
import React from "react";
import { Wifi, ParkingSquare as Parking, Coffee, Cat } from "lucide-react";
import type { Venue } from "../types";

interface VenueAmenitiesProps {
  meta: Venue["meta"];
}

export const VenueAmenities = ({
  meta,
}: VenueAmenitiesProps): React.ReactElement => {
  // Specific methods for different amenity types
  const getWifiStatus = () => (meta.wifi ? "Available" : "Not Available");
  const getParkingStatus = () => (meta.parking ? "Available" : "Not Available");
  const getBreakfastStatus = () =>
    meta.breakfast ? "Included" : "Not Included";
  const getPetsStatus = () => (meta.pets ? "Allowed" : "Not Allowed");

  // Specific styling methods
  const getWifiClass = () => (meta.wifi ? "text-gray-700" : "text-gray-400");
  const getParkingClass = () =>
    meta.parking ? "text-gray-700" : "text-gray-400";
  const getBreakfastClass = () =>
    meta.breakfast ? "text-gray-700" : "text-gray-400";
  const getPetsClass = () => (meta.pets ? "text-gray-700" : "text-gray-400");

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div className={`flex items-center ${getWifiClass()}`}>
          <Wifi className="h-5 w-5" />
          <span className="ml-2">WiFi {getWifiStatus()}</span>
        </div>
        <div className={`flex items-center ${getParkingClass()}`}>
          <Parking className="h-5 w-5" />
          <span className="ml-2">Parking {getParkingStatus()}</span>
        </div>
        <div className={`flex items-center ${getBreakfastClass()}`}>
          <Coffee className="h-5 w-5" />
          <span className="ml-2">Breakfast {getBreakfastStatus()}</span>
        </div>
        <div className={`flex items-center ${getPetsClass()}`}>
          <Cat className="h-5 w-5" />
          <span className="ml-2">Pets {getPetsStatus()}</span>
        </div>
      </div>
    </div>
  );
};
