export function computePageRange(
  total: number,
  page: number,
  pageSize: number,
): {
  page: number;
  pageSize: number;
  pageCount: number;
  offset: number;
} {
  const safeSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(total / safeSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return { page: safePage, pageSize: safeSize, pageCount, offset: (safePage - 1) * safeSize };
}
