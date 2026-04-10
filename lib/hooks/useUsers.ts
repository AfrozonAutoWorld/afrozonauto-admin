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
import { AxiosError } from "axios";

type UsersListParams = PaginationParams & {
  search?: string;
  status?: string;
  role?: string;
};

type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
};

type SellerReviewPayload = {
  userId: string;
  profileId?: string | null;
  note?: string;
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

const fetchUsers = async (
  params?: UsersListParams,
): Promise<PaginatedResult<User>> => {
  const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
    API_ROUTES.users.getAllUsers,
    {
      params: withPaginationDefaults(params),
    },
  );

  const payload = unwrapApiData(response.data) as
    | Record<string, unknown>
    | ApiUser[];
  const meta = getResponseMeta(response.data);
  const normalized = normalizePaginatedPayload<ApiUser>(
    attachMetaIfArray(payload, meta),
    "users",
  );

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

const isFallbackRouteError = (error: unknown) => {
  const status = (error as AxiosError)?.response?.status;
  return status === 404 || status === 405;
};

const buildSellerReviewPayload = (
  status: "APPROVED" | "REJECTED",
  note: string,
) => {
  const reviewedAt = new Date().toISOString();
  const trimmedNote = note.trim();

  return {
    sellerStatus: status,
    reviewNote: trimmedNote,
    sellerReviewNote: trimmedNote,
    isVerified: status === "APPROVED",
    sellerVerifiedAt: status === "APPROVED" ? reviewedAt : null,
    sellerRejectedReason: status === "REJECTED" ? trimmedNote : null,
  };
};

const buildSellerReviewRequest = (approve: boolean, note?: string) => {
  const trimmedNote = note?.trim() ?? "";

  return {
    approve,
    ...(trimmedNote
      ? {
          note: trimmedNote,
          reason: trimmedNote,
          rejectionReason: trimmedNote,
          reviewNote: trimmedNote,
          sellerRejectedReason: trimmedNote,
        }
      : {}),
  };
};

const verifySellerAccount = async ({
  userId,
  profileId,
}: SellerReviewPayload) => {
  const sellerProfileId = profileId ?? userId;

  try {
    await apiClient.patch(
      API_ROUTES.sellers.verifySeller(sellerProfileId),
      buildSellerReviewRequest(true),
    );
    return;
  } catch (error) {
    if (!isFallbackRouteError(error)) {
      throw error;
    }
  }

  await apiClient.patch(
    API_ROUTES.users.updateUser(userId),
    buildSellerReviewPayload("APPROVED", ""),
  );
};

const rejectSellerAccount = async ({
  userId,
  profileId,
  note,
}: SellerReviewPayload) => {
  const sellerProfileId = profileId ?? userId;
  const trimmedNote = note?.trim() ?? "";
  const payload = buildSellerReviewPayload("REJECTED", trimmedNote);

  try {
    await apiClient.patch(
      API_ROUTES.sellers.rejectSeller(sellerProfileId),
      buildSellerReviewRequest(false, trimmedNote),
    );
    return;
  } catch (error) {
    if (!isFallbackRouteError(error)) {
      throw error;
    }
  }

  await apiClient.patch(API_ROUTES.users.updateUser(userId), payload);
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

export function useApproveSellerAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, profileId }: SellerReviewPayload) =>
      verifySellerAccount({ userId, profileId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
      toast.success("Seller account approved");
    },
    onError: () => {
      toast.error("Failed to approve seller account");
    },
  });
}

export function useRejectSellerAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, profileId, note }: SellerReviewPayload) =>
      rejectSellerAccount({ userId, profileId, note }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
      toast.success("Seller account rejected");
    },
    onError: () => {
      toast.error("Failed to reject seller account");
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, AxiosError<{ message?: string }>, CreateUserPayload>({
    mutationFn: async (payload) => {
      try {
        const response = await apiClient.post<ApiResponse<unknown>>(
          API_ROUTES.users.createAUser,
          payload,
        );
        const data = unwrapApiData(response.data);
        const apiUser = pickEntity<ApiUser>(data, "user");
        return mapApiUserToUser(apiUser);
      } catch (error) {
        const status = (error as AxiosError)?.response?.status;

        if (status !== 404 && status !== 405) {
          throw error as AxiosError<{ message?: string }>;
        }

        const fallbackResponse = await apiClient.post<ApiResponse<unknown>>(
          API_ROUTES.users.createUserLegacy,
          payload,
        );
        const fallbackData = unwrapApiData(fallbackResponse.data);
        const apiUser = pickEntity<ApiUser>(fallbackData, "user");
        return mapApiUserToUser(apiUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });
}
