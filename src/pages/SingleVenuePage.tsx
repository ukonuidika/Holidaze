import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Venue } from "../types";
import { getVenueById } from "../services/api";
import { LoadingState, ErrorState } from "../components/LoadingState";
import { Header } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { BackButton } from "../components/BackButton";
import { VenueImageGallery } from "../components/VenueImageGallery";
import { VenueDetails } from "../components/VenueDetails";
import { VenueAmenities } from "../components/VenueAmenities";
import { VenueBookingSection } from "../components/VenueBookingSection";
import { BookingCalendar } from "../components/BookingCalendar";

export default function SingleVenuePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const fetchVenue = async () => {
    if (!id) {
      setError("Venue ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getVenueById(id);
      setVenue(data.data);
    } catch (err) {
      console.error("Failed to fetch venue:", err);
      setError("Failed to load venue. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenue();
  }, [id]);

  const handleBackClick = () => {
    navigate("/");
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !venue) {
    return <ErrorState error={error ?? "Venue not found"} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <BackButton onClick={handleBackClick} />

          <div className="md:flex">
            <div className="md:w-1/2">
              <VenueImageGallery venue={venue} />
            </div>

            <div className="p-6 md:w-1/2">
              <VenueDetails venue={venue} />
              <VenueAmenities meta={venue.meta} />
              <VenueBookingSection
                venue={venue}
                onViewCalendar={toggleCalendar}
                onBookingSuccess={fetchVenue}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <BookingCalendar
        bookings={venue.bookings || []}
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />
    </div>
  );
}
