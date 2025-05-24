import { Search, X } from "lucide-react";

// Enhanced Search Bar Component
interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  isSearching: boolean;
  hasActiveSearch: boolean;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  isSearching,
  hasActiveSearch,
}: SearchBarProps) => {
  return (
    <div className="flex-grow">
      <label
        htmlFor="search"
        className="block text-sm font-medium text-gray-700"
      >
        Search venues
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-500"></div>
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          name="search"
          id="search"
          className="focus:ring-emerald-500 focus:border-emerald-500 block w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md"
          placeholder="Search by location, name, or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {hasActiveSearch && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={onClearSearch}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Results Header Component
interface ResultsHeaderProps {
  resultsCount: number;
  currentPage: number;
  totalPages: number;
  hasActiveSearch: boolean;
  searchTerm: string;
  isSearching: boolean;
}

export const ResultsHeader = ({
  resultsCount,
  currentPage,
  totalPages,
  hasActiveSearch,
  searchTerm,
  isSearching,
}: ResultsHeaderProps) => {
  if (isSearching) {
    return (
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Searching for "{searchTerm}"...
      </h2>
    );
  }

  if (hasActiveSearch && resultsCount === 0) {
    return (
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        No results found for "{searchTerm}"
      </h2>
    );
  }

  if (hasActiveSearch) {
    return (
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {resultsCount} result{resultsCount !== 1 ? "s" : ""} for "{searchTerm}"
        {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
      </h2>
    );
  }

  let headerText = "";

  if (resultsCount > 0) {
    headerText = `${resultsCount} Available Venues`;
    if (totalPages > 1) {
      headerText += ` (Page ${currentPage} of ${totalPages})`;
    }
  } else {
    headerText = "No venues available";
  }

  return (
    <h2 className="text-2xl font-bold text-gray-900 mb-6">{headerText}</h2>
  );
};

// Enhanced Empty State Component
interface EmptyStateProps {
  hasActiveSearch: boolean;
  searchTerm: string;
  searchError: string | null;
  onClearSearch: () => void;
}

export const EmptyState = ({
  hasActiveSearch,
  searchTerm,
  searchError,
  onClearSearch,
}: EmptyStateProps) => {
  if (searchError) {
    return (
      <div className="col-span-3 text-center py-12">
        <div className="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
        <p className="text-gray-500 mb-4">{searchError}</p>
        <button
          onClick={onClearSearch}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div className="col-span-3 text-center py-12">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 mx-auto text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasActiveSearch
          ? `No results found for "${searchTerm}"`
          : "No venues found"}
      </h3>
      <p className="text-gray-500 mb-4">
        {hasActiveSearch
          ? "Try different search terms or adjust your filters."
          : "Try adjusting your price filter or search for specific venues."}
      </p>
      {hasActiveSearch && (
        <button
          onClick={onClearSearch}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md"
        >
          Clear Search
        </button>
      )}
    </div>
  );
};
