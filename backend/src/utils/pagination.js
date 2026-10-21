/**
 * Standardized pagination utilities for Bizora Digital Market
 */

/**
 * Safely parses and validates page and limit parameters from request queries
 *
 * @param {Object} query - Express req.query object
 * @param {number} defaultLimit - Fallback page size (default: 10)
 * @param {number} maxLimit - Upper bound limit cap (default: 100)
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function parsePagination(query = {}, defaultLimit = 10, maxLimit = 100) {
  const parsedPage = parseInt(query.page, 10);
  const page = !isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const parsedLimit = parseInt(query.limit, 10);
  const rawLimit = !isNaN(parsedLimit) && parsedLimit >= 1 ? parsedLimit : defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, rawLimit));

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Standardizes pagination metadata across all API responses
 *
 * @param {number} total - Total records matching query
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @returns {{ total: number, page: number, limit: number, totalPages: number }}
 */
export function formatPaginationMeta(total, page, limit) {
  const safeTotal = typeof total === 'number' && !isNaN(total) && total >= 0 ? total : 0;
  const totalPages = safeTotal === 0 ? 1 : Math.ceil(safeTotal / limit);

  return {
    total: safeTotal,
    page,
    limit,
    totalPages
  };
}

export default {
  parsePagination,
  formatPaginationMeta
};

