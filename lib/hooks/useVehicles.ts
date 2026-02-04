import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  vehicleQueries,
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
  type Vehicle,
  type VehicleFilters,
} from "@/lib/api/queries";
import { toast } from "sonner";

// Query Keys
export const vehicleKeys = {
  all: ["vehicles"] as const,
  lists: () => [...vehicleKeys.all, "list"] as const,
  list: (filters?: VehicleFilters) =>
    [...vehicleKeys.lists(), filters] as const,
  details: () => [...vehicleKeys.all, "detail"] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
  bySlug: (slug: string) => [...vehicleKeys.all, "slug", slug] as const,
};

// Get all vehicles with filters
export const useVehicles = (filters?: VehicleFilters) => {
  // Add default limit of 10 if not specified
  const filtersWithPagination = {
    limit: 10,
    page: 1,
    ...filters,
  };

  return useQuery({
    queryKey: vehicleKeys.list(filtersWithPagination),
    queryFn: () => vehicleQueries.getVehicles(filtersWithPagination),
    select: (data) => data.data, // Return the data object with vehicles and meta
  });
};

// Get single vehicle by ID
export const useVehicle = (id: string, enabled = true) => {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => vehicleQueries.getVehicleById(id),
    enabled: !!id && enabled,
  });
};

// Get vehicle by slug
export const useVehicleBySlug = (slug: string, enabled = true) => {
  return useQuery({
    queryKey: vehicleKeys.bySlug(slug),
    queryFn: () => vehicleQueries.getVehicleBySlug(slug),
    enabled: !!slug && enabled,
  });
};

// Create vehicle mutation - now accepts both JSON and FormData
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehiclePayload | FormData) => {
      // If it's FormData, send as multipart
      // If it's a regular object, send as JSON
      return vehicleQueries.createVehicle(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      toast.success("Vehicle created successfully!");
    },
    onError: (error: any) => {
      console.error("Create vehicle error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create vehicle";
      toast.error(errorMessage);
    },
  });
};

// Update vehicle mutation
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateVehiclePayload | FormData;
    }) => vehicleQueries.updateVehicle(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.detail(variables.id),
      });
      toast.success("Vehicle updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update vehicle");
    },
  });
};

// Delete vehicle mutation
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleQueries.deleteVehicle(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.removeQueries({ queryKey: vehicleKeys.detail(id) });
      toast.success("Vehicle deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete vehicle");
    },
  });
};

// Toggle featured mutation
export const useToggleFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleQueries.toggleFeatured(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.id) });
      toast.success(
        data.featured
          ? "Vehicle marked as featured!"
          : "Vehicle removed from featured!",
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update featured status",
      );
    },
  });
};

// Toggle availability mutation
export const useToggleAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleQueries.toggleAvailability(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.id) });
      toast.success(
        data.status === "AVAILABLE"
          ? "Vehicle marked as available!"
          : "Vehicle marked as sold!",
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update availability",
      );
    },
  });
};
