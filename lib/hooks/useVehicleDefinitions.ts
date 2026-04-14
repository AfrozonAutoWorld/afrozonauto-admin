import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/endpoints";
import {
  normalizePaginatedPayload,
  type PaginatedResult,
} from "@/lib/api/pagination";
import { unwrapApiData, type ApiResponse } from "@/lib/api/response";

export type VehicleDefinitionKind = "trending" | "recommended";

export type VehicleDefinition = {
  id: string;
  make: string;
  model?: string | null;
  yearStart?: number | null;
  yearEnd?: number | null;
  label?: string | null;
  reason?: string | null;
  sortOrder: number;
  isActive: boolean;
  maxFetchCount: number;
  forRecommended?: boolean;
  forSpecialty?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type VehicleDefinitionPayload = {
  make: string;
  model?: string;
  yearStart?: number;
  yearEnd?: number;
  label?: string;
  reason?: string;
  sortOrder?: number;
  isActive: boolean;
  maxFetchCount?: number;
  forRecommended?: boolean;
  forSpecialty?: boolean;
};

export type VehicleCategory = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type VehicleCategoryPayload = {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isActive: boolean;
};

const vehicleDefinitionKeys = {
  all: ["vehicle-definitions"] as const,
  list: (kind: VehicleDefinitionKind) =>
    [...vehicleDefinitionKeys.all, kind] as const,
  categories: ["vehicle-categories"] as const,
};

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

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;

const getString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const getNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
};

const getBoolean = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const getDefinitionRoutes = (kind: VehicleDefinitionKind) => {
  if (kind === "trending") {
    return {
      list: API_ROUTES.vehicleDefinitions.getTrendingVehicles,
      create: API_ROUTES.vehicleDefinitions.createTrendingVehicle,
      update: API_ROUTES.vehicleDefinitions.updateTrendingVehicle,
      remove: API_ROUTES.vehicleDefinitions.deleteTrendingVehicle,
    };
  }

  return {
    list: API_ROUTES.vehicleDefinitions.getRecommendedVehicles,
    create: API_ROUTES.vehicleDefinitions.createRecommendedVehicle,
    update: API_ROUTES.vehicleDefinitions.updateRecommendedVehicle,
    remove: API_ROUTES.vehicleDefinitions.deleteRecommendedVehicle,
  };
};

const mapVehicleDefinition = (item: unknown): VehicleDefinition => {
  const record = asRecord(item) ?? {};

  return {
    id: getString(record.id, record._id),
    make: getString(record.make, "Unknown"),
    model: getString(record.model) || null,
    yearStart: getNumber(record.yearStart) || null,
    yearEnd: getNumber(record.yearEnd) || null,
    label: getString(record.label) || null,
    reason: getString(record.reason) || null,
    sortOrder: getNumber(record.sortOrder),
    isActive: getBoolean(record.isActive, true),
    maxFetchCount: getNumber(record.maxFetchCount, 1),
    forRecommended: getBoolean(record.forRecommended, false),
    forSpecialty: getBoolean(record.forSpecialty, false),
    createdAt: getString(record.createdAt) || undefined,
    updatedAt: getString(record.updatedAt) || undefined,
  };
};

const mapVehicleCategory = (item: unknown): VehicleCategory => {
  const record = asRecord(item) ?? {};

  return {
    id: getString(record.id, record._id),
    name: getString(
      record.name,
      record.title,
      record.label,
      record.categoryName,
      "Untitled Category",
    ),
    slug: getString(record.slug, record.key, record.code) || null,
    description:
      getString(record.description, record.summary, record.details) || null,
    sortOrder: getNumber(record.sortOrder, record.order),
    isActive: getBoolean(record.isActive, true),
    createdAt: getString(record.createdAt) || undefined,
    updatedAt: getString(record.updatedAt) || undefined,
  };
};

const fetchVehicleDefinitions = async (
  kind: VehicleDefinitionKind,
): Promise<PaginatedResult<VehicleDefinition>> => {
  const routes = getDefinitionRoutes(kind);
  const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
    routes.list,
  );

  const payload = unwrapApiData(response.data) as
    | Record<string, unknown>
    | unknown[];
  const meta = getResponseMeta(response.data);
  const normalized = normalizePaginatedPayload<unknown>(
    attachMetaIfArray(payload, meta),
    "data",
  );

  return {
    ...normalized,
    items: normalized.items.map(mapVehicleDefinition),
  };
};

const fetchVehicleCategories = async (): Promise<
  PaginatedResult<VehicleCategory>
> => {
  const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
    API_ROUTES.vehicleCategories.getVehicleCategories,
  );

  const payload = unwrapApiData(response.data) as
    | Record<string, unknown>
    | unknown[];
  const meta = getResponseMeta(response.data);
  const normalized = normalizePaginatedPayload<unknown>(
    attachMetaIfArray(payload, meta),
    "data",
  );

  return {
    ...normalized,
    items: normalized.items.map(mapVehicleCategory),
  };
};

const formatDefinitionKind = (kind: VehicleDefinitionKind) =>
  kind === "trending" ? "Trending vehicle" : "Recommended vehicle";

export const useVehicleDefinitions = (kind: VehicleDefinitionKind) => {
  return useQuery({
    queryKey: vehicleDefinitionKeys.list(kind),
    queryFn: () => fetchVehicleDefinitions(kind),
  });
};

export const useTrendingVehicleDefinitions = () =>
  useVehicleDefinitions("trending");

export const useRecommendedVehicleDefinitions = () =>
  useVehicleDefinitions("recommended");

export const useCreateVehicleDefinition = (kind: VehicleDefinitionKind) => {
  const queryClient = useQueryClient();
  const routes = getDefinitionRoutes(kind);

  return useMutation<
    unknown,
    AxiosError<{ message?: string }>,
    VehicleDefinitionPayload
  >({
    mutationFn: (payload) => apiClient.post(routes.create, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleDefinitionKeys.list(kind),
      });
      toast.success(`${formatDefinitionKind(kind)} created`);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          `Failed to create ${formatDefinitionKind(kind).toLowerCase()}`,
      );
    },
  });
};

export const useUpdateVehicleDefinition = (kind: VehicleDefinitionKind) => {
  const queryClient = useQueryClient();
  const routes = getDefinitionRoutes(kind);

  return useMutation<
    unknown,
    AxiosError<{ message?: string }>,
    { id: string; payload: VehicleDefinitionPayload }
  >({
    mutationFn: ({ id, payload }) => apiClient.patch(routes.update(id), payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleDefinitionKeys.list(kind),
      });
      toast.success(`${formatDefinitionKind(kind)} updated`);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          `Failed to update ${formatDefinitionKind(kind).toLowerCase()}`,
      );
    },
  });
};

export const useDeleteVehicleDefinition = (kind: VehicleDefinitionKind) => {
  const queryClient = useQueryClient();
  const routes = getDefinitionRoutes(kind);

  return useMutation<unknown, AxiosError<{ message?: string }>, string>({
    mutationFn: (id) => apiClient.delete(routes.remove(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleDefinitionKeys.list(kind),
      });
      toast.success(`${formatDefinitionKind(kind)} deleted`);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          `Failed to delete ${formatDefinitionKind(kind).toLowerCase()}`,
      );
    },
  });
};

export const useVehicleCategories = () => {
  return useQuery({
    queryKey: vehicleDefinitionKeys.categories,
    queryFn: fetchVehicleCategories,
  });
};

export const useCreateVehicleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<{ message?: string }>,
    VehicleCategoryPayload
  >({
    mutationFn: (payload) =>
      apiClient.post(API_ROUTES.vehicleCategories.createVehicleCategory, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleDefinitionKeys.categories,
      });
      toast.success("Vehicle category created");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create vehicle category",
      );
    },
  });
};

export const useUpdateVehicleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<{ message?: string }>,
    { id: string; payload: VehicleCategoryPayload }
  >({
    mutationFn: ({ id, payload }) =>
      apiClient.patch(API_ROUTES.vehicleCategories.updateVehicleCategory(id), payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleDefinitionKeys.categories,
      });
      toast.success("Vehicle category updated");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update vehicle category",
      );
    },
  });
};

export const useDeleteVehicleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<{ message?: string }>, string>({
    mutationFn: (id) =>
      apiClient.delete(API_ROUTES.vehicleCategories.deleteVehicleCategory(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleDefinitionKeys.categories,
      });
      toast.success("Vehicle category deleted");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete vehicle category",
      );
    },
  });
};
