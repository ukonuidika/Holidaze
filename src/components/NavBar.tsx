// components/Header.tsx
import React, { useState } from "react";
import { Home, User, Plus, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type HeaderProps = {
  text?: string;
  link?: string;
};

export const Header = ({
  text = "Sign In",
  link = "/sign-in",
}: HeaderProps): React.ReactElement => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <Home className="h-8 w-8 text-emerald-600" />
          <h1 className="ml-2 text-xl font-semibold text-gray-900">Holidaze</h1>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated && user ? (
            <>
              {/* Create Venue Button - Responsive design */}
              {user.venueManager && (
                <Link to="/venues/create">
                  {/* Mobile: Icon only */}
                  <button
                    className="sm:hidden bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-md transition-colors"
                    title="Create Venue"
                  >
                    <Plus className="h-5 w-5" />
                  </button>

                  {/* Desktop: Icon + Text */}
                  <button className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md items-center space-x-2 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span>Create Venue</span>
                  </button>
                </Link>
              )}

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-md p-2"
                >
                  {user.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to user icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <User
                    className={`h-8 w-8 text-gray-600 ${
                      user.avatar?.url ? "hidden" : ""
                    }`}
                  />
                  {/* Hide username on very small screens, show on sm+ */}
                  <span className="hidden sm:block font-medium">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <button
                      className="fixed inset-0 z-10 bg-transparent border-none cursor-default"
                      onClick={() => setShowDropdown(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setShowDropdown(false);
                        }
                      }}
                      aria-label="Close dropdown menu"
                    />

                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          Signed in as{" "}
                          <span className="font-medium text-gray-900">
                            {user.name}
                          </span>
                        </div>

                        <button
                          onClick={handleProfileClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link to={link}>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors">
                {text}
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
