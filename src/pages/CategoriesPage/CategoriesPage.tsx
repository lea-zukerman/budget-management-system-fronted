import React, { useEffect, useState } from "react";
import { categoryService, CategoryDto } from "../../services/categoryService";
import { useAppSelector } from "../../redux";
import { Link } from "react-router-dom";
import styles from "./CategoriesPage.module.css";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // סוגי State חדשים למודאל השגיאה
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  const loading = useAppSelector((state) => state.auth.loading);
  const user = useAppSelector((state) => state.auth.user);

  const normalizeCategory = (cat: any): CategoryDto => ({
    id: cat.id ?? cat.Id ?? 0,
    Name: cat.Name ?? cat.name ?? "",
    ColorHex: cat.ColorHex ?? cat.colorHex ?? "#4A90E2",
    UserId: cat.UserId ?? cat.userId ?? user?.id ?? 0,
  });

  const loadCategories = async () => {
    setError("");
    setMessage("");

    if (!user?.id) {
      setError("לא נמצא משתמש מחובר.");
      return;
    }

    try {
      const response = await categoryService.getByUserId(user.id);
      const normalized = response.data.map(normalizeCategory);
      setCategories(normalized);
    } catch (err: any) {
      setError("לא ניתן להביא את רשימת הקטגוריות.");
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadCategories();
    }
    const savedName = localStorage.getItem("categories.form.name");
    const savedId = localStorage.getItem("categories.form.id");
    if (savedName) setCategoryName(savedName);
    if (savedId) setSelectedId(Number(savedId));
  }, [user?.id]);

  const persistForm = (name: string, id: number | null) => {
    localStorage.setItem("categories.form.name", name);
    localStorage.setItem("categories.form.id", id ? id.toString() : "");
  };

  const resetForm = () => {
    setCategoryName("");
    setSelectedId(null);
    setMessage("");
    setError("");
    persistForm("", null);
  };

  const onAddUpdate = async () => {
    if (!categoryName.trim()) {
      setError("השם לא יכול להיות ריק.");
      return;
    }

    const DEFAULT_COLOR = "#4A90E2";

    try {
      if (!user?.id) return;

      const categoryData = {
        Name: categoryName,
        UserId: user.id,
        ColorHex: DEFAULT_COLOR,
      };

      if (selectedId) {
        await categoryService.update(selectedId, categoryData);
        setMessage("הקטגוריה עודכנה בהצלחה.");
      } else {
        await categoryService.add(categoryData);
        setMessage("הקטגוריה נוספה בהצלחה.");
      }
      resetForm();
      await loadCategories();
    } catch (err: any) {
      setError(
        `שגיאה בשמירת הקטגוריה: ${err?.response?.data?.error || "לא ידוע"}`,
      );
    }
  };

  const getCategoryId = (cat: CategoryDto) => cat.id ?? (cat as any).Id ?? 0;
  const getCategoryName = (cat: CategoryDto) =>
    cat.Name || (cat as any).Name || (cat as any).name || "";

  const onEdit = (cat: CategoryDto) => {
    const catId = getCategoryId(cat);
    const catName = getCategoryName(cat);
    setSelectedId(catId);
    setCategoryName(catName);
    persistForm(catName, catId);
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("האם למחוק את הקטגוריה?")) return;
    try {
      await categoryService.delete(id);
      setMessage("הקטגוריה נמחקה בהצלחה.");
      await loadCategories();
    } catch (err: any) {
      // כאן אנחנו תופסים את ה-Exception מה-C#
      const apiError =
        err.response?.data?.error || "קיימת בעיה במחיקת הקטגוריה.";
      setModalErrorMessage(apiError);
      setShowErrorModal(true);
    }
  };

  return (
    <div className={styles.container}>
      <h1>ניהול קטגוריות</h1>
      <div className={styles.breadcrumbs}>
        <Link to="/dashboard">דשבורד</Link> / קטגוריות
      </div>

      <div className={styles.formCard}>
        <input
          type="text"
          placeholder="הכנס שם קטגוריה..."
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          disabled={loading}
        />
        <button onClick={onAddUpdate} disabled={loading}>
          {selectedId ? "עדכן קטגוריה" : "הוסף קטגוריה"}
        </button>
        {selectedId && (
          <button
            className={styles.cancel}
            onClick={resetForm}
            disabled={loading}
          >
            בטל עריכה
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.success}>{message}</p>}

      <ul className={styles.list}>
        {categories.map((cat) => {
          const catId = getCategoryId(cat);
          const catName = getCategoryName(cat);
          return (
            <li key={catId} className={styles.item}>
              <span>{catName}</span>
              <div className={styles.actions}>
                <button onClick={() => onEdit(cat)} disabled={loading}>
                  ערוך
                </button>
                <button onClick={() => onDelete(catId)} disabled={loading}>
                  מחק
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* --- מודאל שגיאה בסגנון GMAIL --- */}
      {showErrorModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            direction: "rtl",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              width: "420px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
              overflow: "hidden",
              fontFamily: "sans-serif",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #eee",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: "#1a73e8",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "18px" }}>ℹ️</span> הודעת מערכת
              </span>
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#5f6368",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "24px 20px" }}>
              <div
                style={{
                  backgroundColor: "#e8f0fe",
                  padding: "15px",
                  borderRadius: "6px",
                  border: "1px solid #d2e3fc",
                  color: "#1967d2",
                  fontSize: "14px",
                  marginBottom: "15px",
                  lineHeight: "1.5",
                }}
              >
                <strong>לא ניתן לבצע את הפעולה:</strong>
                <br />
                {modalErrorMessage}
              </div>
              <p style={{ fontSize: "13px", color: "#5f6368", margin: 0 }}>
                כדי לשמור על סדר בנתונים, לא ניתן למחוק קטגוריה המקושרת להוצאות
                קיימות או לחוקי זיהוי ספקים.
              </p>
            </div>

            <div
              style={{
                padding: "12px 20px",
                textAlign: "left",
                borderTop: "1px solid #eee",
              }}
            >
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  backgroundColor: "#1a73e8",
                  color: "#fff",
                  border: "none",
                  padding: "8px 24px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              >
                הבנתי
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
