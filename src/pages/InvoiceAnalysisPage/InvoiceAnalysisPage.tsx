import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAppSelector } from "../../redux";
import { formatDate } from "../../utils/date.utils";

interface Invoice {
  id: number;
  userId: number;
  vendorName: string;
  totalAmount: number;
  vatId: string;
  invoiceDate: string;
  invoiceFilePath: string;
  requiresManualMapping: boolean;
}

const InvoiceAnalysisPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Invoice>>({});

  useEffect(() => {
    fetchInvoices();
  }, [user?.id]);

  useEffect(() => {
    const filtered = invoices.filter((inv) =>
      inv.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredInvoices(filtered);
  }, [searchTerm, invoices]);

  const fetchInvoices = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/Invoices/user/${user.id}`);
      setInvoices(res.data);
    } catch (err) {
      console.error("Error fetching invoices", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("למחוק את החשבונית הזו?")) return;
    try {
      await api.delete(`/Invoices/${id}`);
      setInvoices(invoices.filter((inv) => inv.id !== id));
    } catch (err) {
      alert("שגיאה במחיקה");
    }
  };

  const handleEditClick = (inv: Invoice) => {
    setEditingId(inv.id);
    setEditFormData(inv);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/Invoices/${editingId}`, editFormData);
      setInvoices(
        invoices.map((inv) =>
          inv.id === editingId ? { ...inv, ...editFormData } : inv,
        ),
      );
      setEditingId(null);
    } catch (err) {
      alert("שגיאה בעדכון");
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
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          color: "#2c3e50",
          borderBottom: "2px solid #3498db",
          paddingBottom: "10px",
        }}
      >
        ניתוח חשבוניות והוצאות
      </h2>

      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        <input
          type="text"
          placeholder="חפש לפי ספק..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "16px",
          }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
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
              <th style={{ padding: "12px", textAlign: "right" }}>סכום</th>
              <th style={{ padding: "12px", textAlign: "center" }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: "1px solid #eee" }}>
                {editingId === inv.id ? (
                  <>
                    <td>
                      <input
                        type="date"
                        value={editFormData.invoiceDate?.split("T")[0]}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            invoiceDate: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editFormData.vendorName}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            vendorName: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editFormData.totalAmount}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            totalAmount: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          marginLeft: "5px",
                          color: "green",
                          border: "1px solid green",
                          background: "none",
                          cursor: "pointer",
                        }}
                      >
                        שמור
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          color: "gray",
                          border: "1px solid gray",
                          background: "none",
                          cursor: "pointer",
                        }}
                      >
                        ביטול
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: "12px" }}>
                      <td>{formatDate(inv.invoiceDate)}</td>
                      {/* {new Date(inv.invoiceDate).toLocaleDateString("he-IL")} */}
                    </td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {inv.vendorName}
                    </td>
                    <td style={{ padding: "12px" }}>
                      ₪{inv.totalAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => handleEditClick(inv)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#f39c12",
                          cursor: "pointer",
                          marginLeft: "15px",
                        }}
                      >
                        ערוך
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#e74c3c",
                          cursor: "pointer",
                          marginLeft: "15px",
                        }}
                      >
                        מחק
                      </button>
                      {inv.invoiceFilePath && (
                        <a
                          href={`https://localhost:7294/api/invoices/download/${inv.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "12px",
                            color: "#3498db",
                            textDecoration: "underline",
                          }}
                        >
                          צפה בקובץ
                        </a>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceAnalysisPage;
