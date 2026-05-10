import React from "react";
import styles from "./LoginPage.module.css";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

export interface LoginPageViewProps {
  form: {
    email: string;
    password: string;
  };
  loading: boolean;
  errorMessage?: string | null;
  onFieldChange: (field: "email" | "password", value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const LoginPageView: React.FC<LoginPageViewProps> = ({
  form,
  loading,
  errorMessage,
  onFieldChange,
  onSubmit,
}) => {
  return (
    <div className={styles.pageContainer}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h2 className={styles.title}>התחברות</h2>

        <label className={styles.field} htmlFor="email">
          אימייל
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={form.email}
          onChange={(e) => onFieldChange("email", e.target.value)}
          placeholder="example@email.com"
          autoComplete="email"
        />

        <label className={styles.field} htmlFor="password">
          סיסמה
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={form.password}
          onChange={(e) => onFieldChange("password", e.target.value)}
          placeholder="••••••••••"
          autoComplete="current-password"
        />

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading}
        >
          {loading ? <LoadingSpinner text="טוען..." /> : "התחבר"}
        </button>

        <div className={styles.footerText}>
          אין לך חשבון? <a href="/register">הרשם כאן</a>
        </div>
      </form>
    </div>
  );
};

export default LoginPageView;
