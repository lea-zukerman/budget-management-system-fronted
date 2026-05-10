import api from "./api";
import { User } from "../types";

export interface EmailSettingsUpdateDto {
  hasEmailIntegration: boolean;
  emailHost?: string;
  emailPort?: number;
}


export interface MonthlySettingsUpdateDto {
  MonthlyIncome: number; // שינוי ל-M גדולה כדי להתאים ל-C# DTO
}

export const userService = {
  getById: (id: number) => api.get<User>(`/Users/${id}`),
  updateEmailSettings: (id: number, settings: EmailSettingsUpdateDto) =>
    api.put(`/Users/${id}/update-email-settings`, settings),
  updateMonthlySettings: (id: number, settings: MonthlySettingsUpdateDto) =>
    api.put(`/Users/${id}/update-Monthly-settings`, settings),
  updateProfile: (id: number, user: Partial<User>) =>
    api.put(`/Users/update-profile/${id}`, user),
};
// בקובץ userService.ts
