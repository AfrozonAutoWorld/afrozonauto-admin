import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";
import {
  normalizePaginatedPayload,
  type PaginatedResult,
} from "./pagination";
import { unwrapApiData, type ApiResponse } from "./response";

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
  featured?: boolean;
  availability?: string;
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


const getResponseMeta = (
  response: ApiResponse<Record<string, unknown>>,
): Record<string, unknown> | undefined => {
  return (response as unknown as { data?: { meta?: Record<string, unknown> } })
    ?.data?.meta;
};

const attachMetaIfArray = <T>(
  payload: Record<string, unknown> | T[],
  meta?: Record<string, unknown>,
) => {
  if (Array.isArray(payload) && meta && typeof meta === "object") {
    return { data: payload, meta };
  }
  return payload;
};

const pickVehicleEntity = (payload: unknown): Vehicle => {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if ("vehicle" in record) return record.vehicle as Vehicle;
    if ("sellerVehicle" in record) return record.sellerVehicle as Vehicle;
  }
  return payload as Vehicle;
};

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

export type VehiclesResponse = PaginatedResult<Vehicle>;

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

    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `${API_ROUTES.sellerVehicles.getAllSellerVehicles}?${params.toString()}`,
    );
    const payload = unwrapApiData(response.data) as
      | Record<string, unknown>
      | Vehicle[];
    const meta = getResponseMeta(response.data);
    const normalized = normalizePaginatedPayload<Vehicle>(
      attachMetaIfArray(payload, meta),
      "sellerVehicles",
    );
    return normalized;
  },

  // Get single vehicle by ID
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      API_ROUTES.sellerVehicles.getSellerVehicleById(id),
    );
    const payload = unwrapApiData(response.data);
    return pickVehicleEntity(payload);
  },

  // Get vehicle by slug
  getVehicleBySlug: async (slug: string): Promise<Vehicle> => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      API_ROUTES.sellerVehicles.getSellerVehicleById(slug),
    );
    const payload = unwrapApiData(response.data);
    return pickVehicleEntity(payload);
  },

  // Create new vehicle
  createVehicle: async (
    payload: CreateVehiclePayload | FormData,
  ): Promise<Vehicle> => {
    const response = await apiClient.post<ApiResponse<unknown>>(
      API_ROUTES.sellerVehicles.createSellerVehicle,
      payload,
      {
        headers:
          payload instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" },
      },
    );
    const responsePayload = unwrapApiData(response.data);
    return pickVehicleEntity(responsePayload);
  },

  // Update vehicle
  updateVehicle: async (
    id: string,
    payload: UpdateVehiclePayload | FormData,
  ): Promise<Vehicle> => {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      API_ROUTES.sellerVehicles.updateSellerVehicleById(id),
      payload,
      {
        headers:
          payload instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" },
      },
    );
    const responsePayload = unwrapApiData(response.data);
    return pickVehicleEntity(responsePayload);
  },

  // Delete vehicle
  deleteVehicle: async (id: string): Promise<void> => {
    await apiClient.delete(API_ROUTES.sellerVehicles.deleteSellerVehicleById(id));
  },

  // Toggle featured status
  toggleFeatured: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      API_ROUTES.sellerVehicles.updateSellerVehicleById(id),
    );
    const responsePayload = unwrapApiData(response.data);
    return pickVehicleEntity(responsePayload);
  },

  // Toggle availability
  toggleAvailability: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      API_ROUTES.sellerVehicles.updateSellerVehicleById(id),
    );
    const responsePayload = unwrapApiData(response.data);
    return pickVehicleEntity(responsePayload);
  },
};
