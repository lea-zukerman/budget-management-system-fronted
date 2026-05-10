import api from "./api";

export interface EmailSettingsUpdateDto {
  hasEmailIntegration: boolean;
  emailHost: string;
  emailPort: number;
  EmailAppPassword: string; // הוספת שדה לסיסמת אפליקציה במידת הצורך
}

export interface EmailSettingsDto {
  email: string;
  host: string;
  port: number;
  hasEmailIntegration: boolean;
  updatedAt?: string;
}

export const emailService = {
  updateEmailSettings: (id: number, settings: EmailSettingsUpdateDto) =>
    api.put(`/Users/${id}/update-email-settings`, settings),

  getEmailSettings: (id: number) =>
    api.get<EmailSettingsDto>(`/Users/${id}/email-settings`),
};
