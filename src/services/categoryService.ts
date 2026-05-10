import api from "./api";

export interface CategoryDto {
  id: number;
  name?: string;
  Name?: string;
  colorHex?: string;
  ColorHex?: string;
  userId?: number;
  UserId?: number;
}

export interface MonthlyBudgetDto {
  UserId: number;
  CategoryId: number;
  BudgetLimit: number;
  CalculatedAmount: number;
  TotalSpentSoFar: number;
  Month: number;
  Year: number;
}

const base = "/Categories";

export const categoryService = {
  getAll: async (userId: number) => {
    try {
      return await api.get<CategoryDto[]>(`${base}/user/${userId}`);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return api.get<CategoryDto[]>(base, { params: { userId } });
      }
      throw err;
    }
  },

  getByUserId: (userId: number) =>
    api.get<CategoryDto[]>(`${base}/user/${userId}`),

  add: (category: Omit<CategoryDto, "id">) =>
    api.post<CategoryDto>(base, category),

  update: (id: number, category: Omit<CategoryDto, "id">) =>
    api.put<CategoryDto>(`${base}/${id}`, category),

  delete: (id: number) => api.delete(`${base}/${id}`),

  getMonthlyBudgets: () => api.get("/MonthlyBudgets"),

  updateMonthlyBudget: (dto: MonthlyBudgetDto) =>
    api.put("/MonthlyBudgets", dto),

  addMonthlyBudget: (dto: MonthlyBudgetDto) => {
    const payload = {
      UserId: dto.UserId,
      CategoryId: dto.CategoryId,
      BudgetLimit: dto.BudgetLimit,
      CalculatedAmount: dto.CalculatedAmount,
      TotalSpentSoFar: dto.TotalSpentSoFar,
      Month: dto.Month,
      Year: dto.Year,
    };
    return api.post("/MonthlyBudgets", payload);
  },
};
