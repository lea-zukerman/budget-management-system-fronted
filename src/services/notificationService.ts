import api from "./api";

export interface NotificationDto {
  id: number;
  userId: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}
// קריאה ל־API שיחזיר את כל ההתראות
export const notificationService = {
  // קריאה לפי מזהה משתמש
  getUserNotifications: (userId: number) =>
    api.get<NotificationDto[]>(`/Notifications/user/${userId}`),

  markAsRead: (id: number) => api.put(`/Notifications/${id}/mark-as-read`),

  deleteNotification: (id: number) => api.delete(`/Notifications/${id}`),
};
