import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/endpoints";
import { pickEntity, unwrapApiData, type ApiResponse } from "@/lib/api/response";
import type { Activity, DashboardStats } from "@/types";

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<ApiResponse<unknown>>(
    API_ROUTES.stats.platformStat,
  );
  const payload = unwrapApiData(response.data);
  return pickEntity<DashboardStats>(payload);
};

const fetchRecentActivities = async (): Promise<Activity[]> => {
  const response = await apiClient.get<ApiResponse<unknown>>(
    API_ROUTES.stats.recentActivity,
  );
  const payload = unwrapApiData(response.data);
  return pickEntity<Activity[]>(payload, "activities");
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: fetchRecentActivities,
  });
}
