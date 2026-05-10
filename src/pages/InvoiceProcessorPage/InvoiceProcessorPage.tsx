import React, { useEffect, useState } from "react";
import { invoiceService } from "../../services/invoiceService";
import { categoryService, CategoryDto } from "../../services/categoryService";
import { useAppSelector } from "../../redux";

interface InvoiceDto {
  id: number;
  amount: number;
  date: string;
  vendor: string;
  aiSaggeted?: string;
  categoryId?: number | null;
}

const InvoiceProcessorPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedInvoice, setParsedInvoice] = useState<InvoiceDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string>(
    "",
  );
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const loading = useAppSelector((state) => state.auth.loading);
  const user = useAppSelector((state) => state.auth.user);

  // טעינת קטגוריות בעליית הדף או בשינוי משתמש
  useEffect(() => {
    if (user?.id) {
      console.log("Fetching categories for user:", user.id);
      categoryService
        .getByUserId(user.id)
        .then((res: any) => {
          // וידוא שליפת הנתונים ללא קשר למבנה ה-Axios Response
          const rawData = res.data || res;
          console.log("Data received from server:", rawData);

          if (Array.isArray(rawData)) {
            setCategories(rawData);
          }
        })
        .catch((err) => {
          console.error("שגיאה בטעינת קטגוריות:", err);
        });
    }
  }, [user?.id]);

  const onUpload = async () => {
    if (!selectedFile || !user?.id) {
      setError("נא לבחור קובץ להעלאה.");
      return;
    }
    setParsedInvoice(null);
    setSelectedCategoryId("");
    setMessage("");
    setError("");

    try {
      const response = await invoiceService.uploadInvoice(
        selectedFile,
        user.id,
      );
      const srv = response.data;

      const newInvoice: InvoiceDto = {
        id: srv.id || srv.invoiceId || 0,
        amount: srv.totalAmount,
        date: srv.invoiceDate,
        vendor: srv.vendorName,
        aiSaggeted: srv.aiSuggestedCategory,
        categoryId:
          srv.categoryId && srv.categoryId > 0 ? srv.categoryId : null,
      };

      setParsedInvoice(newInvoice);

      // אם ה-AI זיהה קטגוריה קיימת, נבחר אותה אוטומטית ב-Select
      if (newInvoice.categoryId) {
        setMessage("ה-AI זיהה קטגוריה קיימת בהצלחה!");
        setSelectedCategoryId(newInvoice.categoryId);
      }
    } catch (err) {
      setError("לא הצלחנו לפענח את החשבונית. נסו קובץ אחר.");
    }
  };

  const handleAddAiCategory = async () => {
    if (!parsedInvoice?.aiSaggeted || !user?.id) return;
    try {
      const newCat = await categoryService.add({
        Name: parsedInvoice.aiSaggeted,
        ColorHex: "#00b894",
        UserId: user.id,
      });

      const createdCategory = newCat.data || newCat;
      setCategories([...categories, createdCategory]);
      setSelectedCategoryId(createdCategory.id);
      setMessage("הקטגוריה החדשה נוספה וסווגה!");
    } catch (err) {
      setError("שגיאה בהוספת קטגוריה.");
    }
  };

  const onConfirm = async () => {
    if (!parsedInvoice || !selectedCategoryId || !user?.id) return;
    try {
      await invoiceService.confirmInvoice(
        parsedInvoice.id,
        Number(selectedCategoryId),
        user.id,
      );
      setMessage("ההוצאה נשמרה בהצלחה בתקציב!");
      setParsedInvoice(null);
      setSelectedFile(null);
      setSelectedCategoryId("");
    } catch (err) {
      setError("שגיאה בשמירת הנתונים.");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>מעבד חשבוניות חכם</h1>
          <p style={styles.subtitle}>
            העלו חשבונית וה-AI שלנו יחלץ את הנתונים עבורכם
          </p>
        </header>

        {/* תיבת העלאה */}
        <div style={styles.uploadBox}>
          <div style={styles.fileInputWrapper}>
            <input
              type="file"
              id="file-upload"
              style={styles.hiddenInput}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="file-upload" style={styles.fileLabel}>
              {selectedFile
                ? `📂 ${selectedFile.name}`
                : "לחצו לבחירת קובץ או גררו לכאן"}
            </label>
          </div>

          <button
            onClick={onUpload}
            disabled={loading || !selectedFile}
            style={
              selectedFile && !loading
                ? styles.primaryButton
                : styles.disabledButton
            }
          >
            {loading ? "מנתח נתונים ב-AI..." : "התחל פענוח"}
          </button>
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}
        {message && <div style={styles.successBanner}>{message}</div>}

        {/* כרטיס תוצאות */}
        {parsedInvoice && (
          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <h3>תוצאות סריקה</h3>
              <span style={styles.badge}>זוהה בהצלחה</span>
            </div>

            <div style={styles.dataGrid}>
              <div style={styles.dataItem}>
                <label>ספק</label>
                <span>{parsedInvoice.vendor}</span>
              </div>
              <div style={styles.dataItem}>
                <label>סכום</label>
                <span style={styles.amount}>{parsedInvoice.amount} ₪</span>
              </div>
              <div style={styles.dataItem}>
                <label>תאריך</label>
                <span>{parsedInvoice.date}</span>
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.categorySelection}>
              <label style={styles.labelBold}>סיווג קטגוריה:</label>

              {/* הצעה להוספת קטגוריה חדשה אם ה-AI הציע משהו שלא קיים */}
              {parsedInvoice.aiSaggeted && !parsedInvoice.categoryId && (
                <div style={styles.aiSuggestionBox}>
                  <p>
                    הצעה מה-AI: <strong>{parsedInvoice.aiSaggeted}</strong>
                  </p>
                  <button
                    onClick={handleAddAiCategory}
                    style={styles.linkButton}
                  >
                    + הוסף לקטגוריות שלי
                  </button>
                </div>
              )}

              {/* רשימת בחירה - שימוש ב-cat.name באות קטנה כפי שחוזר מהשרת */}
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                style={styles.select}
              >
                <option value="">-- בחרו מהרשימה --</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name || cat.Name}
                  </option>
                ))}
              </select>

              <button
                onClick={onConfirm}
                disabled={!selectedCategoryId}
                style={
                  selectedCategoryId
                    ? styles.confirmButton
                    : styles.disabledButton
                }
              >
                אשר ושמור הוצאה
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "40px 20px",
    direction: "rtl",
  },
  container: { maxWidth: "700px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "32px", color: "#1a1a1a", marginBottom: "10px" },
  subtitle: { color: "#636e72", fontSize: "16px" },
  uploadBox: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fileInputWrapper: {
    border: "2px dashed #dfe6e9",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    cursor: "pointer",
  },
  hiddenInput: { display: "none" },
  fileLabel: {
    cursor: "pointer",
    color: "#0984e3",
    fontWeight: "600",
    display: "block",
  },
  primaryButton: {
    padding: "14px",
    backgroundColor: "#0984e3",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "16px",
  },
  disabledButton: {
    padding: "14px",
    backgroundColor: "#b2bec3",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "not-allowed",
  },
  errorBanner: {
    backgroundColor: "#fff5f5",
    color: "#d63031",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    textAlign: "center",
  },
  successBanner: {
    backgroundColor: "#f0fff4",
    color: "#00b894",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    textAlign: "center",
    fontWeight: "bold",
  },
  resultCard: {
    backgroundColor: "#fff",
    marginTop: "30px",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  badge: {
    backgroundColor: "#e1f5fe",
    color: "#0288d1",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  dataGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
  },
  dataItem: { display: "flex", flexDirection: "column", gap: "5px" },
  amount: { fontSize: "20px", fontWeight: "bold", color: "#2d3436" },
  divider: { height: "1px", backgroundColor: "#eee", margin: "25px 0" },
  categorySelection: { display: "flex", flexDirection: "column", gap: "15px" },
  labelBold: { fontWeight: "bold", marginBottom: "5px" },
  aiSuggestionBox: {
    backgroundColor: "#f0f8ff",
    padding: "12px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #74b9ff",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#0984e3",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  },
  select: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #dfe6e9",
    fontSize: "16px",
    backgroundColor: "#fff",
  },
  confirmButton: {
    padding: "14px",
    backgroundColor: "#00b894",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default InvoiceProcessorPage;
