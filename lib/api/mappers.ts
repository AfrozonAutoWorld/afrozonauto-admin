import type {
  Order,
  Payment,
  PaymentOrderSummary,
  PaymentOrderVehicle,
  User,
} from "@/types";
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
    profileId: user.profile?.id ?? null,
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
    sellerVerifiedAt: user.profile?.sellerVerifiedAt ?? null,
    sellerRejectedReason: user.profile?.sellerRejectedReason ?? null,
    verifiedAt: user.profile?.verifiedAt ?? null,
    isSeller: user.profile?.isSeller ?? false,
    isVerified: user.profile?.isVerified ?? false,
    firstName: user.profile?.firstName ?? null,
    lastName: user.profile?.lastName ?? null,
    avatar: user.profile?.avatar ?? null,
    dateOfBirth: user.profile?.dateOfBirth ?? null,
    identificationNumber: user.profile?.identificationNumber ?? null,
    identificationType: user.profile?.identificationType ?? null,
    identificationDocument: user.profile?.identificationDocument ?? null,
    businessName: user.profile?.businessName ?? null,
    taxId: user.profile?.taxId ?? null,
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

const mapPaymentOrderVehicle = (
  vehicle?: ApiOrder["vehicleSnapshot"] | null,
) : PaymentOrderVehicle | null => {
  if (!vehicle) {
    return null;
  }

  return {
    id:
      vehicle.id ??
      vehicle.apiListingId ??
      vehicle.vin ??
      "",
    vin: vehicle.vin ?? "",
    slug: vehicle.slug ?? null,
    make: vehicle.make ?? "Unknown",
    model: vehicle.model ?? "Unknown",
    year: vehicle.year ?? 0,
    priceUsd: vehicle.priceUsd ?? null,
    mileage: vehicle.mileage ?? null,
    vehicleType: vehicle.vehicleType ?? null,
    transmission: vehicle.transmission ?? null,
    fuelType: vehicle.fuelType ?? null,
    engineSize: vehicle.engineSize ?? null,
    drivetrain: vehicle.drivetrain ?? null,
    dealerName: vehicle.dealerName ?? null,
    dealerState: vehicle.dealerState ?? null,
    dealerCity: vehicle.dealerCity ?? null,
    dealerZipCode: vehicle.dealerZipCode ?? null,
    images: vehicle.images ?? [],
    status: vehicle.status ?? null,
  };
};

const mapPaymentOrder = (
  order?: ApiOrder | null,
  fallbackOrderId?: string,
): PaymentOrderSummary | null => {
  if (!order && !fallbackOrderId) return null;

  return {
    id: order?.id ?? fallbackOrderId ?? "",
    vehicleId: order?.vehicleId ?? null,
    requestNumber: order?.requestNumber ?? null,
    status: order?.status ?? null,
    previousStatus: order?.previousStatus ?? [],
    shippingMethod: order?.shippingMethod ?? null,
    destinationCountry: order?.destinationCountry ?? null,
    paymentMethod: order?.paymentMethod ?? null,
    createdAt: order?.createdAt ?? undefined,
    updatedAt: order?.updatedAt ?? order?.createdAt ?? undefined,
    vehicle: mapPaymentOrderVehicle(order?.vehicleSnapshot),
    paymentBreakdown: order?.paymentBreakdown
      ? {
          totalUsd: order.paymentBreakdown.totalUsd ?? null,
          totalUsedDeposit: order.paymentBreakdown.totalUsedDeposit ?? null,
          shippingMethod: order.paymentBreakdown.shippingMethod ?? null,
          breakdown: order.paymentBreakdown.breakdown ?? null,
        }
      : null,
  };
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
    orderId: payment.orderId ?? payment.order?.id ?? "",
    userId: payment.userId ?? payment.user?.id ?? "",
    amount,
    amountLocal: payment.amountLocal ?? null,
    localCurrency: payment.localCurrency ?? null,
    exchangeRate: payment.exchangeRate ?? null,
    status: mapPaymentStatusValue(payment.status ?? undefined),
    rawStatus: payment.status ?? null,
    escrowStatus: payment.escrowStatus ?? null,
    method,
    paymentType: payment.paymentType ?? null,
    paymentProvider: payment.paymentProvider ?? null,
    transactionId,
    transactionRef: payment.transactionRef ?? null,
    providerTransactionId: payment.providerTransactionId ?? null,
    receiptUrl: payment.receiptUrl ?? null,
    evidenceUrls: payment.evidenceUrls ?? [],
    evidencePublicIds: payment.evidencePublicIds ?? [],
    evidenceUploadedAt: payment.evidenceUploadedAt ?? null,
    adminConfirmedBy: payment.adminConfirmedBy ?? null,
    adminConfirmedAt: payment.adminConfirmedAt ?? null,
    adminNote: payment.adminNote ?? null,
    createdAt: payment.createdAt ?? new Date(0).toISOString(),
    updatedAt: payment.updatedAt ?? payment.createdAt ?? new Date(0).toISOString(),
    completedAt: payment.completedAt ?? null,
    refundAmount: payment.refundAmount ?? undefined,
    refundReason: payment.refundReason ?? null,
    refundedAt: payment.refundedAt ?? undefined,
    refundedBy: payment.refundedBy ?? null,
    description: payment.description ?? null,
    user: payment.user
      ? {
          id: payment.user.id ?? payment.userId ?? "",
          email: payment.user.email ?? "",
          name: formatOrderUserName(payment.user),
          firstName: payment.user.profile?.firstName ?? null,
          lastName: payment.user.profile?.lastName ?? null,
        }
      : null,
    order: mapPaymentOrder(payment.order, payment.orderId),
  };
};
