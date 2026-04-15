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
import {
  pickEntity,
  unwrapApiData,
  type ApiResponse,
} from "@/lib/api/response";
import { mapApiOrderToOrder } from "@/lib/api/mappers";
import type { ApiOrder } from "@/types/api";
import { Order } from "@/types";

type OrdersListParams = PaginationParams & {
  status?: string[];
  userId?: string;
  search?: string;
  priority?: string;
  shippingMethod?: string;
  destinationCountry?: string;
  startDate?: string;
  endDate?: string;
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

const fetchOrders = async (
  params?: OrdersListParams,
): Promise<PaginatedResult<Order>> => {
  const requestParams = withPaginationDefaults({
    ...params,
    status:
      params?.status && params.status.length > 0
        ? params.status.join(",")
        : undefined,
  });

  const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
    API_ROUTES.orders.getAllOrders,
    {
      params: requestParams,
    },
  );

  const payload = unwrapApiData(response.data) as
    | Record<string, unknown>
    | ApiOrder[];
  const meta = getResponseMeta(response.data);
  const normalized = normalizePaginatedPayload<ApiOrder>(
    attachMetaIfArray(payload, meta),
    "orders",
  );
  return {
    ...normalized,
    items: normalized.items.map(mapApiOrderToOrder),
  };
};

const fetchOrder = async (id: string): Promise<Order> => {
  const response = await apiClient.get<ApiResponse<unknown>>(
    API_ROUTES.orders.getOrderById(id),
  );
  const payload = unwrapApiData(response.data);
  const apiOrder = pickEntity<ApiOrder>(payload, "order");
  return mapApiOrderToOrder(apiOrder);
};

const fetchPendingOrders = async (
  params?: OrdersListParams,
): Promise<PaginatedResult<Order>> => {
  const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
    API_ROUTES.stats.pendingOrder,
    {
      params: withPaginationDefaults(params),
    },
  );

  const payload = unwrapApiData(response.data) as
    | Record<string, unknown>
    | ApiOrder[];
  const meta = getResponseMeta(response.data);
  const normalized = normalizePaginatedPayload<ApiOrder>(
    attachMetaIfArray(payload, meta),
    "orders",
  );
  return {
    ...normalized,
    items: normalized.items.map(mapApiOrderToOrder),
  };
};

export function useOrders(params?: OrdersListParams) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => fetchOrders(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

export function usePendingOrders(params?: OrdersListParams) {
  return useQuery({
    queryKey: ["orders", "pending", params],
    queryFn: () => fetchPendingOrders(params),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order["status"] }) =>
      apiClient.patch(API_ROUTES.orders.updateOrderStatus(id), { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Order status updated");
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });
}

export function useAddOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      apiClient.post(API_ROUTES.orders.addOrderNote(id), { note }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
      toast.success("Note added successfully");
    },
    onError: () => {
      toast.error("Failed to add note");
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient.post(API_ROUTES.orders.cancelOrder(orderId)),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Order cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel order");
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      apiClient.delete(API_ROUTES.orders.deleteOrder(orderId)),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Order deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete order");
    },
  });
}
