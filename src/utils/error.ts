import { isAxiosError } from "axios";

export function extractApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}
