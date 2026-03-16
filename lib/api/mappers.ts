import type { Order, User } from "@/types";
import type { ApiOrder, ApiUser } from "@/types/api";

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
  const roleValue = user.role ?? "operations_admin";
  const roleUpper = roleValue.toUpperCase();
  const roleLower = roleValue.toLowerCase();
  const role =
    roleUpper === "SELLER" || roleUpper === "BUYER"
      ? (roleUpper as User["role"])
      : roleLower === "super_admin" || roleLower === "operations_admin"
        ? (roleLower as User["role"])
        : "operations_admin";

  return {
    id: user.id,
    name: formatName(user),
    email: user.email,
    phone: user.phone ?? "",
    role,
    status: user.isActive === false ? "inactive" : "active",
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
