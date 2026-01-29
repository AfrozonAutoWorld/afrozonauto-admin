import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    fullName: string | null;
    phone: string | null;
    role: "SUPER_ADMIN" | "ADMIN" | "OPERATION" | "BUYER";
    isActive: boolean;
    isSuspended: boolean;
    googleId: string;
    appleId: string;
    isDeleted: boolean;
    suspensionReason: string | null;
    suspensionUntil: string | null;
    walletBalance: number;
    currency: string;
    language: string;
    timezone: string;
    notificationPreferences: string | null;
    lastLoginAt: string;
    createdAt: string;
    updatedAt: string;
    online: boolean;
    accessToken: string;
    refreshToken: string;
  }

  interface Session {
    user: User & DefaultSession["user"];
    accessToken: string;
    refreshToken: string;
    error?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    emailVerified?: boolean;
    fullName?: string | null;
    phone?: string | null;
    role?: "SUPER_ADMIN" | "ADMIN" | "OPERATION" | "BUYER";
    isActive?: boolean;
    isSuspended?: boolean;
    googleId?: string;
    appleId?: string;
    isDeleted?: boolean;
    suspensionReason?: string | null;
    suspensionUntil?: string | null;
    walletBalance?: number;
    currency?: string;
    language?: string;
    timezone?: string;
    notificationPreferences?: string | null;
    lastLoginAt?: string;
    createdAt?: string;
    updatedAt?: string;
    online?: boolean;
    accessToken?: string;
    refreshToken?: string;
    exp?: number;
    error?: string;
  }
}
