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
  const activities = pickEntity<unknown>(payload, "activities");

  if (!Array.isArray(activities)) {
    return [];
  }

  return activities.map((activity, index) => {
    const item =
      activity && typeof activity === "object"
        ? (activity as Record<string, unknown>)
        : {};

    const userRecord =
      item.user && typeof item.user === "object"
        ? (item.user as Record<string, unknown>)
        : undefined;

    const profileRecord =
      userRecord?.profile && typeof userRecord.profile === "object"
        ? (userRecord.profile as Record<string, unknown>)
        : undefined;

    const fullName =
      (typeof userRecord?.fullName === "string" && userRecord.fullName) ||
      [profileRecord?.firstName, profileRecord?.lastName]
        .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
        .join(" ")
        .trim() ||
      (typeof userRecord?.email === "string" ? userRecord.email : undefined);

    const entityType =
      item.entityType === "order" ||
      item.entityType === "payment" ||
      item.entityType === "user" ||
      item.entityType === "car" ||
      item.entityType === "shipment"
        ? item.entityType
        : "user";

    return {
      id:
        (typeof item.id === "string" && item.id) ||
        `activity-${index}`,
      type: entityType,
      description:
        (typeof item.description === "string" && item.description) ||
        (typeof item.message === "string" && item.message) ||
        "Activity recorded",
      timestamp:
        (typeof item.createdAt === "string" && item.createdAt) ||
        (typeof item.timestamp === "string" && item.timestamp) ||
        (typeof item.updatedAt === "string" && item.updatedAt) ||
        new Date(0).toISOString(),
      userId: typeof item.userId === "string" ? item.userId : undefined,
      userName:
        (typeof item.userName === "string" && item.userName) ||
        fullName,
    } satisfies Activity;
  });
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
