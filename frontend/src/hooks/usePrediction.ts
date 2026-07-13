import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { predictionService } from "../services/predictionService";
import type { ApiError, PredictionRequest, PredictionViewData } from "../types";
import { showApiErrorToast } from "../utils/apiError";

export const usePrediction = () => {
  const queryClient = useQueryClient();

  return useMutation<PredictionViewData, ApiError, PredictionRequest>({
    mutationFn: (request: PredictionRequest) => predictionService.predictMachine(request),
    onSuccess: (data, request) => {
      toast.success("Prediction completed successfully");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["monitoring"] });
      queryClient.invalidateQueries({ queryKey: ["history", request.machineID] });
      return data;
    },
    onError: (error) => {
      showApiErrorToast(error);
    },
  });
};
