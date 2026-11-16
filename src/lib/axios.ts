import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export const fetchFunc = async <T>(endpoint: string, options?: AxiosRequestConfig): Promise<T> => {
  try {
    const res: AxiosResponse<T> = await axios(`/api${endpoint}`, {
      ...options,
    });

    return res.data;
  } catch (error) {
    throw axios.isAxiosError(error)
      ? new Error(`API request failed: ${(error as AxiosError).message}`)
      : error;
  }
};
