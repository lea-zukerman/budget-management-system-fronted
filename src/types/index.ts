// סוגי TypeScript מרכזיים לפרויקט
export interface User {
  id: number;
  name: string;
  email: string;
  token: string;
  monthlyIncome?: number;
  hasEmailIntegration?: boolean;
  emailHost?: string;
  emailPort?: number;
  isAdmin: boolean; // הוספת שדה IsAdmin ל-User
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  cardHolder: string;
  amount: number;
  currency: string;
  date: string; // ISO date
  status: "Paid" | "Pending" | "Overdue";
  description?: string;
}
