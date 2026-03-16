import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/endpoints";
import {
  normalizePaginatedPayload,
  withPaginationDefaults,
  type PaginatedResult,
  type PaginationParams,
} from "@/lib/api/pagination";
import { unwrapApiData, type ApiResponse } from "@/lib/api/response";
import type { Notification } from "@/types";

type NotificationsListParams = PaginationParams & {
  status?: string;
  type?: string;
  search?: string;
};

const fetchNotifications = async (
  params?: NotificationsListParams,
): Promise<PaginatedResult<Notification>> => {
  const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
    API_ROUTES.notification.getAllNotifications,
    {
      params: withPaginationDefaults(params, { page: 1, limit: 50 }),
    },
  );

  const payload = unwrapApiData(response.data) as Record<string, unknown>;
  return normalizePaginatedPayload<Notification>(payload, "notifications");
};

export function useNotifications(params?: NotificationsListParams) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => fetchNotifications(params),
  });
}
