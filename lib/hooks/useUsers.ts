import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/endpoints";
import {
  normalizePaginatedPayload,
  withPaginationDefaults,
  type PaginatedResult,
  type PaginationParams,
} from "@/lib/api/pagination";
import { pickEntity, unwrapApiData, type ApiResponse } from "@/lib/api/response";
import { mapApiUserToUser } from "@/lib/api/mappers";
import type { ApiUser } from "@/types/api";
import type { User } from "@/types";

type UsersListParams = PaginationParams & {
  search?: string;
  status?: string;
  role?: string;
};

const fetchUsers = async (
  params?: UsersListParams,
): Promise<PaginatedResult<User>> => {
  const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
    API_ROUTES.users.getAllUsers,
    {
      params: withPaginationDefaults(params),
    },
  );

  const payload = unwrapApiData(response.data) as Record<string, unknown>;
  const normalized = normalizePaginatedPayload<ApiUser>(payload, "users");

  return {
    ...normalized,
    items: normalized.items.map(mapApiUserToUser),
  };
};

const fetchUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<ApiResponse<unknown>>(
    API_ROUTES.users.getUserById(id),
  );
  const payload = unwrapApiData(response.data);
  const apiUser = pickEntity<ApiUser>(payload, "user");
  return mapApiUserToUser(apiUser);
};

export function useUsers(params?: UsersListParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.patch<ApiResponse<unknown>>(
        API_ROUTES.users.deactivateUser(userId),
        {},
      );
      const payload = unwrapApiData(response.data);
      const apiUser = pickEntity<ApiUser>(payload, "user");
      return mapApiUserToUser(apiUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated");
    },
    onError: () => {
      toast.error("Failed to update user status");
    },
  });
}
