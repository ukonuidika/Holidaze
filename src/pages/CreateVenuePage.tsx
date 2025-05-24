// src/pages/CreateVenuePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVenue } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { BackButton } from "../components/BackButton";

interface MediaItem {
  url: string;
  alt: string;
}

interface VenueFormData {
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  media: MediaItem[];
  meta: {
    wifi: boolean;
    parking: boolean;
    breakfast: boolean;
    pets: boolean;
  };
  location: {
    address: string;
    city: string;
    zip: string;
    country: string;
    continent: string;
    lat: number;
    lng: number;
  };
}

const CreateVenuePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<VenueFormData>({
    name: "",
    description: "",
    price: 0,
    maxGuests: 1,
    media: [{ url: "", alt: "" }],
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

  // Separate handler for meta fields
  const handleMetaChange = (
    field: keyof typeof formData.meta,
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: value,
      },
    }));
  };

  // Separate handler for location fields
  const handleLocationChange = (
    field: keyof typeof formData.location,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  // Separate handler for media fields
  const handleMediaChange = (
    index: number,
    field: keyof MediaItem,
    value: string
  ) => {
    const updatedMedia = [...formData.media];
    updatedMedia[index] = {
      ...updatedMedia[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, media: updatedMedia }));
  };

  // Separate handler for basic fields
  const handleBasicFieldChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Main change handler with reduced complexity
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith("meta.")) {
      const metaField = name.split(".")[1] as keyof typeof formData.meta;
      handleMetaChange(
        metaField,
        type === "checkbox" ? checked : Boolean(value)
      );
      return;
    }

    if (name.startsWith("location.")) {
      const locationField = name.split(
        "."
      )[1] as keyof typeof formData.location;
      const locationValue = type === "number" ? parseFloat(value) : value;
      handleLocationChange(locationField, locationValue);
      return;
    }

    if (name.startsWith("media.")) {
      const [mediaIndex, mediaField] = name.split(".").slice(1);
      handleMediaChange(
        parseInt(mediaIndex),
        mediaField as keyof MediaItem,
        value
      );
      return;
    }

    // Handle basic fields
    const basicValue = type === "number" ? parseFloat(value) : value;
    handleBasicFieldChange(name, basicValue);
  };

  const addMediaField = () => {
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, { url: "", alt: "" }],
    }));
  };

  const removeMediaField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  // Updated handleSubmit function with better success handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error("You must be logged in to create a venue");
      }

      // Filter out empty media objects
      const cleanedMedia = formData.media.filter(
        (media) => media.url.trim() !== ""
      );

      // Prepare the data to send
      const venueData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        maxGuests: formData.maxGuests,
        meta: formData.meta,
        location: formData.location,
        ...(cleanedMedia.length > 0 && { media: cleanedMedia }),
      };

      const response = await createVenue(venueData);

      // Show success message and redirect
      alert(`Venue "${response.data.name}" created successfully!`);
      navigate(`/venue/${response.data.id}`); // Assuming the response includes the venue ID
    } catch (err) {
      console.error("Venue creation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create venue. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <BackButton onClick={handleBackClick} />
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Create Your Venue
          </h1>
          <p className="text-slate-600 text-lg">
            Share your space with travelers from around the world
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                Basic Information
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-slate-700 font-medium mb-3"
                >
                  Venue Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Enter a memorable name for your venue"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-slate-700 font-medium mb-3"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
                  placeholder="Describe what makes your venue special..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                Pricing & Capacity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-slate-700 font-medium mb-3"
                >
                  💰 Price per night *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                    $
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="maxGuests"
                  className="block text-slate-700 font-medium mb-3"
                >
                  👥 Maximum Guests *
                </label>
                <input
                  type="number"
                  id="maxGuests"
                  name="maxGuests"
                  min="1"
                  value={formData.maxGuests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">📷</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Media</h2>
            </div>

            <div className="space-y-6">
              {formData.media.map((media, index) => (
                <div
                  key={`media-${index}-${media.url}`}
                  className="bg-slate-50/50 rounded-xl p-6 border border-slate-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-700">
                      Image {index + 1}
                    </h3>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeMediaField(index)}
                        className="flex items-center text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        ❌ Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <input
                      type="url"
                      name={`media.${index}.url`}
                      value={media.url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                    />

                    <input
                      type="text"
                      name={`media.${index}.alt`}
                      value={media.alt}
                      onChange={handleChange}
                      placeholder="Describe this image for accessibility"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addMediaField}
                className="flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
              >
                ➕ Add another image
              </button>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Amenities</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.meta.wifi
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white/50"
                }`}
              >
                <input
                  type="checkbox"
                  name="meta.wifi"
                  checked={formData.meta.wifi}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                    formData.meta.wifi
                      ? "bg-blue-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {formData.meta.wifi ? "✓" : "📶"}
                </div>
                <span
                  className={`font-medium ${
                    formData.meta.wifi ? "text-blue-700" : "text-slate-700"
                  }`}
                >
                  WiFi
                </span>
              </label>

              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.meta.parking
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white/50"
                }`}
              >
                <input
                  type="checkbox"
                  name="meta.parking"
                  checked={formData.meta.parking}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                    formData.meta.parking
                      ? "bg-blue-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {formData.meta.parking ? "✓" : "🚗"}
                </div>
                <span
                  className={`font-medium ${
                    formData.meta.parking ? "text-blue-700" : "text-slate-700"
                  }`}
                >
                  Parking
                </span>
              </label>

              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.meta.breakfast
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white/50"
                }`}
              >
                <input
                  type="checkbox"
                  name="meta.breakfast"
                  checked={formData.meta.breakfast}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                    formData.meta.breakfast
                      ? "bg-blue-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {formData.meta.breakfast ? "✓" : "☕"}
                </div>
                <span
                  className={`font-medium ${
                    formData.meta.breakfast ? "text-blue-700" : "text-slate-700"
                  }`}
                >
                  Breakfast
                </span>
              </label>

              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.meta.pets
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white/50"
                }`}
              >
                <input
                  type="checkbox"
                  name="meta.pets"
                  checked={formData.meta.pets}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                    formData.meta.pets
                      ? "bg-blue-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {formData.meta.pets ? "✓" : "🐾"}
                </div>
                <span
                  className={`font-medium ${
                    formData.meta.pets ? "text-blue-700" : "text-slate-700"
                  }`}
                >
                  Pet Friendly
                </span>
              </label>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">📍</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="city"
                  className="block text-slate-700 font-medium mb-3"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Enter city name"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-slate-700 font-medium mb-3"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Enter country name"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Your Venue...
                </div>
              ) : (
                "Create Venue"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVenuePage;
