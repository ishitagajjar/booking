/** API base URL. Uses VITE_API_URL in production; falls back to /api (Vite dev proxy). */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
