import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Wifi,
  ParkingSquare as Parking,
  Coffee,
  Cat,
  Star,
} from "lucide-react";
import type { Venue } from "../types";

// Pagination Controls Component
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps): React.ReactElement | null => {
  if (totalPages <= 1) return null;

  const createPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      if (startPage > 2) {
        pages.push(-1);
      } else {
        startPage = 2;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push(-1);
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = createPageNumbers();

  return (
    <div className="mt-12 flex justify-center">
      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-700 mb-4">
          Showing page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </span>

        <nav
          className="inline-flex shadow-md rounded-md"
          aria-label="Pagination"
        >
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {pages.map((pageNum: number, index: number) =>
            pageNum === -1 ? (
              <span
                key={`ellipsis-${index}-${currentPage}`}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                …
              </span>
            ) : (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                  currentPage === pageNum
                    ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-current={currentPage === pageNum ? "page" : undefined}
                aria-label={`Page ${pageNum}`}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

// Venue Card Component
interface VenueCardProps {
  venue: Venue;
  onVenueClick: (venue: Venue) => void;
}

export const VenueCard = ({
  venue,
  onVenueClick,
}: VenueCardProps): React.ReactElement => {
  const handleClick = () => {
    onVenueClick(venue);
  };

  return (
    <button
      type="button"
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 w-full text-left"
      onClick={handleClick}
      aria-label={`View details for ${venue.name}`}
    >
      <div className="relative h-48">
        <img
          src={
            venue.media && venue.media.length > 0
              ? venue.media[0].url
              : "/api/placeholder/400/300"
          }
          alt={
            venue.media && venue.media.length > 0
              ? venue.media[0].alt ?? "Venue image"
              : "No image available"
          }
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 right-0 bg-emerald-600 text-white px-3 py-1 m-2 rounded-md font-semibold">
          ${venue.price}/night
        </div>
      </div>
      <div className="p-4 w-full">
        <div className="flex items-start justify-between w-full gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {venue.name}
            </h3>
            <p className="text-sm text-gray-600">
              {venue.location.city}, {venue.location.country}
            </p>
          </div>

          <div className="flex items-center flex-shrink-0">
            <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
            <span className="ml-1 text-sm text-gray-700">{venue.rating}</span>
          </div>
        </div>

        <p className="mt-2 text-gray-600 text-sm line-clamp-2">
          {venue.description}
        </p>

        <div className="mt-4 flex items-center space-x-2">
          {venue.meta.wifi && (
            <div className="text-emerald-600" title="WiFi Available">
              <Wifi className="h-5 w-5" />
            </div>
          )}
          {venue.meta.parking && (
            <div className="text-emerald-600" title="Parking Available">
              <Parking className="h-5 w-5" />
            </div>
          )}
          {venue.meta.breakfast && (
            <div className="text-emerald-600" title="Breakfast Included">
              <Coffee className="h-5 w-5" />
            </div>
          )}
          {venue.meta.pets && (
            <div className="text-emerald-600" title="Pets Allowed">
              <Cat className="h-5 w-5" />
            </div>
          )}
          <div className="flex-grow"></div>
          <span className="text-sm text-gray-600">
            Up to {venue.maxGuests} guests
          </span>
        </div>
      </div>
    </button>
  );
};
