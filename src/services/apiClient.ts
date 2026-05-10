import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { store } from "../redux";
import { logout } from "../redux/authSlice";

const apiClient = axios.create({
  baseURL: "https://api.creditcardproject.local",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.user?.token;
    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
