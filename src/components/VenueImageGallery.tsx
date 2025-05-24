// components/VenueImageGallery.tsx
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Venue } from "../types";

interface VenueImageGalleryProps {
  venue: Venue;
}

export const VenueImageGallery = ({
  venue,
}: VenueImageGalleryProps): React.ReactElement => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = venue.media && venue.media.length > 0 ? venue.media : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center">
        <img
          src="/api/placeholder/800/600"
          alt="Not available"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={images[currentImageIndex]?.url || "/api/placeholder/800/600"}
        alt={images[currentImageIndex]?.alt || "Venue image"}
        className="w-full h-64 md:h-96 object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            aria-label="Previous image"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            aria-label="Next image"
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((image, index) => (
              <button
                key={image.url || `image-${image.alt || index}`} // Fixed: Using unique identifier instead of index
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentImageIndex
                    ? "bg-white"
                    : "bg-white bg-opacity-50"
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
