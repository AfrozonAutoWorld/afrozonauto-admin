import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SESSION_CACHE_TTL_MS = 5000;

let cachedAccessToken: string | null = null;
let cachedAt = 0;
let sessionRequest: ReturnType<typeof getSession> | null = null;
let isSigningOut = false;

const getAccessToken = async () => {
  const now = Date.now();

  if (cachedAccessToken && now - cachedAt < SESSION_CACHE_TTL_MS) {
    return cachedAccessToken;
  }

  if (!sessionRequest) {
    sessionRequest = getSession().finally(() => {
      sessionRequest = null;
    });
  }

  const session = await sessionRequest;
  cachedAccessToken = session?.accessToken ?? null;
  cachedAt = now;

  return cachedAccessToken;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      cachedAccessToken = null;
      cachedAt = 0;

      if (typeof window !== "undefined" && !isSigningOut) {
        isSigningOut = true;
        try {
          await signOut({ callbackUrl: "/login", redirect: true });
        } finally {
          isSigningOut = false;
        }
      }
    }
    return Promise.reject(error);
  },
);
