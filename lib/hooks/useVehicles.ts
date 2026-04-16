import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  vehicleQueries,
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
  type Vehicle,
  type VehicleFilters,
} from "@/lib/api/queries";
import { toast } from "sonner";
import { AxiosError } from "axios";

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

  return useMutation<
    unknown,
    AxiosError<{ message?: string }>,
    CreateVehiclePayload | FormData
  >({
    mutationFn: (payload) => vehicleQueries.createVehicle(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      toast.success("Vehicle created successfully!");
    },

    onError: (error) => {
      console.error("Create vehicle error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create vehicle";

      toast.error(errorMessage);
    },
  });
};

type UpdateVehicleVariables = {
  id: string;
  payload: UpdateVehiclePayload;
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<{ message?: string }>,
    UpdateVehicleVariables
  >({
    mutationFn: ({ id, payload }) => vehicleQueries.updateVehicle(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.detail(variables.id),
      });
      toast.success("Vehicle updated successfully!");
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update vehicle");
    },
  });
};

// Delete vehicle mutation
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<{ message?: string }>, string>({
    mutationFn: (id: string) => vehicleQueries.deleteVehicle(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.removeQueries({ queryKey: vehicleKeys.detail(id) });
      toast.success("Vehicle deleted successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete vehicle");
    },
  });
};

// Toggle featured status
export const useToggleFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Vehicle,
    AxiosError<{ message?: string }>,
    { id: string; featured: boolean }
  >({
    mutationFn: ({ id, featured }) =>
      vehicleQueries.updateVehicle(id, { featured }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.detail(variables.id),
      });
      toast.success("Vehicle featured status updated!");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update featured",
      );
    },
  });
};

// Add vehicle to section (RECOMMENDED or TRENDING)
export const useAddVehicleToSection = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<{ message?: string }>,
    { id: string; section: "RECOMMENDED" | "TRENDING" | "SPECIALTY" }
  >({
    mutationFn: ({ id, section }) =>
      vehicleQueries.addVehicleToSection(id, section),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.detail(variables.id),
      });
      toast.success(`Vehicle added to ${variables.section} section!`);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to add vehicle to section",
      );
    },
  });
};

// Remove vehicle from section
export const useRemoveVehicleFromSection = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<{ message?: string }>,
    { id: string; section: "RECOMMENDED" | "TRENDING" | "SPECIALTY" }
  >({
    mutationFn: ({ id, section }) =>
      vehicleQueries.removeVehicleFromSection(id, section),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.detail(variables.id),
      });
      toast.success(`Vehicle removed from ${variables.section} section!`);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to remove vehicle from section",
      );
    },
  });
};
