import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/endpoints";
import {
  normalizePaginatedPayload,
  withPaginationDefaults,
  type PaginatedResult,
  type PaginationParams,
} from "@/lib/api/pagination";
import { pickEntity, unwrapApiData, type ApiResponse } from "@/lib/api/response";
import type { Notification, NotificationStats } from "@/types";
import { toast } from "sonner";

type NotificationsListParams = PaginationParams & {
  status?: "pending" | "completed";
  type?: string;
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

type ApiNotification = {
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  readAt?: string | null;
  actionUrl?: string;
  actionLabel?: string;
  createdAt?: string;
  recipientEmail?: string;
  recipient?: string;
};

const mapNotificationType = (type?: string) => {
  const normalized = (type ?? "").toUpperCase();
  if (normalized === "ORDER_CREATED") return "order_created";
  if (normalized === "PAYMENT_CONFIRMED") return "payment_confirmed";
  return normalized ? normalized.toLowerCase() : "notification";
};

const mapApiNotificationToNotification = (
  notification: ApiNotification,
): Notification => {
  return {
    id: notification.id ?? `${notification.createdAt ?? "notification"}-${notification.type ?? "item"}`,
    type: mapNotificationType(notification.type),
    status: notification.isRead ? "read" : "unread",
    title: notification.title ?? "Notification",
    message: notification.message ?? "",
    recipient:
      notification.recipientEmail ??
      notification.recipient ??
      notification.actionLabel ??
      "",
    createdAt: notification.createdAt ?? new Date(0).toISOString(),
    isRead: notification.isRead ?? false,
    readAt: notification.readAt ?? null,
    actionUrl: notification.actionUrl,
    actionLabel: notification.actionLabel,
  };
};

const fetchNotifications = async (
  params?: NotificationsListParams,
): Promise<PaginatedResult<Notification>> => {
  const { status, type, ...rest } = params ?? {};
  const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
    API_ROUTES.notification.getAllNotifications,
    {
      params: {
        ...withPaginationDefaults(rest, { page: 1, limit: 5 }),
        ...(type ? { type: type.toUpperCase() } : {}),
        ...(status ? { status } : {}),
      },
    },
  );

  const payload = unwrapApiData(response.data) as
    | Record<string, unknown>
    | ApiNotification[];
  const meta = getResponseMeta(response.data);
  const normalized = normalizePaginatedPayload<ApiNotification>(
    attachMetaIfArray(payload, meta),
    "notifications",
  );
  return {
    ...normalized,
    items: normalized.items.map(mapApiNotificationToNotification),
  };
};

const fetchNotificationStats = async (): Promise<NotificationStats> => {
  const response = await apiClient.get<ApiResponse<unknown>>(
    API_ROUTES.notification.notificationStat,
  );
  const payload = unwrapApiData(response.data);
  return pickEntity<NotificationStats>(payload);
};

export function useNotifications(params?: NotificationsListParams) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => fetchNotifications(params),
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: ["notifications", "stats"],
    queryFn: fetchNotificationStats,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch(API_ROUTES.notification.markSingleAsRead(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      toast.success("Notification marked as read");
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.patch(API_ROUTES.notification.markAllNotAsRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark notifications as read");
    },
  });
}
