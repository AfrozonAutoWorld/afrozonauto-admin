import { apiClient } from "./client";

export interface Vehicle {
  id: string;
  vin: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
  vehicleType: string;
  transmission: string;
  fuelType: string;
  engineSize?: string;
  drivetrain?: string;
  dealerName?: string;
  dealerState?: string;
  dealerCity?: string;
  dealerZipCode?: string;
  images: string[];
  features: string[];
  source: string;
  apiProvider?: string;
  apiListingId?: string;
  status: string;
  isActive: boolean;
  isHidden: boolean;
  featured?: boolean;
  mileage?: number;
  apiData?: any;
  apiSyncStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehiclePayload {
  vin: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  vehicleType: string;
  priceUsd: number;
  originalPriceUsd?: number;
  mileage?: number;
  transmission: string;
  fuelType: string;
  images?: string[];
  source: string;
  status: string;
  availability?: string;
  featured?: boolean;
  isActive?: boolean;
  isHidden?: boolean;
}

export interface UpdateVehiclePayload extends Partial<CreateVehiclePayload> {}

export interface VehicleFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  vehicleType?: string;
  status?: string;
  state?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  includeApi?: boolean;
  source?: string;
}

export interface VehiclesResponse {
  success: boolean;
  message: string;
  data: {
    data: Vehicle[];
    meta: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      fromApi?: number;
    };
  };
  timestamp: string;
}

// API Query Functions
export const vehicleQueries = {
  // Get all vehicles with comprehensive filters
  getVehicles: async (filters?: VehicleFilters): Promise<VehiclesResponse> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get(`/vehicles?${params.toString()}`);
    return response.data;
  },

  // Get single vehicle by ID
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get(`/vehicles/${id}`);
    return response.data.data;
  },

  // Get vehicle by slug
  getVehicleBySlug: async (slug: string): Promise<Vehicle> => {
    const response = await apiClient.get(`/vehicles/slug/${slug}`);
    return response.data.data;
  },

  // Create new vehicle
  createVehicle: async (
    payload: CreateVehiclePayload | FormData,
  ): Promise<Vehicle> => {
    const response = await apiClient.post("/vehicles", payload, {
      headers:
        payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    });
    return response.data.data;
  },

  // Update vehicle
  updateVehicle: async (
    id: string,
    payload: UpdateVehiclePayload | FormData,
  ): Promise<Vehicle> => {
    const response = await apiClient.put(`/vehicles/${id}`, payload, {
      headers:
        payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    });
    return response.data.data;
  },

  // Delete vehicle
  deleteVehicle: async (id: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${id}`);
  },

  // Toggle featured status
  toggleFeatured: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.patch(`/vehicles/${id}/featured`);
    return response.data.data;
  },

  // Toggle availability
  toggleAvailability: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.patch(`/vehicles/${id}/availability`);
    return response.data.data;
  },
};
