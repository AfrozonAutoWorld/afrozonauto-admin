import axios from "axios";
import { getSession } from "next-auth/react";

export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://afrozonauto-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token dynamically before every request
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession(); // ✅ allowed outside components
    const token = session?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
