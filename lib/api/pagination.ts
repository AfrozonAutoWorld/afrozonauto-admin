export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
  fromApi?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
} & Record<string, string | number | boolean | undefined>;

const toNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizePaginatedPayload = <T>(
  payload: Record<string, unknown> | T[],
  key: string,
): PaginatedResult<T> => {
  if (Array.isArray(payload)) {
    const total = payload.length;
    return {
      items: payload,
      meta: {
        total,
        page: 1,
        limit: total || 10,
        pages: total ? 1 : 0,
        fromApi: 0,
      },
    };
  }

  const itemsCandidate = payload[key] ?? payload.data ?? [];
  const items = Array.isArray(itemsCandidate) ? (itemsCandidate as T[]) : [];
  const metaSource =
    payload.meta && typeof payload.meta === "object"
      ? (payload.meta as Record<string, unknown>)
      : {};

  const total = toNumber(payload.total ?? metaSource.total, items.length);
  const page = toNumber(payload.page ?? metaSource.page, 1);
  const limit = toNumber(payload.limit ?? metaSource.limit, items.length || 10);
  const pages = toNumber(
    payload.pages ?? metaSource.pages,
    Math.max(1, Math.ceil(total / Math.max(limit, 1))),
  );
  const fromApi = toNumber(payload.fromApi ?? metaSource.fromApi, 0);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      pages,
      fromApi,
    },
  };
};

export const withPaginationDefaults = <T extends PaginationParams>(
  params?: T,
  defaults: Pick<PaginationParams, "page" | "limit"> = { page: 1, limit: 10 },
): T & Required<Pick<PaginationParams, "page" | "limit">> => {
  return {
    ...defaults,
    ...(params ?? {}),
  } as T & Required<Pick<PaginationParams, "page" | "limit">>;
};
