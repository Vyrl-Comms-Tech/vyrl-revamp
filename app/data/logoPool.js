const BROKEN_UNDER_MONOCHROME_FILTER = [];
// 13, 20, 31
export const logoPool = Array.from({ length: 32 }, (_, i) => i + 1)
  .filter((n) => !BROKEN_UNDER_MONOCHROME_FILTER.includes(n))
  .map((n) => `logos/logo (${n}).avif`);
