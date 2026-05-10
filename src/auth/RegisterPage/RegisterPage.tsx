import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux";
import { register } from "../../redux/authSlice";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // בונוס: עין לסיסמה
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    general: "",
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authError = useAppSelector((state) => state.auth.error);
  const loading = useAppSelector((state) => state.auth.loading);

  const validate = () => {
    let isValid = true;
    let newErrors = { name: "", email: "", password: "", general: "" };

    if (!name.trim()) {
      newErrors.name = "חובה להזין שם מלא";
      isValid = false;
    }

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "נא להזין כתובת אימייל תקנית (לדוגמה: name@mail.com)";
      isValid = false;
    }

    if (password.length < 6) {
      newErrors.password = "הסיסמה קצרה מדי - חובה לפחות 6 תווים";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(register({ name, email, password })).unwrap();
      navigate("/dashboard");
    } catch (err) {
      const msg =
        typeof err === "string" ? err : "הרישום נכשל, ייתכן והמייל כבר קיים";
      setErrors((prev) => ({ ...prev, general: msg }));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>יצירת חשבון חדש</h2>
        <p style={styles.subtitle}>
          הצטרף ל-CreditCardManager ונהל את התקציב שלך
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* שדה שם */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>שם מלא</label>
            <input
              style={{
                ...styles.input,
                borderColor: errors.name ? "#ff4d4d" : "#ddd",
              }}
              placeholder="ישראל ישראלי"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          {/* שדה אימייל */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>כתובת אימייל</label>
            <input
              type="email"
              style={{
                ...styles.input,
                borderColor: errors.email ? "#ff4d4d" : "#ddd",
              }}
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <span style={styles.errorText}>{errors.email}</span>
            )}
          </div>

          {/* שדה סיסמה עם עין */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>סיסמה</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                style={{
                  ...styles.input,
                  width: "100%",
                  borderColor: errors.password ? "#ff4d4d" : "#ddd",
                }}
                placeholder="לפחות 6 תווים"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            <small style={styles.helpText}>
              דרישה: הסיסמה חייבת להכיל לפחות 6 תווים
            </small>
            {errors.password && (
              <span style={styles.errorText}>{errors.password}</span>
            )}
          </div>

          {/* שגיאה כללית */}
          {(errors.general || authError) && (
            <div style={styles.alertBox}>{errors.general || authError}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? "מבצע רישום..." : "הירשם עכשיו"}
          </button>
        </form>

        <div style={styles.footer}>
          כבר רשום?{" "}
          <Link to="/login" style={styles.link}>
            התחבר כאן
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    direction: "rtl",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: { textAlign: "center", margin: "0 0 10px 0", color: "#1a1a1a" },
  subtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
    marginBottom: "30px",
  },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  inputGroup: { display: "flex", flexDirection: "column", textAlign: "right" },
  label: { fontWeight: "600", marginBottom: "8px", fontSize: "14px" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
    transition: "0.2s",
    boxSizing: "border-box",
  },
  eyeButton: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },
  helpText: { fontSize: "11px", color: "#007bff", marginTop: "4px" },
  errorText: { color: "#ff4d4d", fontSize: "12px", marginTop: "4px" },
  alertBox: {
    backgroundColor: "#fff2f2",
    color: "#d8000c",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
    border: "1px solid #ffbaba",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    marginTop: "10px",
  },
  footer: {
    marginTop: "25px",
    fontSize: "14px",
    textAlign: "center",
    color: "#555",
  },
  link: { color: "#007bff", textDecoration: "none", fontWeight: "bold" },
};

export default Register;
