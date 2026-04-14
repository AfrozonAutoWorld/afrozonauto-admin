export type UserRole =
  | "SUPER_ADMIN"
  | "OPERATIONS_ADMIN"
  | "SELLER"
  | "BUYER";

export type OrderStatus = string;

export type CarSource = "api" | "manual";

export type CarCondition = "new" | "used" | "certified";

export interface User {
  id: string;
  profileId?: string | null;
  name: string;
  email: string;
  emailVerified?: boolean;
  phone: string;
  role: UserRole;
  status: "active" | "inactive";
  isSuspended?: boolean;
  walletBalance?: number;
  currency?: string;
  language?: string;
  timezone?: string;
  lastLoginAt?: string | null;
  notificationPreferences?: string | null;
  sellerStatus?: string | null;
  sellerVerifiedAt?: string | null;
  sellerRejectedReason?: string | null;
  verifiedAt?: string | null;
  isSeller?: boolean;
  isVerified?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  identificationNumber?: string | null;
  identificationType?: string | null;
  identificationDocument?: string | null;
  businessName?: string | null;
  taxId?: string | null;
  createdAt: string;
  country: string;
  totalOrders: number;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  condition: CarCondition;
  mileage?: number;
  location: string;
  country: string;
  source: CarSource;
  featured: boolean;
  available: boolean;
  images: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  requestNumber?: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  user?: PaymentUserSummary | null;
  carId: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
  };
  amount: number;
  status: OrderStatus;
  rawStatus?: string | null;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  notes?: string;
  customerNotes?: string | null;
  specialRequests?: string | null;
  deliveryInstructions?: string | null;
  createdAt: string;
  updatedAt: string;
  statusChangedAt?: string | null;
  statusChangedBy?: string | null;
  country: string;
  destinationCountry?: string | null;
  destinationState?: string | null;
  destinationCity?: string | null;
  destinationAddress?: string | null;
  destinationPort?: string | null;
  originPort?: string | null;
  shippingMethod?: string | null;
  paymentMethod?: string | null;
  priority?: string | null;
  quoteExpiresAt?: string | null;
  quotedPriceUsd?: number | null;
  depositAmountUsd?: number | null;
  totalLandedCostUsd?: number | null;
  totalLandedCostLocal?: number | null;
  localCurrency?: string | null;
  exchangeRate?: number | null;
  exchangeRateDate?: string | null;
  estimatedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  refundRequested?: boolean;
  refundApproved?: boolean;
  refundAmount?: number | null;
  previousStatus: string[];
  tags: string[];
  paymentBreakdown?: PaymentOrderBreakdown | null;
  vehicle?: PaymentOrderVehicle | null;
  vehicleId?: string | null;
  payments: Payment[];
}

export interface PaymentUserSummary {
  id: string;
  email: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface PaymentOrderVehicle {
  id: string;
  vin: string;
  slug?: string | null;
  make: string;
  model: string;
  year: number;
  priceUsd?: number | null;
  mileage?: number | null;
  vehicleType?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  engineSize?: string | null;
  drivetrain?: string | null;
  dealerName?: string | null;
  dealerState?: string | null;
  dealerCity?: string | null;
  dealerZipCode?: string | null;
  images: string[];
  status?: string | null;
}

export interface PaymentOrderBreakdown {
  totalUsd?: number | null;
  totalUsedDeposit?: number | null;
  shippingMethod?: string | null;
  breakdown?: Record<string, number | string | null> | null;
}

export interface PaymentOrderSummary {
  id: string;
  vehicleId?: string | null;
  requestNumber?: string | null;
  status?: string | null;
  previousStatus: string[];
  shippingMethod?: string | null;
  destinationCountry?: string | null;
  paymentMethod?: string | null;
  createdAt?: string;
  updatedAt?: string;
  vehicle?: PaymentOrderVehicle | null;
  paymentBreakdown?: PaymentOrderBreakdown | null;
}

export interface Payment {
  id: string;
  orderId: string;
  userId?: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  rawStatus?: string | null;
  escrowStatus?: string | null;
  method: string;
  transactionId: string;
  transactionRef?: string | null;
  providerTransactionId?: string | null;
  amountLocal?: number | null;
  localCurrency?: string | null;
  exchangeRate?: number | null;
  paymentType?: string | null;
  paymentProvider?: string | null;
  receiptUrl?: string | null;
  evidenceUrls: string[];
  evidencePublicIds: string[];
  evidenceUploadedAt?: string | null;
  adminConfirmedBy?: string | null;
  adminConfirmedAt?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
  refundAmount?: number;
  refundReason?: string | null;
  refundedAt?: string;
  refundedBy?: string | null;
  description?: string | null;
  user?: PaymentUserSummary | null;
  order?: PaymentOrderSummary | null;
}

export interface DashboardStats {
  totalUsers: number;
  totalCars: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrdersCount: number;
  carBreakdown: {
    api: number;
    manual: number;
  };
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueChangePercent: number;
}

export interface Activity {
  id: string;
  type: "order" | "payment" | "user" | "car" | "shipment";
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface Notification {
  id: string;
  type: string;
  status: string;
  title: string;
  message: string;
  recipient: string;
  createdAt: string;
  isRead?: boolean;
  readAt?: string | null;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationStats {
  totalSent: number;
  delivered: number;
  pending: number;
  orderAlerts: number;
}

export interface AddCarForm {
  make: string;
  model: string;
  year: number;
  price: number;
  condition: CarCondition;
  mileage: number;
  location: string;
  country: string;
  description: string;
  featured: boolean;
  available: boolean;
  images: File[];
}
