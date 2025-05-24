import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Venue } from "../types";
import { getAllVenues } from "../services/api";

// Import separated components and hooks
import { useVenueSearch } from "../hooks/useVenueSearch";
import { SearchBar, ResultsHeader, EmptyState } from "../components/Search";
import { VenueCard, PaginationControls } from "../components/VenuesComponents";
import { LoadingState, ErrorState } from "../components/LoadingState";
import { Header } from "../components/NavBar";
import { Footer } from "../components/Footer";

// Main HomePage Component
export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    setAllVenues,
    searchTerm,
    setSearchTerm,
    filterPrice,
    setFilterPrice,
    currentVenues,
    currentPage,
    totalPages,
    isSearching,
    searchError,
    hasActiveSearch,
    resultsCount,
    goToPage,
    clearSearch,
  } = useVenueSearch();

  // Load initial venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await getAllVenues();
        setAllVenues(data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch venues:", err);
        setError("Failed to load venues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [setAllVenues]);

  const handleVenueClick = (venue: Venue) => {
    navigate(`/venue/${venue.id}`);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header text="Sign In" link="/sign-in" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-emerald-700 to-teal-500 rounded-xl overflow-hidden mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  Find Your Perfect Venue
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-emerald-50 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Discover unique places to stay, relax and enjoy with your
                  loved ones.
                </p>
              </div>

              {/* Enhanced Search and Filter Bar */}
              <div className="mt-8">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <SearchBar
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      onClearSearch={clearSearch}
                      isSearching={isSearching}
                      hasActiveSearch={hasActiveSearch}
                    />
                    <div className="md:w-48">
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Max price: ${filterPrice}
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        step="50"
                        value={filterPrice}
                        onChange={(e) => setFilterPrice(Number(e.target.value))}
                        className="w-full h-2 mt-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
        </div>

        {/* Venues Grid */}
        <div className="mt-8">
          <ResultsHeader
            resultsCount={resultsCount}
            currentPage={currentPage}
            totalPages={totalPages}
            hasActiveSearch={hasActiveSearch}
            searchTerm={searchTerm}
            isSearching={isSearching}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentVenues.length > 0 ? (
              currentVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onVenueClick={handleVenueClick}
                />
              ))
            ) : (
              <EmptyState
                hasActiveSearch={hasActiveSearch}
                searchTerm={searchTerm}
                searchError={searchError}
                onClearSearch={clearSearch}
              />
            )}
          </div>

          {currentVenues.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
