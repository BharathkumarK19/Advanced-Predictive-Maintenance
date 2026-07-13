import { toast } from "sonner";
import type { ApiError } from "../types";

export const isBackendUnavailable = (error: ApiError) =>
  error.status == null || error.message.toLowerCase().includes("network") || error.message.toLowerCase().includes("timeout");

export const showApiErrorToast = (error: ApiError) => {
  if (isBackendUnavailable(error)) {
    toast.error("Backend unavailable", {
      description: "Retrying...",
    });
    return;
  }

  toast.error(error.message);
};
