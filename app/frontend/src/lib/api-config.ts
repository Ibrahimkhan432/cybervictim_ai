/**
 * API Configuration
 * Gets the base URL for API requests based on environment
 */

export function getAPIBaseURL(): string {
  // In production, use environment variable (set in Vercel/deployment)
  const envURL = import.meta.env.VITE_API_BASE_URL;

  if (envURL) {
    return envURL;
  }

  // In development, default to localhost
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }

  // Fallback (shouldn't reach here in normal operation)
  return "";
}

/**
 * Full API endpoint builder
 */
export function getAPIEndpoint(path: string): string {
  const baseURL = getAPIBaseURL();
  if (!baseURL) {
    console.warn("API_BASE_URL not configured");
    return path; // Fallback to relative path
  }
  return `${baseURL}${path}`;
}
