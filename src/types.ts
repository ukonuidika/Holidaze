export interface RegisterUserData {
  email: string;
  name: string;
  password: string;
  venueManager: boolean;
}

export interface LoginUserData {
  email: string;
  password: string;
}

// TypeScript interfaces for the API data structures
export interface Media {
  url: string;
  alt: string;
}

export interface Location {
  address?: string;
  city: string;
  zip?: string;
  country: string;
  continent?: string;
  lat?: number;
  lng?: number;
}

export interface Amenities {
  wifi: boolean;
  parking: boolean;
  breakfast: boolean;
  pets: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  avatar?: Media;
  banner?: Media;
}

export interface Booking {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  created: string;
  updated: string;
  customer: UserProfile;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  media: Media[];
  price: number;
  maxGuests: number;
  rating: number;
  created?: string;
  updated?: string;
  meta: Amenities;
  location: Location;
  owner?: UserProfile;
  bookings?: Booking[];
}

// Define types for venue data
interface VenueMeta {
  wifi: boolean;
  parking: boolean;
  breakfast: boolean;
  pets: boolean;
}

interface VenueLocation {
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  continent?: string;
  lat?: number;
  lng?: number;
}

export interface VenueUpdateData {
  name?: string;
  description?: string;
  media?: Array<{ url: string; alt?: string }>;
  price?: number;
  maxGuests?: number;
  rating?: number;
  meta?: VenueMeta;
  location?: VenueLocation;
}
