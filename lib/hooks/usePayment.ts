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
import { Payment } from "@/types";
import { mapApiPaymentToPayment } from "@/lib/api/mappers";
import type { ApiPayment } from "@/types/api";

type PaymentsListParams = PaginationParams & {
  status?: string;
  orderId?: string;
  search?: string;
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

const fetchPayments = async (
  params?: PaymentsListParams,
): Promise<PaginatedResult<Payment>> => {
  const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
    API_ROUTES.payments.getAllPayments,
    {
      params: withPaginationDefaults(params),
    },
  );

  const payload = unwrapApiData(response.data) as
    | Record<string, unknown>
    | ApiPayment[];
  const meta = getResponseMeta(response.data);
  const normalized = normalizePaginatedPayload<ApiPayment>(
    attachMetaIfArray(payload, meta),
    "payments",
  );
  return {
    ...normalized,
    items: normalized.items.map(mapApiPaymentToPayment),
  };
};

const fetchPayment = async (id: string): Promise<Payment> => {
  const response = await apiClient.get<ApiResponse<unknown>>(
    API_ROUTES.payments.getPaymentById(id),
  );
  const payload = unwrapApiData(response.data);
  const apiPayment = pickEntity<ApiPayment>(payload, "payment");
  return mapApiPaymentToPayment(apiPayment);
};

const fetchPaymentByOrder = async (orderId: string): Promise<Payment> => {
  const response = await apiClient.get<ApiResponse<unknown>>(
    API_ROUTES.payments.getPaymentByOrderId(orderId),
  );
  const payload = unwrapApiData(response.data);
  const apiPayment = pickEntity<ApiPayment>(payload, "payment");
  return mapApiPaymentToPayment(apiPayment);
};

export function usePayments(params?: PaymentsListParams) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => fetchPayments(params),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: () => fetchPayment(id),
    enabled: !!id,
  });
}

export function usePaymentByOrder(orderId: string) {
  return useQuery({
    queryKey: ["payments", "order", orderId],
    queryFn: () => fetchPaymentByOrder(orderId),
    enabled: !!orderId,
  });
}

export function useInitiateRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      amount,
    }: {
      paymentId: string;
      amount: number;
    }) =>
      apiClient.post(API_ROUTES.payments.initiateRefund(paymentId), { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Refund initiated successfully");
    },
    onError: () => {
      toast.error("Failed to initiate refund");
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, note }: { paymentId: string; note: string }) =>
      apiClient.patch(API_ROUTES.payments.confirmPayment(paymentId), { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Payment confirmed successfully");
    },
    onError: () => {
      toast.error("Failed to confirm payment");
    },
  });
}

export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, note }: { paymentId: string; note: string }) =>
      apiClient.patch(API_ROUTES.payments.rejectPayment(paymentId), { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Payment rejected successfully");
    },
    onError: () => {
      toast.error("Failed to reject payment");
    },
  });
}
