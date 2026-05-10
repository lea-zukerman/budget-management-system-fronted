import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../redux";
import {
  notificationService,
  NotificationDto,
} from "../../services/notificationService";

const NotificationsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ... שאר האימפורטים
  useEffect(() => {
    const loadNotifications = async () => {
      // בדיקה שיש לנו משתמש מחובר לפני ביצוע הקריאה
      if (!user?.id) return;

      setLoading(true);
      setError("");
      try {
        // שימוש בפונקציה הספציפית למשתמש
        const res = await notificationService.getUserNotifications(user.id);
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
        setError("לא ניתן לטעון התראות כרגע.");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user?.id]); // הוספת user.id כמפתח תלות
  // ... שאר הקוד

  const markRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
    } catch (err) {
      console.error(err);
      setError("לא ניתן לסמן כהקראה.");
    }
  };

  const remove = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setError("לא ניתן למחוק את ההודעה.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        direction: "rtl",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>התראות</h2>
      {error && (
        <div style={{ color: "red", marginBottom: "12px" }}>{error}</div>
      )}
      {loading && <div>טוען התראות...</div>}

      {!loading && notifications.length === 0 && (
        <div style={{ color: "#555" }}>אין התראות להצגה.</div>
      )}

      <div style={{ display: "grid", gap: "10px" }}>
        {notifications.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "14px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: item.isRead ? "#f7f7f7" : "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h4 style={{ margin: 0 }}>{item.title}</h4>
              <span style={{ color: "#888", fontSize: "12px" }}>
                {new Date(item.createdAt).toLocaleString("he-IL")}
              </span>
            </div>
            <p style={{ marginTop: "6px" }}>{item.body}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {!item.isRead && (
                <button
                  onClick={() => markRead(item.id)}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #28a745",
                    background: "#28a745",
                    color: "white",
                    borderRadius: "4px",
                  }}
                >
                  סמן כנקרא
                </button>
              )}
              <button
                onClick={() => remove(item.id)}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #e74c3c",
                  background: "#e74c3c",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                מחק
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
