import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux";
import { login } from "../../redux/authSlice";
import LoginPageView from "./LoginPage.view";

export interface LoginFormState {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector((state) => state.auth.loading);
  const authError = useAppSelector((state) => state.auth.error);

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!form.email || !form.password) {
      setErrorMessage("נא מלא/י אימייל וסיסמה.");
      return false;
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      setErrorMessage("נא הזן/י אימייל תקין.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      // 1. מבצעים את ה-Login ומחכים לנתוני המשתמש שיחזרו מהשרת
      const userResponse = await dispatch(login(form)).unwrap();

      // בדיקת דיבאג ב-Console כדי לוודא שהנתון isAdmin קיים
      console.log("Login Success, User Role Check:", userResponse);

      // 2. לוגיקת הניקוט החדשה:
      // אם ב-Console מופיע isAdmin: true, הוא יעבור ל-/admin
      if (userResponse.isAdmin) {
        navigate("/admin");
      } else {
        // משתמש רגיל (כמו אלו שראינו ב-DB עם False) יעבור ל-Dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      const text = typeof err === "string" ? err : "שגיאת התחברות, נסה שוב";
      setErrorMessage(text);
    }
  };

  const handleField = (field: keyof LoginFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <LoginPageView
      form={form}
      loading={loading}
      errorMessage={errorMessage || authError}
      onFieldChange={handleField}
      onSubmit={handleSubmit}
    />
  );
};

export default LoginPage;
