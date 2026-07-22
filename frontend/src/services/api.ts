import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "../types";

const createApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
    return {
      message:
        axiosError.response?.data?.detail ??
        axiosError.response?.data?.message ??
        axiosError.message ??
        "Request failed",
      status: axiosError.response?.status,
      details: axiosError.response?.data,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Unexpected API error" };
};

export const getErrorMessage = (error: unknown) => createApiError(error).message;

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const metricsApi: AxiosInstance = axios.create({
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const attachDefaultInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use((config) => {
    config.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(config.headers ?? {}),
    } as InternalAxiosRequestConfig["headers"];
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(createApiError(error)),
  );
};

attachDefaultInterceptors(api);
attachDefaultInterceptors(metricsApi);
