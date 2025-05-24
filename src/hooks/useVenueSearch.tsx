import { useState, useEffect, useMemo, useCallback } from "react";
import type { Venue } from "../types";

// Enhanced API service for search
const searchVenues = async (query: string): Promise<{ data: Venue[] }> => {
  const response = await fetch(
    `https://v2.api.noroff.dev/holidaze/venues/search?q=${encodeURIComponent(
      query
    )}`
  );
  if (!response.ok) {
    throw new Error("Failed to search venues");
  }
  return response.json();
};

// Debounce hook for search optimization
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Modern search hook with API integration
export const useVenueSearch = () => {
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [searchResults, setSearchResults] = useState<Venue[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterPrice, setFilterPrice] = useState<number>(500);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300);
  const venuesPerPage = 12;

  // Memoized filtered venues based on price
  const priceFilteredVenues = useMemo(() => {
    const venues = debouncedSearchTerm ? searchResults : allVenues;
    return venues.filter((venue) => venue.price <= filterPrice);
  }, [searchResults, allVenues, filterPrice, debouncedSearchTerm]);

  // Pagination calculations
  const totalPages = Math.max(
    1,
    Math.ceil(priceFilteredVenues.length / venuesPerPage)
  );
  const startIndex = (currentPage - 1) * venuesPerPage;
  const endIndex = Math.min(
    startIndex + venuesPerPage,
    priceFilteredVenues.length
  );
  const currentVenues = priceFilteredVenues.slice(startIndex, endIndex);

  // Search function with API call
  const performSearch = useCallback(async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await searchVenues(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError("Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Effect to trigger search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    } else {
      setSearchResults([]);
      setSearchError(null);
    }
  }, [debouncedSearchTerm, performSearch]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterPrice]);

  // Page navigation
  const goToPage = useCallback(
    (pageNumber: number) => {
      const validPageNumber = Math.max(1, Math.min(pageNumber, totalPages));
      if (validPageNumber !== currentPage) {
        setCurrentPage(validPageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentPage, totalPages]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    allVenues,
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
    hasActiveSearch: Boolean(debouncedSearchTerm),
    resultsCount: priceFilteredVenues.length,
    goToPage,
    clearSearch,
  };
};
