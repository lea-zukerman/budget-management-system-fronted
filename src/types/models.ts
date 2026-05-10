export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
  token: string;
}

export interface Invoice {
  id: string;
  cardHolder: string;
  amount: number;
  currency: string;
  date: string;
  status: "paid" | "pending" | "overdue";
  description?: string;
}

export interface Transaction {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  merchant: string;
  category: string;
}

export interface ApiError {
  message: string;
  code?: number;
}
