import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getProfile,
  updateProfile,
  deleteBooking,
  updateBooking,
  deleteVenue,
  updateVenue,
} from "../services/api";
import { format } from "date-fns";
import { BackButton } from "../components/BackButton";
import { useNavigate } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    bio: "",
    avatar: { url: "" },
    banner: { url: "" },
    venueManager: false,
  });

  const [bookingForm, setBookingForm] = useState({
    dateFrom: "",
    dateTo: "",
    guests: 0,
  });

  const [venueForm, setVenueForm] = useState({
    name: "",
    description: "",
    media: [] as Array<{ url: string; alt?: string }>, // Add this line
    price: 0,
    maxGuests: 0,
    meta: {
      wifi: false,
      parking: false,
      breakfast: false,
      pets: false,
    },
    location: {
      address: "",
      city: "",
      zip: "",
      country: "",
      continent: "",
      lat: 0,
      lng: 0,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.name) return;

        setLoading(true);
        const data = await getProfile(user.name);
        console.log(data);
        setProfile(data.data);
        setProfileForm({
          bio: data.data.bio ?? "",
          avatar: data.data.avatar ?? { url: "" },
          banner: data.data.banner ?? { url: "" },
          venueManager: data.data.venueManager ?? false,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.name]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user?.name) return;

      const updatedProfile = await updateProfile(user.name, profileForm);

      // Preserve the existing bookings and venues when updating the profile
      setProfile((prevProfile: any) => ({
        ...updatedProfile.data,
        bookings: prevProfile?.bookings ?? [],
        venues: prevProfile?.venues ?? [],
        _count: prevProfile?._count ?? { bookings: 0, venues: 0 },
      }));

      // Update the AuthContext if any profile data changed
      setUser((prevUser) => {
        if (!prevUser) return null;

        const updatedUser = {
          ...prevUser,
          bio: profileForm.bio,
          avatar: profileForm.avatar,
          banner: profileForm.banner,
          venueManager: profileForm.venueManager,
        };

        // Update stored user data
        const storage = localStorage.getItem("userData")
          ? localStorage
          : sessionStorage;
        const storedUserData = storage.getItem("userData");

        if (storedUserData) {
          storage.setItem("userData", JSON.stringify(updatedUser));
        }

        return updatedUser;
      });

      setShowProfileModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleBookingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentEditItem?.id) return;

      // 1. Validate the form data first
      if (!bookingForm.dateFrom || !bookingForm.dateTo || !bookingForm.guests) {
        throw new Error("Please fill in all required fields");
      }

      const dateFrom = new Date(bookingForm.dateFrom);
      const dateTo = new Date(bookingForm.dateTo);

      // 2. Check date validity
      if (dateFrom >= dateTo) {
        throw new Error("Check-out date must be after check-in date");
      }

      if (dateFrom < new Date()) {
        throw new Error("Booking dates must be in the future");
      }

      // 3. Check guests against venue capacity
      if (
        currentEditItem.venue &&
        bookingForm.guests > currentEditItem.venue.maxGuests
      ) {
        throw new Error(
          `Maximum ${currentEditItem.venue.maxGuests} guests allowed for this venue`
        );
      }

      // 4. Format dates for API (ISO string without time if your API expects just dates)
      const formattedData = {
        dateFrom: dateFrom.toISOString().split("T")[0], // Just the date part
        dateTo: dateTo.toISOString().split("T")[0], // Just the date part
        guests: Number(bookingForm.guests), // Ensure it's a number
      };

      console.log("Submitting booking update:", formattedData); // Debug log

      // 5. Call API
      const updatedBooking = await updateBooking(
        currentEditItem.id,
        formattedData
      );

      // 6. Update state while preserving venue data
      setProfile((prev: any) => ({
        ...prev,
        bookings: prev.bookings.map((booking: any) =>
          booking.id === currentEditItem.id
            ? {
                ...updatedBooking.data,
                venue: booking.venue, // Preserve original venue data
                dateFrom: formattedData.dateFrom, // Ensure formatted dates are used
                dateTo: formattedData.dateTo,
                guests: formattedData.guests,
              }
            : booking
        ),
      }));

      // 7. Close modal and optionally show success message
      setShowBookingModal(false);
      setError(null); // Clear any previous errors
      // You could add a success state here if you want to show a confirmation
    } catch (err) {
      console.error("Booking update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update booking. Please try again."
      );
    }
  };

  // In your handleBookingDelete and handleVenueDelete functions, update to also decrement counts:

  const handleBookingDelete = async (id: string) => {
    try {
      await deleteBooking(id);

      // Update the bookings list and counts
      setProfile((prev: any) => ({
        ...prev,
        bookings: prev.bookings.filter((booking: any) => booking.id !== id),
        _count: {
          ...prev._count,
          bookings: prev._count.bookings - 1,
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete booking");
    }
  };

  const handleVenueUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentEditItem?.id) {
        window.alert("Error: Please select a venue to update");
        return;
      }

      // Basic validation
      if (!venueForm.name || !venueForm.description) {
        window.alert("Error: Name and description are required fields");
        return;
      }

      // Filter out empty media URLs
      const cleanMedia = venueForm.media.filter((m) => m.url.trim() !== "");

      const updatedVenue = await updateVenue(currentEditItem.id, {
        ...venueForm,
        media: cleanMedia,
      });

      // Update UI state
      setProfile((prev: any) => ({
        ...prev,
        venues: prev.venues.map((venue: any) =>
          venue.id === currentEditItem.id ? updatedVenue.data : venue
        ),
      }));

      setShowVenueModal(false);
      window.alert("Success: Venue updated successfully!");
    } catch (err) {
      window.alert(
        `Error: ${
          err instanceof Error ? err.message : "Failed to update venue"
        }`
      );
    }
  };

  const handleVenueDelete = async (id: string) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this venue?\nThis action cannot be undone."
      );
      if (!confirmDelete) return;

      await deleteVenue(id);

      // Update UI state
      setProfile((prev: any) => ({
        ...prev,
        venues: prev.venues.filter((venue: any) => venue.id !== id),
        _count: {
          ...prev._count,
          venues: prev._count.venues - 1,
        },
      }));

      window.alert("Success: Venue deleted successfully!");
    } catch (err) {
      window.alert(
        `Error: ${
          err instanceof Error ? err.message : "Failed to delete venue"
        }`
      );
    }
  };

  const openBookingModal = (booking: any) => {
    setCurrentEditItem(booking);
    setBookingForm({
      dateFrom: booking.dateFrom,
      dateTo: booking.dateTo,
      guests: booking.guests,
    });
    setShowBookingModal(true);
  };

  const openVenueModal = (venue: any) => {
    setCurrentEditItem(venue);
    setVenueForm({
      name: venue.name,
      description: venue.description,
      media: venue.media ?? [], // Preserve existing media
      price: venue.price,
      maxGuests: venue.maxGuests,
      meta: {
        wifi: venue.meta?.wifi ?? false,
        parking: venue.meta?.parking ?? false,
        breakfast: venue.meta?.breakfast ?? false,
        pets: venue.meta?.pets ?? false,
      },
      location: {
        address: venue.location?.address ?? "",
        city: venue.location?.city ?? "",
        zip: venue.location?.zip ?? "",
        country: venue.location?.country ?? "",
        continent: venue.location?.continent ?? "",
        lat: venue.location?.lat ?? 0,
        lng: venue.location?.lng ?? 0,
      },
    });
    setShowVenueModal(true);
  };

  const handleBackClick = () => {
    navigate("/");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  if (!profile)
    return <div className="text-center mt-8">No profile data found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <BackButton onClick={handleBackClick} />

      {/* Profile Banner */}
      <div className="relative rounded-lg overflow-hidden mb-8 h-64">
        {profile.banner?.url ? (
          <img
            src={profile.banner.url}
            alt={profile.banner.alt ?? "Profile banner"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex items-end">
            <div className="relative -mt-16 mr-6">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                {profile.avatar?.url ? (
                  <img
                    src={profile.avatar.url}
                    alt={profile.avatar.alt ?? "Profile avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
              <p className="text-white opacity-90">{profile.email}</p>
              {profile.venueManager && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                  Venue Manager
                </span>
              )}
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              className="ml-auto bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">About Me</h2>
        <p className="text-gray-700">{profile.bio ?? "No bio provided"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-500">Bookings</h3>
          <p className="text-3xl font-bold text-blue-600">
            {profile._count?.bookings ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-500">Venues</h3>
          <p className="text-3xl font-bold text-blue-600">
            {profile._count?.venues ?? 0}
          </p>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Bookings</h2>
        </div>

        {profile.bookings?.length > 0 ? (
          profile.bookings.map((booking: any) => (
            <div
              key={booking.id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="font-medium text-lg">
                    {booking.venue?.name ?? "Unknown Venue"}
                  </h3>
                  <p className="text-gray-600">
                    {booking.venue?.description?.substring(0, 100) ??
                      "No description available"}
                    ...
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                      {booking.guests}{" "}
                      {booking.guests === 1 ? "guest" : "guests"}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {format(new Date(booking.dateFrom), "MMM d, yyyy")} -{" "}
                      {format(new Date(booking.dateTo), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openBookingModal(booking)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleBookingDelete(booking.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            You don't have any bookings yet.
          </div>
        )}
      </div>

      {/* Venues Section (only for venue managers) */}
      {profile.venueManager && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Venues</h2>
          </div>

          {profile.venues?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.venues.map((venue: any) => (
                <div
                  key={venue.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  {venue.media?.[0]?.url ? (
                    <img
                      src={venue.media[0].url}
                      alt={venue.media[0].alt ?? venue.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1">{venue.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {venue.description.substring(0, 60)}...
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="font-bold text-blue-600">
                          ${venue.price}
                        </span>
                        <span className="text-gray-500 text-sm"> / night</span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => openVenueModal(venue)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleVenueDelete(venue.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              You haven't created any venues yet.
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Edit Profile
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update your personal information
                  </p>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                >
                  <span className="text-gray-500 group-hover:text-gray-700 text-lg font-light">
                    &times;
                  </span>
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Bio
                  </label>
                  <textarea
                    value={profileForm.bio}
                    name="bio"
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100 resize-none"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="avatar"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Avatar URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="avatar"
                      value={profileForm.avatar.url}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          avatar: {
                            ...profileForm.avatar,
                            url: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100 pl-12"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">👤</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="block text-sm font-medium text-gray-700">
                    Banner URL
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.banner.url}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          banner: {
                            ...profileForm.banner,
                            url: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100 pl-12"
                      placeholder="https://example.com/banner.jpg"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs">🖼️</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="venueManager"
                        checked={profileForm.venueManager}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            venueManager: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-emerald-600 bg-white border-2 border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2 transition-all duration-200"
                      />
                    </div>
                    <label
                      htmlFor="venueManager"
                      className="text-gray-700 font-medium cursor-pointer select-none"
                    >
                      Venue Manager
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-8">
                    Enable this to manage venue listings and bookings
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showBookingModal && currentEditItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Edit Booking
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update your reservation details
                  </p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                >
                  <span className="text-gray-500 group-hover:text-gray-700 text-lg font-light">
                    &times;
                  </span>
                </button>
              </div>

              <form onSubmit={handleBookingUpdate} className="space-y-6">
                <fieldset className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <legend className="text-sm font-medium text-gray-700 mb-2 px-2">
                    Venue
                  </legend>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <p className="font-semibold text-gray-900">
                      {currentEditItem.venue?.name ?? "Unknown Venue"}
                    </p>
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <label
                    htmlFor="checkin"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Check-in Date
                  </label>
                  <input
                    id="checkin"
                    type="date"
                    value={bookingForm.dateFrom}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        dateFrom: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="checkout"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Check-out Date
                  </label>
                  <input
                    id="checkout"
                    type="date"
                    value={bookingForm.dateTo}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        dateTo: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="guests"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Number of Guests
                  </label>
                  <input
                    id="guests"
                    type="number"
                    min="1"
                    max={currentEditItem.venue.maxGuests}
                    value={bookingForm.guests}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        guests: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                    required
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">
                      Maximum guests: {currentEditItem.venue.maxGuests}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Update Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Venue Modal */}
      {showVenueModal && currentEditItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Edit Venue
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Update your venue details
                  </p>
                </div>
                <button
                  onClick={() => setShowVenueModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleVenueUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="venue-name"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Venue Name
                    </label>
                    <input
                      id="venue-name"
                      type="text"
                      value={venueForm.name}
                      onChange={(e) =>
                        setVenueForm({ ...venueForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter venue name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="venue-price"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Price per Night
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        $
                      </span>
                      <input
                        id="venue-price"
                        type="number"
                        min="0"
                        value={venueForm.price}
                        onChange={(e) =>
                          setVenueForm({
                            ...venueForm,
                            price: parseFloat(e.target.value),
                          })
                        }
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="venue-description"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="venue-description"
                    value={venueForm.description}
                    onChange={(e) =>
                      setVenueForm({
                        ...venueForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                    rows={4}
                    placeholder="Describe your venue..."
                    required
                  />
                </div>

                <div className="space-y-4">
                  <p className="block text-sm font-semibold text-gray-700">
                    Venue Images
                  </p>
                  <div className="space-y-3">
                    {venueForm.media.map((media) => (
                      <div key={media.url} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={media.url}
                          onChange={(e) => {
                            const newMedia = venueForm.media.map((m) =>
                              m.url === media.url
                                ? { ...m, url: e.target.value }
                                : m
                            );
                            setVenueForm({ ...venueForm, media: newMedia });
                          }}
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                          placeholder="https://example.com/image.jpg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newMedia = venueForm.media.filter(
                              (m) => m.url !== media.url
                            );
                            setVenueForm({ ...venueForm, media: newMedia });
                          }}
                          className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setVenueForm({
                          ...venueForm,
                          media: [...venueForm.media, { url: "", alt: "" }],
                        });
                      }}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Image
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="venue-guests"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Maximum Guests
                    </label>
                    <input
                      id="venue-guests"
                      type="number"
                      min="1"
                      value={venueForm.maxGuests}
                      onChange={(e) =>
                        setVenueForm({
                          ...venueForm,
                          maxGuests: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="block text-sm font-semibold text-gray-700">
                    Amenities
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="wifi"
                        checked={venueForm.meta.wifi}
                        onChange={(e) =>
                          setVenueForm({
                            ...venueForm,
                            meta: { ...venueForm.meta, wifi: e.target.checked },
                          })
                        }
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="wifi"
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 peer-checked:bg-blue-50 peer-checked:border-blue-300 transition-all duration-200"
                      >
                        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center">
                          {venueForm.meta.wifi && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          WiFi
                        </span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="parking"
                        checked={venueForm.meta.parking}
                        onChange={(e) =>
                          setVenueForm({
                            ...venueForm,
                            meta: {
                              ...venueForm.meta,
                              parking: e.target.checked,
                            },
                          })
                        }
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="parking"
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 peer-checked:bg-blue-50 peer-checked:border-blue-300 transition-all duration-200"
                      >
                        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center">
                          {venueForm.meta.parking && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Parking
                        </span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="breakfast"
                        checked={venueForm.meta.breakfast}
                        onChange={(e) =>
                          setVenueForm({
                            ...venueForm,
                            meta: {
                              ...venueForm.meta,
                              breakfast: e.target.checked,
                            },
                          })
                        }
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="breakfast"
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 peer-checked:bg-blue-50 peer-checked:border-blue-300 transition-all duration-200"
                      >
                        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center">
                          {venueForm.meta.breakfast && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Breakfast
                        </span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="pets"
                        checked={venueForm.meta.pets}
                        onChange={(e) =>
                          setVenueForm({
                            ...venueForm,
                            meta: { ...venueForm.meta, pets: e.target.checked },
                          })
                        }
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="pets"
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 peer-checked:bg-blue-50 peer-checked:border-blue-300 transition-all duration-200"
                      >
                        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center">
                          {venueForm.meta.pets && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Pets
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="venue-city"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        City
                      </label>
                      <input
                        id="venue-city"
                        type="text"
                        value={venueForm.location.city}
                        onChange={(e) =>
                          setVenueForm({
                            ...venueForm,
                            location: {
                              ...venueForm.location,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="venue-country"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Country
                      </label>
                      <input
                        id="venue-country"
                        type="text"
                        value={venueForm.location.country}
                        onChange={(e) =>
                          setVenueForm({
                            ...venueForm,
                            location: {
                              ...venueForm.location,
                              country: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowVenueModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Update Venue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
