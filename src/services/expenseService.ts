import api from "./api";

export interface Expense {
  id: number;
  userId: number;
  categoryId?: number;
  categoryName?: string;
  vendorName?: string;
  finalAmount: number;
  transactionDate: string;
  invoiceId?: number;
  userNote?: string;
  isAutoCategorized: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export const expenseService = {
  // שליפת הוצאות לפי משתמש
  getUserExpenses: (userId: number) =>
    api.get<Expense[]>(`/Expenses/user/${userId}`),

  // שליפת קטגוריות (כדי למלא את ה-Select)
  getCategories: () => api.get<Category[]>("/Categories"),

  // עדכון הוצאה
  updateExpense: (id: number, data: Partial<Expense>) =>
    api.put(`/Expenses/${id}`, data),

  // עדכון קטגוריה של הוצאה
  updateExpenseCategory: (id: number, categoryId: number) =>
    api.put(`/Expenses/${id}`, { categoryId }),

  // מחיקת הוצאה
  deleteExpense: (id: number) => api.delete(`/Expenses/${id}`),
};
