export type UserRole = "super_admin" | "operations_admin" | "SELLER" | "BUYER";

export type OrderStatus = "pending" | "paid" | "cancelled";

export type CarSource = "api" | "manual";

export type CarCondition = "new" | "used" | "certified";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "active" | "inactive";
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
  userId: string;
  userName: string;
  userEmail: string;
  carId: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
  };
  amount: number;
  status: OrderStatus;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  country: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  method: string;
  transactionId: string;
  createdAt: string;
  refundAmount?: number;
  refundedAt?: string;
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
  type: "order" | "payment" | "user" | "car";
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
