import api from "./api";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";


export const invoiceService = {
  uploadInvoice: (file: File, userId?: number) => {
    const formData = new FormData();
    formData.append("file", file);
    if (userId != null) {
      formData.append("userId", String(userId));
    }
    return api.post("/Invoices/scan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // דוגמה למימוש ב-Service
confirmInvoice: (invoiceId: number, categoryId: number, userId: number) => {
    // ה-api כבר יודע שהכתובת מתחילה ב-localhost:7294/api
      console.log("Confirming Invoice:", { invoiceId, categoryId, userId });

    return api.post("/Invoices/confirm-category", null, {
        
      params: { invoiceId, categoryId, userId }
      
    });
},
};
