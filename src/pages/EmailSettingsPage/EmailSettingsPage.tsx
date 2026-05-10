import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../redux";
import { emailService } from "../../services/emailService";

const EmailSettingsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [host, setHost] = useState("imap.gmail.com");
  const [port] = useState(993);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [integrationEnabled, setIntegrationEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("emailSettings");
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        setEmail(obj.email || "");
        setHost(obj.host || "imap.gmail.com");
      } catch {
        localStorage.removeItem("emailSettings");
      }
    }
  }, []);

  const saveSettings = async () => {
    setError("");
    setMessage("");
    if (!user?.id) {
      setError("המשתמש לא מחובר.");
      return;
    }
    if (!email.trim() || !password.trim() || !host.trim()) {
      setError("נא למלא את כל השדות.");
      return;
    }

    setLoading(true);
    try {
      const settings = {
        hasEmailIntegration: integrationEnabled,
        emailHost: host.trim(),
        emailPort: port,
        EmailAppPassword: password.trim(),
      };
      await emailService.updateEmailSettings(user.id, settings);

      localStorage.setItem(
        "emailSettings",
        JSON.stringify({
          email: email.trim(),
          host: host.trim(),
          port: port,
          userId: user.id,
        }),
      );

      setMessage("הגדרות המייל נשמרו בהצלחה!");
      setPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "שגיאה בעדכון הגדרות המייל.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        {/* צד ימין: טופס הגדרות */}
        <div style={styles.formSection}>
          <h2 style={styles.title}>הגדרות דואר אלקטרוני</h2>
          <p style={styles.subtitle}>
            חברו את המייל לסריקה אוטומטית של חשבוניות
          </p>

          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>כתובת אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="example@gmail.com"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>סיסמת אפליקציה (App Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="16 תווים ללא רווחים"
              />
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.inputGroup, flex: 2 }}>
                <label style={styles.label}>HOST</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>PORT</label>
                <input
                  type="number"
                  value={port}
                  readOnly
                  style={styles.inputReadOnly}
                />
              </div>
            </div>

            <div style={styles.checkboxWrapper}>
              <input
                type="checkbox"
                checked={integrationEnabled}
                onChange={(e) => setIntegrationEnabled(e.target.checked)}
                id="integration"
                style={styles.checkbox}
              />
              <label htmlFor="integration" style={styles.checkboxLabel}>
                אפשר סריקה אוטומטית
              </label>
            </div>

            {error && <div style={styles.error}>{error}</div>}
            {message && <div style={styles.success}>{message}</div>}

            <button
              onClick={saveSettings}
              disabled={loading}
              style={loading ? styles.buttonDisabled : styles.button}
            >
              {loading ? "שומר..." : "שמור הגדרות"}
            </button>
          </div>
        </div>

        {/* צד שמאל: מדריך חיבור */}
        <div style={styles.guideSection}>
          <h3 style={styles.guideTitle}>כיצד מחברים Gmail?</h3>
          <div style={styles.guideStep}>
            <span style={styles.stepNumber}>1</span>
            <p>
              היכנסו ל-<strong>חשבון Google</strong> שלכם ועברו ללשונית "אבטחה".
            </p>
          </div>
          <div style={styles.guideStep}>
            <span style={styles.stepNumber}>2</span>
            <p>
              וודאו ש-<strong>אימות דו-שלבי</strong> מופעל.
            </p>
          </div>
          <div style={styles.guideStep}>
            <span style={styles.stepNumber}>3</span>
            <p>
              חפשו בשורת החיפוש למעלה: <strong>"סיסמאות לאפליקציות"</strong>.
            </p>
          </div>
          <div style={styles.guideStep}>
            <span style={styles.stepNumber}>4</span>
            <p>
              תנו שם (למשל: "ניהול חשבוניות") והעתיקו את ה-
              <strong>קוד בן 16 התווים</strong> שנוצר.
            </p>
          </div>
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>💡</span>
            יש להזין את הקוד שהעתקתם בשדה "סיסמת אפליקציה" כאן מימין.
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    minHeight: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: "20px",
  },
  container: {
    display: "flex",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "900px",
    width: "100%",
    overflow: "hidden",
    direction: "rtl",
  },
  formSection: { flex: 1, padding: "40px", borderLeft: "1px solid #eee" },
  guideSection: { flex: 0.8, padding: "40px", backgroundColor: "#fafbfc" },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2d3436",
    margin: "0 0 10px 0",
  },
  subtitle: { fontSize: "14px", color: "#636e72", marginBottom: "30px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#2d3436" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #dfe6e9",
    fontSize: "16px",
    outline: "none",
  },
  inputReadOnly: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #dfe6e9",
    backgroundColor: "#f1f2f6",
    color: "#747d8c",
  },
  row: { display: "flex", gap: "15px" },
  checkboxWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  checkboxLabel: { fontSize: "14px", color: "#2d3436", cursor: "pointer" },
  button: {
    padding: "14px",
    backgroundColor: "#00b894",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
  },
  buttonDisabled: {
    padding: "14px",
    backgroundColor: "#b2bec3",
    borderRadius: "8px",
    border: "none",
    marginTop: "10px",
  },
  error: {
    color: "#d63031",
    fontSize: "14px",
    backgroundColor: "#fff5f5",
    padding: "10px",
    borderRadius: "6px",
  },
  success: {
    color: "#00b894",
    fontSize: "14px",
    backgroundColor: "#f0fff4",
    padding: "10px",
    borderRadius: "6px",
  },
  guideTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#2d3436",
  },
  guideStep: {
    display: "flex",
    gap: "12px",
    marginBottom: "15px",
    alignItems: "flex-start",
  },
  stepNumber: {
    backgroundColor: "#0984e3",
    color: "#fff",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "bold",
    flexShrink: 0,
  },
  infoBox: {
    marginTop: "30px",
    padding: "15px",
    backgroundColor: "#e1f5fe",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#0277bd",
    lineHeight: "1.5",
  },
  infoIcon: { fontSize: "18px", marginLeft: "8px" },
};

export default EmailSettingsPage;
