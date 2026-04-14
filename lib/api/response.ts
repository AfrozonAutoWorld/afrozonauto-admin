export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: {
    data: T;
  };
  timestamp: string;
};

export const unwrapApiData = <T>(response: ApiResponse<T>): T =>
  response.data.data;

export const pickEntity = <T>(payload: unknown, key?: string): T => {
  if (payload && typeof payload === "object" && key && key in payload) {
    return (payload as Record<string, unknown>)[key] as T;
  }

  return payload as T;
};
