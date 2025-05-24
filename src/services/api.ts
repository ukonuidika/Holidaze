import type {
  RegisterUserData,
  LoginUserData,
  VenueUpdateData,
} from "../types";

const BASE_URL = "https://v2.api.noroff.dev";

const API_KEY = "fe4b6b95-64ed-45b6-bc25-bffae6c44547";

export async function registerUser(data: RegisterUserData) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.errors?.[0]?.message ?? "Registration failed");
  }
}

export async function loginUser(data: LoginUserData) {
  const response = await fetch(`${BASE_URL}/auth/login?_holidaze=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.errors?.[0]?.message ?? "Registration failed");
  }

  return result;
}

export async function getAllVenues() {
  const response = await fetch(
    `${BASE_URL}/holidaze/venues?sort=created&sortOrder=desc`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.errors?.[0]?.message ?? "Registration failed");
  }

  return result;
}

export const getVenueById = async (id: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/holidaze/venues/${id}?_bookings=true&_owner=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch venue: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching venue by ID:", error);
    throw error;
  }
};

// Profile API
export const getProfile = async (name: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/holidaze/profiles/${name}?_bookings=true&_venues=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "X-Noroff-API-Key": API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch profile: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const updateProfile = async (
  name: string,
  data: {
    bio?: string;
    avatar?: { url: string };
    banner?: { url: string };
    venueManager?: boolean;
  }
) => {
  try {
    const response = await fetch(`${BASE_URL}/holidaze/profiles/${name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update profile: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Bookings API
export const updateBooking = async (
  id: string,
  data: {
    dateFrom: string;
    dateTo: string;
    guests: number;
  }
) => {
  try {
    // Ensure all required fields are present
    if (!data.dateFrom || !data.dateTo || !data.guests) {
      throw new Error("Missing required booking fields");
    }

    const response = await fetch(`${BASE_URL}/holidaze/bookings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify({
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        guests: data.guests,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Details:", errorData);
      throw new Error(
        `Failed to update booking: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
};

export const deleteBooking = async (id: string) => {
  try {
    const response = await fetch(`${BASE_URL}/holidaze/bookings/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "X-Noroff-API-Key": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete booking: ${response.status} ${response.statusText}`
      );
    }

    return;
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
};

// Venues API

export const updateVenue = async (id: string, data: VenueUpdateData) => {
  try {
    // Basic validation
    if (!id || !data) {
      throw new Error("Missing required fields for venue update");
    }

    const response = await fetch(`${BASE_URL}/holidaze/venues/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Details:", errorData);
      throw new Error(
        `Failed to update venue: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating venue:", error);
    throw error;
  }
};

export const deleteVenue = async (id: string) => {
  try {
    if (!id) {
      throw new Error("Venue ID is required for deletion");
    }

    const response = await fetch(`${BASE_URL}/holidaze/venues/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "X-Noroff-API-Key": API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Details:", errorData);
      throw new Error(
        `Failed to delete venue: ${response.status} ${response.statusText}`
      );
    }

    // For DELETE, we typically don't expect response data
    return true; // Or simply return;
  } catch (error) {
    console.error("Error deleting venue:", error);
    throw error;
  }
};

export const createBooking = async (bookingData: {
  dateFrom: string;
  dateTo: string;
  guests: number;
  venueId: string;
}) => {
  try {
    const response = await fetch(`${BASE_URL}/holidaze/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create booking: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export const createVenue = async (venueData: {
  name: string;
  description: string;
  media?: Array<{ url: string; alt?: string }>;
  price: number;
  maxGuests: number;
  rating?: number;
  meta?: {
    wifi?: boolean;
    parking?: boolean;
    breakfast?: boolean;
    pets?: boolean;
  };
  location?: {
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    continent?: string;
    lat?: number;
    lng?: number;
  };
}) => {
  try {
    const response = await fetch(`${BASE_URL}/holidaze/venues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(venueData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ??
          `Failed to create venue: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating venue:", error);
    throw error;
  }
};
