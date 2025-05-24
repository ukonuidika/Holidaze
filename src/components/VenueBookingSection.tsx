// components/VenueBookingSection.tsx
import React, { useState } from "react";
import { Users, Calendar } from "lucide-react";
import type { Venue } from "../types";
import { useAuth } from "../context/AuthContext";
import { BookNowModal } from "./BookNowModal";

interface VenueBookingSectionProps {
  venue: Venue;
  onViewCalendar: () => void;
  onBookingSuccess: () => void;
}

export const VenueBookingSection = ({
  venue,
  onViewCalendar,
  onBookingSuccess,
}: VenueBookingSectionProps): React.ReactElement => {
  const { isAuthenticated } = useAuth();

  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBookingSuccess = () => {
    alert("Booking created successfully!");
    onBookingSuccess();
  };
  return (
    <>
      <div className="mt-4">
        <button
          onClick={onViewCalendar}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Calendar className="h-5 w-5 mr-2" />
          View Booking Calendar
        </button>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">${venue.price}</p>
          <p className="text-gray-600">per night</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center text-gray-700 mb-2">
            <Users className="h-5 w-5 mr-2" />
            Up to {venue.maxGuests} guests
          </div>
          {isAuthenticated && (
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-8 rounded-md w-full"
              onClick={() => setShowBookingModal(true)}
            >
              Book Now
            </button>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookNowModal
          venue={venue}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
};
