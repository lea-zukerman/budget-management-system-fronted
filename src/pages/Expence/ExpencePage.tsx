import React, { useEffect, useState } from "react";
import {
  expenseService,
  Expense,
  Category,
} from "../../services/expenseService";
import { useAppSelector } from "../../redux";

const InvoiceAnalysisPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  // States לניהול המידע
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // States לניהול עריכה
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    loadInitialData();
  }, [user?.id]);

  // סינון הוצאות לפי חיפוש
  useEffect(() => {
    const filtered = expenses.filter(
      (exp) =>
        exp.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.userNote?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredExpenses(filtered);
  }, [searchTerm, expenses]);

  const loadInitialData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [expRes, catRes] = await Promise.all([
        expenseService.getUserExpenses(user.id),
        expenseService.getCategories(),
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("שגיאה בטעינת נתונים", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (exp: Expense) => {
    setEditingId(exp.id);
    setSelectedCategoryId(exp.categoryId); // מאתחל את הבחירה בערך הנוכחי
  };

  const handleSaveEdit = async () => {
    if (!editingId || selectedCategoryId === undefined) return;

    const selectedCategoryIdValue = selectedCategoryId; // שמירת ערך נטרל צמצום טייפ אחרי await
    if (selectedCategoryIdValue === undefined) return;

    try {
      // עדכון בשרת (מעדכן רק קטגוריה לפי הלוגיקה שלך)
      await expenseService.updateExpenseCategory(
        editingId,
        selectedCategoryIdValue,
      );

      // מציאת שם הקטגוריה החדש לעדכון ה-UI
      const newCategoryName = categories.find(
        (c) => c.id === selectedCategoryId,
      )?.name;

      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === editingId
            ? {
                ...exp,
                categoryId: selectedCategoryId,
                categoryName: newCategoryName,
              }
            : exp,
        ),
      );
      setEditingId(null);
    } catch (err) {
      alert("שגיאה בעדכון הקטגוריה");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("למחוק את ההוצאה הזו?")) return;
    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      alert("שגיאה במחיקה");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        טוען נתונים...
      </div>
    );

  return (
    <div
      style={{
        padding: "20px",
        direction: "rtl",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          color: "#2c3e50",
          borderBottom: "2px solid #27ae60",
          paddingBottom: "10px",
        }}
      >
        {" "}
        ניתוח הוצאות{" "}
      </h2>

      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        <input
          type="text"
          placeholder="חפש לפי ספק, קטגוריה או הערה..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <th style={{ padding: "12px", textAlign: "right" }}>תאריך</th>
              <th style={{ padding: "12px", textAlign: "right" }}>ספק</th>
              <th style={{ padding: "12px", textAlign: "right" }}>קטגוריה</th>
              <th style={{ padding: "12px", textAlign: "right" }}>סכום</th>
              <th style={{ padding: "12px", textAlign: "right" }}>הערות</th>
              <th style={{ padding: "12px", textAlign: "center" }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((exp) => (
              <tr key={exp.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px" }}>
                  {new Date(exp.transactionDate).toLocaleDateString("he-IL")}
                </td>
                <td style={{ padding: "12px", fontWeight: "bold" }}>
                  {exp.vendorName || "הוצאה ידנית"}
                </td>

                <td style={{ padding: "12px" }}>
                  {editingId === exp.id ? (
                    /* במצב עריכה: מוצג Select בלבד */
                    <select
                      value={selectedCategoryId}
                      onChange={(e) =>
                        setSelectedCategoryId(Number(e.target.value))
                      }
                      style={{
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #27ae60",
                      }}
                    >
                      <option value="">בחר קטגוריה...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    /* במצב תצוגה: מוצג Badge */
                    <span
                      style={{
                        backgroundColor: "#dff9fb",
                        padding: "4px 8px",
                        borderRadius: "10px",
                        fontSize: "13px",
                      }}
                    >
                      {exp.categoryName || "ללא קטגוריה"}
                    </span>
                  )}
                </td>

                <td style={{ padding: "12px" }}>
                  ₪{exp.finalAmount.toLocaleString()}
                </td>
                <td style={{ padding: "12px", color: "#666" }}>
                  {exp.userNote}
                </td>

                <td style={{ padding: "12px", textAlign: "center" }}>
                  {editingId === exp.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          color: "green",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "bold",
                          marginLeft: "10px",
                        }}
                      >
                        {" "}
                        שמור{" "}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          color: "gray",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {" "}
                        ביטול{" "}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(exp)}
                        style={{
                          color: "#f39c12",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          marginLeft: "10px",
                        }}
                      >
                        {" "}
                        ערוך{" "}
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        style={{
                          color: "#e74c3c",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {" "}
                        מחק{" "}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceAnalysisPage;
