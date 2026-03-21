import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";
import { normalizePaginatedPayload, type PaginatedResult } from "./pagination";
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
  condition?: string;
  description?: string;
  country?: string;
  city?: string;
  bodyType?: string;
  driveType?: string;
  doors?: number;
  seats?: number;
  createdAt: string;
  updatedAt: string;
}

type RawVehicle = Record<string, unknown>;

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

const asRecord = (value: unknown): RawVehicle | undefined =>
  value && typeof value === "object" ? (value as RawVehicle) : undefined;

const getString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const getNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
};

const getBoolean = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const normalizeVehicleType = (value: unknown): VehicleType => {
  const normalized = getString(value).toUpperCase();
  const allowed: VehicleType[] = [
    "CAR",
    "SUV",
    "TRUCK",
    "VAN",
    "SEDAN",
    "COUPE",
    "HATCHBACK",
    "WAGON",
    "CONVERTIBLE",
    "MOTORCYCLE",
  ];

  return (allowed.find((item) => item === normalized) ?? "CAR") as VehicleType;
};

const normalizeVehicleStatus = (value: unknown): VehicleStatus => {
  const normalized = getString(value).toUpperCase();
  if (
    normalized === "SOLD" ||
    normalized === "PENDING" ||
    normalized === "RESERVED"
  ) {
    return normalized as VehicleStatus;
  }
  return "AVAILABLE";
};

const normalizeDriveType = (value: unknown): DrivetrainType => {
  const normalized = getString(value).toUpperCase();
  if (normalized === "RWD" || normalized === "AWD" || normalized === "4WD") {
    return normalized as DrivetrainType;
  }
  return "FWD";
};

const normalizeFuelType = (value: unknown): FuelType => {
  const raw = getString(value);
  if (
    raw === "Hybrid" ||
    raw === "Diesel" ||
    raw === "Electric" ||
    raw === "Regular Unleaded"
  ) {
    return raw as FuelType;
  }
  return raw ? (raw as FuelType) : "Regular Unleaded";
};

const normalizeTransmission = (value: unknown): TransmissionType => {
  const raw = getString(value);
  return raw === "Manual" ? "Manual" : "Automatic";
};

const normalizeImages = (...values: unknown[]) => {
  const images: string[] = [];

  const pushImage = (entry: unknown) => {
    if (typeof entry === "string" && entry.trim()) {
      images.push(entry.trim());
      return;
    }

    const record = asRecord(entry);
    const url = getString(
      record?.url,
      record?.secure_url,
      record?.location,
      record?.path,
      record?.imageUrl,
    );
    if (url) images.push(url);
  };

  for (const value of values) {
    if (Array.isArray(value)) {
      value.forEach(pushImage);
      continue;
    }
    pushImage(value);
  }

  return images;
};

const normalizeFeatures = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => getString(item)).filter(Boolean);
};

const normalizeVehicleEntity = (rawValue: unknown): Vehicle => {
  const record = asRecord(rawValue) ?? {};
  const nestedVehicle = asRecord(record.vehicle);
  const apiListing = asRecord(record.apiData)?.listing as
    | ApiListing
    | undefined;
  const apiVehicle = apiListing?.vehicle;
  const retailListing = apiListing?.retailListing ?? null;

  const id = getString(record.id, nestedVehicle?.id, record._id, record.vin);
  const make = getString(
    record.make,
    nestedVehicle?.make,
    apiVehicle?.make,
    "Unknown",
  );
  const model = getString(
    record.model,
    record.modelName,
    nestedVehicle?.model,
    apiVehicle?.model,
    "Unknown",
  );
  const year = getNumber(record.year, nestedVehicle?.year, apiVehicle?.year);
  const priceUsd = getNumber(
    record.priceUsd,
    record.price,
    retailListing?.price,
    nestedVehicle?.priceUsd,
  );
  const vehicleType = normalizeVehicleType(
    record.vehicleType ??
      record.bodyType ??
      nestedVehicle?.vehicleType ??
      apiVehicle?.type,
  );
  const status = normalizeVehicleStatus(
    record.status ?? nestedVehicle?.status ?? record.availabilityStatus,
  );
  const transmission = normalizeTransmission(
    record.transmission ??
      nestedVehicle?.transmission ??
      apiVehicle?.transmission,
  );
  const fuelType = normalizeFuelType(
    record.fuelType ?? nestedVehicle?.fuelType ?? apiVehicle?.fuel,
  );
  const drivetrain = normalizeDriveType(
    record.drivetrain ??
      record.driveType ??
      nestedVehicle?.drivetrain ??
      apiVehicle?.drivetrain,
  );

  return {
    id,
    vin: getString(record.vin, nestedVehicle?.vin, apiListing?.vin),
    slug: getString(record.slug, nestedVehicle?.slug, id),
    make,
    model,
    year,
    priceUsd,
    vehicleType,
    exteriorColor:
      getString(
        record.exteriorColor,
        record.color,
        nestedVehicle?.exteriorColor,
        apiVehicle?.exteriorColor,
      ) || undefined,
    interiorColor:
      getString(record.interiorColor, nestedVehicle?.interiorColor) ||
      undefined,
    transmission,
    fuelType,
    engineSize: getString(
      record.engineSize,
      nestedVehicle?.engineSize,
      apiVehicle?.engine,
    ),
    drivetrain,
    dealerName: getString(
      record.dealerName,
      nestedVehicle?.dealerName,
      retailListing?.dealer,
      "Seller Listing",
    ),
    dealerState: getString(
      record.dealerState,
      record.state,
      record.country,
      nestedVehicle?.dealerState,
      retailListing?.state,
    ),
    dealerCity: getString(
      record.dealerCity,
      record.city,
      nestedVehicle?.dealerCity,
      retailListing?.city,
    ),
    dealerZipCode: getString(
      record.dealerZipCode,
      record.zipCode,
      nestedVehicle?.dealerZipCode,
      retailListing?.zip,
    ),
    images: normalizeImages(
      record.images,
      record.photos,
      record.files,
      record.fileUrls,
      nestedVehicle?.images,
    ),
    features: normalizeFeatures(record.features ?? nestedVehicle?.features),
    source:
      getString(record.source, nestedVehicle?.source).toUpperCase() === "API"
        ? "API"
        : "MANUAL",
    apiProvider: getString(record.apiProvider, nestedVehicle?.apiProvider),
    apiListingId: getString(
      record.apiListingId,
      nestedVehicle?.apiListingId,
      apiListing?.vin,
    ),
    status,
    featured: getBoolean(record.featured ?? nestedVehicle?.featured),
    availability:
      getString(record.availability, nestedVehicle?.availability) || undefined,
    isActive: getBoolean(record.isActive ?? nestedVehicle?.isActive, true),
    isHidden: getBoolean(record.isHidden ?? nestedVehicle?.isHidden, false),
    apiData:
      (asRecord(record.apiData) as ApiData | undefined) ??
      ({
        listing: apiListing,
        raw: apiListing,
        isTemporary: false,
        cached: false,
      } as ApiData),
    apiSyncStatus: getString(
      record.apiSyncStatus,
      nestedVehicle?.apiSyncStatus,
      "PENDING",
    ) as ApiSyncStatus,
    mileage:
      getNumber(record.mileage, nestedVehicle?.mileage, retailListing?.miles) ||
      undefined,
    horsepower:
      getNumber(record.horsepower, nestedVehicle?.horsepower) || undefined,
    torque: getNumber(record.torque, nestedVehicle?.torque) || undefined,
    condition: getString(record.condition) || undefined,
    description: getString(record.description) || undefined,
    country: getString(record.country) || undefined,
    city: getString(record.city, record.dealerCity) || undefined,
    bodyType: getString(record.bodyType) || undefined,
    driveType: getString(record.driveType, record.drivetrain) || undefined,
    doors: getNumber(record.doors) || undefined,
    seats: getNumber(record.seats) || undefined,
    createdAt: getString(
      record.createdAt,
      nestedVehicle?.createdAt,
      new Date(0).toISOString(),
    ),
    updatedAt: getString(
      record.updatedAt,
      nestedVehicle?.updatedAt,
      record.createdAt,
      new Date(0).toISOString(),
    ),
  };
};

const pickVehicleEntity = (payload: unknown): Vehicle => {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if ("vehicle" in record) return normalizeVehicleEntity(record.vehicle);
    if ("sellerVehicle" in record)
      return normalizeVehicleEntity(record.sellerVehicle);
  }
  return normalizeVehicleEntity(payload);
};

export interface CreateVehiclePayload {
  make: string;
  modelName: string;
  year: number | string;
  price: number | string;
  mileage: number | string;
  condition: string;
  transmission: string;
  fuelType: string;
  color: string;
  vin: string;
  description: string;
  country: string;
  city: string;
  engineSize?: string;
  doors?: number | string;
  seats?: number | string;
  driveType?: string;
  bodyType?: string;
  features?: string[];
}

export type UpdateVehiclePayload = {
  status?: string;
  featured?: boolean;
  isHidden?: boolean;
};

export interface VehicleFilters {
  page?: number;
  limit?: number;
}

export type VehiclesResponse = PaginatedResult<Vehicle>;

// API Query Functions
export const vehicleQueries = {
  // Get all seller vehicles with pagination only
  getVehicles: async (filters?: VehicleFilters): Promise<VehiclesResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

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
    return {
      ...normalized,
      items: normalized.items.map((item) => normalizeVehicleEntity(item)),
    };
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
    await apiClient.delete(
      API_ROUTES.sellerVehicles.deleteSellerVehicleById(id),
    );
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
