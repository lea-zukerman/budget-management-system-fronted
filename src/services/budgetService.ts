import api from "./api";

export interface CategoryPercentage {
  categoryId: string;
  percentage: number;
}

export interface MonthlyBudgetDto {
  Id: number;
  UserId: number;
  CategoryId: number;
  CategoryName?: string;
  BudgetLimit: number;
  CalculatedAmount: number;
  TotalSpentSoFar: number;
  Month: number;
  Year: number;
}

export const budgetService = {
  getMonthlyBudget: (month: number, year: number) =>
    api.get(`/MonthlyBudget/${year}/${month}`),

  updateBudget: (data: MonthlyBudgetDto) => api.post("/MonthlyBudget", data),

  getAllMonthlyBudgets: () => api.get<MonthlyBudgetDto[]>("/MonthlyBudgets"),

  getByUserId: (userId: number) =>
    api.get<MonthlyBudgetDto[]>(`/MonthlyBudgets/user/${userId}`),

  updateMonthlyBudgetLimit: (id: number, limit: number) =>
    api.put(`/MonthlyBudgets/${id}/limitBudget`, { budgetLimit: limit }),
};
