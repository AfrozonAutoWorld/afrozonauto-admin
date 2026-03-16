export type ApiUserProfile = {
  id?: string;
  userId?: string;
  avatar?: string | null;
  dateOfBirth?: string | null;
  identificationNumber?: string | null;
  identificationType?: string | null;
  identificationDocument?: string | null;
  businessName?: string | null;
  taxId?: string | null;
  isVerified?: boolean;
  verifiedAt?: string | null;
  isSeller?: boolean;
  sellerStatus?: string | null;
  sellerVerifiedAt?: string | null;
  sellerRejectedReason?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiUser = {
  id: string;
  email: string;
  emailVerified?: boolean;
  fullName?: string | null;
  phone?: string | null;
  role?: string;
  isActive?: boolean;
  isSuspended?: boolean;
  googleId?: string | null;
  appleId?: string | null;
  isDeleted?: boolean;
  suspensionReason?: string | null;
  suspensionUntil?: string | null;
  walletBalance?: number;
  currency?: string;
  language?: string;
  timezone?: string | null;
  notificationPreferences?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  online?: boolean;
  profile?: ApiUserProfile | null;
};

export type ApiOrderUser = {
  id?: string;
  email?: string;
  fullName?: string | null;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export type ApiOrderVehicleSnapshot = {
  id?: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  apiListingId?: string;
};

export type ApiOrder = {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  user?: ApiOrderUser | null;
  vehicleId?: string | null;
  externalVehicleId?: string | null;
  vehicleSnapshot?: ApiOrderVehicleSnapshot | null;
  destinationCountry?: string | null;
  customerNotes?: string | null;
  specialRequests?: string | null;
  deliveryInstructions?: string | null;
  paymentBreakdown?: {
    totalUsd?: number;
  } | null;
  quotedPriceUsd?: number | null;
  depositAmountUsd?: number | null;
  totalLandedCostUsd?: number | null;
};
