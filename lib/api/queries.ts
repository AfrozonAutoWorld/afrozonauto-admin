import { apiClient } from "./client";

type TransmissionType = "Automatic" | "Manual";
type FuelType = "Hybrid" | "Regular Unleaded" | "Diesel" | "Electric";
type DrivetrainType = "FWD" | "RWD" | "AWD" | "4WD";
type VehicleStatus = "AVAILABLE" | "SOLD" | "PENDING" | "RESERVED";
type ApiSyncStatus = "PENDING" | "SYNCED" | "FAILED";
type VehicleSource = "API" | "MANUAL";

export type VehicleType =
  | "CAR"
  | "SUV"
  | "TRUCK"
  | "VAN"
  | "SEDAN"
  | "COUPE"
  | "HATCHBACK"
  | "WAGON"
  | "CONVERTIBLE"
  | "MOTORCYCLE";

interface VehicleDetails {
  confidence?: number;
  cylinders?: number;
  doors?: number;
  drivetrain: DrivetrainType;
  engine: string;
  exteriorColor?: string;
  fuel: FuelType;
  interiorColor?: string;
  make: string;
  model: string;
  seats?: number;
  squishVin: string;
  transmission: TransmissionType;
  trim?: string;
  vin: string;
  year: number;
  baseInvoice?: number;
  baseMsrp?: number;
  bodyStyle?: string;
  series?: string;
  style?: string;
  type?: string;
}

interface RetailListing {
  carfaxUrl: string;
  city: string;
  cpo: boolean;
  dealer: string;
  miles: number;
  photoCount: number;
  price: number;
  primaryImage: string;
  state: string;
  used: boolean;
  vdp: string;
  zip: string;
}

interface WholesaleListing {
  miles?: number;
  price?: number;
  primaryImage?: string;
  [key: string]: unknown;
}
interface ApiListing {
  "@id": string;
  vin: string;
  createdAt: string;
  location: [number, number];
  online: boolean;
  vehicle: VehicleDetails;
  wholesaleListing: WholesaleListing | null;
  retailListing: RetailListing | null;
  history: unknown | null;
}

export interface VehicleLocation {
  longitude: number;
  latitude: number;
}

interface RetailListing {
  carfaxUrl: string;
  city: string;
  cpo: boolean;
  dealer: string;
  miles: number;
  photoCount: number;
  price: number;
  primaryImage: string;
  state: string;
  used: boolean;
  vdp: string;
  zip: string;
}

interface ApiData {
  listing: ApiListing;
  raw: ApiListing;
  isTemporary: boolean;
  cached: boolean;
}

export interface Vehicle {
  vin: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
  vehicleType: VehicleType;
  exteriorColor?: string;
  interiorColor?: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  engineSize: string;
  drivetrain: DrivetrainType;
  dealerName: string;
  dealerState: string;
  dealerCity: string;
  dealerZipCode: string;
  images: string[];
  features: string[];
  source: VehicleSource;
  apiProvider: string;
  apiListingId: string;
  status: VehicleStatus;
  isActive: boolean;
  isHidden: boolean;
  apiData: ApiData;
  apiSyncStatus: ApiSyncStatus;
  id: string;
  mileage?: number;
  horsepower?: number;
  torque?: number;
  createdAt: string;
  updatedAt: string;
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

export type UpdateVehiclePayload = Partial<
  Omit<CreateVehiclePayload, "vin" | "slug" | "source">
>;

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
