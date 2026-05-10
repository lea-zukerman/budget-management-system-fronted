import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// 1. יצירת אינסטנס של axios עם baseURL של השרת.
// ההגדרה הבאה מספקת את הבסיס לכל הקריאות אל ה-API.
const api = axios.create({
  // כתובת ה-API שלך: https://localhost:7294/
  // במידה וה-endpoint שלך מתחיל ב"/api" יש להוסיף: "https://localhost:7294/api"
  baseURL: "https://localhost:7294/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// 2. הוספת interceptor שנקרא לפני כל בקשה
// בודק אם קיים טוקן ב-localStorage ומוסיף אותו לכותרת Authorization.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      (config.headers as Record<string, string>).Authorization =
        `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// 3. Interceptor לתשובות כדי לטפל ב-401 ולהציג שגיאות.
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // במקרה של טוקן פסול, ננקה את המשתמש.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

export default api;
