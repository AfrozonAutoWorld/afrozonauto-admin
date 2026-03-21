import type { Order, Payment, User } from "@/types";
import type { ApiOrder, ApiPayment, ApiUser } from "@/types/api";

const formatName = (user: ApiUser) => {
  const profileName = [user.profile?.firstName, user.profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (user.fullName && user.fullName.trim()) return user.fullName.trim();
  if (profileName) return profileName;
  return user.email;
};

export const mapApiUserToUser = (user: ApiUser): User => {
  const roleValue = (user.role ?? "OPERATIONS_ADMIN").toUpperCase();
  const role =
    roleValue === "SUPER_ADMIN" ||
    roleValue === "OPERATIONS_ADMIN" ||
    roleValue === "SELLER" ||
    roleValue === "BUYER"
      ? (roleValue as User["role"])
      : "OPERATIONS_ADMIN";

  return {
    id: user.id,
    name: formatName(user),
    email: user.email,
    emailVerified: user.emailVerified ?? false,
    phone: user.phone ?? "",
    role,
    status: user.isActive === false ? "inactive" : "active",
    isSuspended: user.isSuspended ?? false,
    walletBalance: user.walletBalance ?? 0,
    currency: user.currency ?? "USD",
    language: user.language ?? "en",
    timezone: user.timezone ?? "",
    lastLoginAt: user.lastLoginAt ?? null,
    notificationPreferences: user.notificationPreferences ?? null,
    sellerStatus: user.profile?.sellerStatus ?? null,
    isVerified: user.profile?.isVerified ?? false,
    firstName: user.profile?.firstName ?? null,
    lastName: user.profile?.lastName ?? null,
    createdAt: user.createdAt ?? new Date(0).toISOString(),
    country: user.timezone ?? "",
    totalOrders: 0,
  };
};

const formatOrderUserName = (user?: ApiOrder["user"]) => {
  if (!user) return "Unknown";
  if (user.fullName && user.fullName.trim()) return user.fullName.trim();
  const profileName = [user.profile?.firstName, user.profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (profileName) return profileName;
  return user.email ?? "Unknown";
};

const mapOrderStatus = (status?: string): Order["status"] => {
  if (!status) return "pending";
  const normalized = status.toLowerCase();
  if (normalized.includes("cancel")) return "cancelled";
  if (normalized.includes("paid") || normalized.includes("complete")) return "paid";
  return "pending";
};

const mapPaymentStatus = (status?: string): Order["paymentStatus"] => {
  if (!status) return "pending";
  const normalized = status.toLowerCase();
  if (normalized.includes("refund")) return "refunded";
  if (normalized.includes("paid") || normalized.includes("complete")) return "completed";
  return "pending";
};

const mapPaymentStatusValue = (status?: string): Payment["status"] => {
  if (!status) return "pending";
  const normalized = status.toLowerCase();
  if (normalized.includes("refund")) return "refunded";
  if (normalized.includes("fail")) return "failed";
  if (normalized.includes("paid") || normalized.includes("complete")) return "completed";
  return "pending";
};

export const mapApiOrderToOrder = (order: ApiOrder): Order => {
  const vehicle = order.vehicleSnapshot ?? {};
  const amount =
    order.paymentBreakdown?.totalUsd ??
    order.totalLandedCostUsd ??
    order.quotedPriceUsd ??
    order.depositAmountUsd ??
    0;

  return {
    id: order.id,
    userId: order.userId ?? order.user?.id ?? "",
    userName: formatOrderUserName(order.user ?? undefined),
    userEmail: order.user?.email ?? "",
    carId:
      order.vehicleId ??
      order.externalVehicleId ??
      vehicle.id ??
      vehicle.apiListingId ??
      vehicle.vin ??
      "",
    carDetails: {
      make: vehicle.make ?? "Unknown",
      model: vehicle.model ?? "Unknown",
      year: vehicle.year ?? 0,
    },
    amount,
    status: mapOrderStatus(order.status),
    paymentStatus: mapPaymentStatus(order.status),
    notes:
      order.customerNotes ??
      order.specialRequests ??
      order.deliveryInstructions ??
      undefined,
    createdAt: order.createdAt ?? new Date(0).toISOString(),
    updatedAt: order.updatedAt ?? order.createdAt ?? new Date(0).toISOString(),
    country: order.destinationCountry ?? "",
  };
};


export const mapApiPaymentToPayment = (payment: ApiPayment): Payment => {
  const amount =
    payment.amountUsd ??
    payment.amountLocal ??
    payment.metadata?.calculation?.paymentAmount ??
    0;
  const method = payment.paymentMethod ?? payment.paymentProvider ?? "unknown";
  const transactionId =
    payment.transactionRef ??
    payment.providerTransactionId ??
    payment.id;

  return {
    id: payment.id,
    orderId: payment.orderId ?? "",
    amount,
    status: mapPaymentStatusValue(payment.status ?? undefined),
    method,
    transactionId,
    createdAt: payment.createdAt ?? new Date(0).toISOString(),
    refundAmount: payment.refundAmount ?? undefined,
    refundedAt: payment.refundedAt ?? undefined,
  };
};
