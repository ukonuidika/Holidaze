import React, { useState } from "react";
import { Calendar, Users, X, MapPin, Star } from "lucide-react";
import { createBooking } from "../services/api";
import type { Venue } from "../types";

interface BookNowModalProps {
  venue: Venue;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const BookNowModal: React.FC<BookNowModalProps> = ({
  venue,
  onClose,
  onBookingSuccess,
}) => {
  const [bookingData, setBookingData] = useState({
    dateFrom: "",
    dateTo: "",
    guests: 1,
    venueId: venue.id,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate dates
    if (new Date(bookingData.dateFrom) >= new Date(bookingData.dateTo)) {
      setError("Check-out date must be after check-in date");
      setLoading(false);
      return;
    }

    // Validate guests
    if (bookingData.guests < 1 || bookingData.guests > venue.maxGuests) {
      setError(`Number of guests must be between 1 and ${venue.maxGuests}`);
      setLoading(false);
      return;
    }

    try {
      await createBooking(bookingData);
      onBookingSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = (): number => {
    if (!bookingData.dateFrom || !bookingData.dateTo) return 0;
    const start = new Date(bookingData.dateFrom);
    const end = new Date(bookingData.dateTo);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalPrice = calculateNights() * Number(venue.price || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20">
        {/* Hero Image Section */}
        {venue.media && venue.media.length > 0 && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={venue.media[0].url}
              alt={venue.media[0].alt || venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>

            {/* Venue Info Overlay */}
            <div className="absolute bottom-4 left-6 text-white">
              <h2 className="text-2xl font-bold mb-1 truncate">{venue.name}</h2>
              <div className="flex items-center gap-3 text-sm opacity-90">
                {venue.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {venue.location.city}, {venue.location.country}
                    </span>
                  </div>
                )}
                {venue.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{venue.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header for venues without images */}
        {(!venue.media || venue.media.length === 0) && (
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 truncate">
                Book {venue.name}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all duration-200 group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="text-gray-700 font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Check-in Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateFrom"
                    value={bookingData.dateFrom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200 text-gray-700"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-gray-700 font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Check-out Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateTo"
                    value={bookingData.dateTo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200 text-gray-700"
                    required
                    min={
                      bookingData.dateFrom ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
              </div>
            </div>

            {/* Guests Input */}
            <div>
              <label className="text-gray-700 font-medium mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Number of Guests
                <span className="text-sm text-gray-500 ml-auto">
                  Max: {venue.maxGuests}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="guests"
                  value={bookingData.guests}
                  onChange={handleInputChange}
                  min="1"
                  max={venue.maxGuests}
                  className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200 text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Price Summary */}
            {calculateNights() > 0 && venue.price && (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border border-emerald-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">
                      ${venue.price}/night × {calculateNights()} nights
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      ${totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>
                      {bookingData.guests} guest
                      {bookingData.guests > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-all duration-200 hover:scale-[0.98]"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center gap-3 hover:scale-[0.98] disabled:opacity-70 shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
