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
import { Payment } from "@/types";

type PaymentsListParams = PaginationParams & {
  status?: string;
  orderId?: string;
  search?: string;
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

  const payload = unwrapApiData(response.data) as Record<string, unknown>;
  return normalizePaginatedPayload<Payment>(payload, "payments");
};

const fetchPayment = async (id: string): Promise<Payment> => {
  const response = await apiClient.get<ApiResponse<unknown>>(
    API_ROUTES.payments.getPaymentById(id),
  );
  const payload = unwrapApiData(response.data);
  return pickEntity<Payment>(payload, "payment");
};

const fetchPaymentByOrder = async (orderId: string): Promise<Payment> => {
  const response = await apiClient.get<ApiResponse<unknown>>(
    API_ROUTES.payments.getPaymentByOrderId(orderId),
  );
  const payload = unwrapApiData(response.data);
  return pickEntity<Payment>(payload, "payment");
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
    }) => apiClient.post(API_ROUTES.payments.initiateRefund(paymentId), { amount }),
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
