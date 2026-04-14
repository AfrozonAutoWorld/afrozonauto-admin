import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
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
import { AxiosError } from "axios";

type PaymentsListParams = PaginationParams & {
  status?: string;
  orderId?: string;
  search?: string;
};

const refreshPaymentQueries = async (
  queryClient: QueryClient,
  paymentId?: string,
) => {
  const tasks = [
    queryClient.invalidateQueries({ queryKey: ["payments"] }),
    queryClient.invalidateQueries({ queryKey: ["payments", "stats"] }),
    queryClient.invalidateQueries({ queryKey: ["payments", "order"] }),
    queryClient.invalidateQueries({ queryKey: ["orders"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
  ];

  if (paymentId) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: ["payments", paymentId],
        exact: true,
      }),
    );
    tasks.push(
      queryClient.refetchQueries({
        queryKey: ["payments", paymentId],
        exact: true,
        type: "active",
      }),
    );
  }

  await Promise.all(tasks);
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
    onSuccess: async (_, variables) => {
      await refreshPaymentQueries(queryClient, variables.paymentId);
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
    mutationFn: ({ orderId, note }: { orderId: string; note: string }) =>
      apiClient.patch(API_ROUTES.payments.confirmPayment(orderId), {
        status: "COMPLETED",
        note,
      }),
    onSuccess: async (_, variables) => {
      await refreshPaymentQueries(queryClient, variables.orderId);
      toast.success("Payment approved successfully");
    },
    onError: () => {
      toast.error("Failed to approve payment");
    },
  });
}

export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, note }: { paymentId: string; note: string }) =>
      apiClient.patch(API_ROUTES.payments.rejectPayment(paymentId), { note }),
    onSuccess: async (_, variables) => {
      await refreshPaymentQueries(queryClient, variables.paymentId);
      toast.success("Payment rejected successfully");
    },
    onError: () => {
      toast.error("Failed to reject payment");
    },
  });
}

export function useNotifySellerPaymentCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentId,
      vehicleId,
    }: {
      paymentId: string;
      vehicleId?: string | null;
    }) => {
      await apiClient.post(API_ROUTES.payments.notifySeller(paymentId));

      if (vehicleId) {
        try {
          await apiClient.patch(
            API_ROUTES.sellerVehicles.updateSellerVehicleById(vehicleId),
            { status: "SOLD" },
          );
          return { vehicleUpdated: true };
        } catch {
          return { vehicleUpdated: false };
        }
      }

      return { vehicleUpdated: false };
    },
    onSuccess: async (result, variables) => {
      await refreshPaymentQueries(queryClient, variables.paymentId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] }),
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
      ]);

      if (variables.vehicleId && !result.vehicleUpdated) {
        toast.success(
          "Seller notified successfully. Vehicle status needs manual review.",
        );
        return;
      }

      toast.success(
        variables.vehicleId
          ? "Seller notified and vehicle marked as sold"
          : "Seller notified successfully",
      );
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to notify seller");
    },
  });
}
