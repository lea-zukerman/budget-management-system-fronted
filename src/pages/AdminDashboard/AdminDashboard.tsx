import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface DefaultCategory {
  id: number;
  name: string;
  description: string;
}

const AdminDashboard: React.FC = () => {
  const [categories, setCategories] = useState<DefaultCategory[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/Admin/get-all-defaults");
      setCategories(res.data);
    } catch (err) {
      console.error("שגיאה בטעינה", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!newName) return;
    await api.post("/Admin/add-default-category", {
      name: newName,
      description: "default",
    });
    setNewName("");
    fetchCategories();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("למחוק קטגוריה זו לכל המשתמשים העתידיים?")) {
      try {
        await api.delete(`/Admin/delete-default-category/${id}`);
        fetchCategories();
      } catch (err) {
        alert("שגיאה במחיקה");
      }
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/Admin/update-default-category/${id}`, { name: editName });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      alert("שגיאה בעדכון");
    }
  };

  return (
    <div style={{ padding: "40px", direction: "rtl" }}>
      <h1>🛠️ ניהול קטגוריות מערכת (Admin)</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="שם קטגוריה חדשה"
          style={{ padding: "8px", marginLeft: "10px" }}
        />
        <button onClick={handleAdd} style={{ padding: "8px 16px" }}>
          הוסף
        </button>
      </div>

      <table
        border={1}
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "right",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "12px" }}>שם קטגוריה</th>
            <th style={{ padding: "12px" }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td style={{ padding: "12px" }}>
                {editingId === cat.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ padding: "5px", width: "80%" }}
                  />
                ) : (
                  cat.name
                )}
              </td>
              <td style={{ padding: "12px" }}>
                {editingId === cat.id ? (
                  <button
                    onClick={() => handleUpdate(cat.id)}
                    style={{ marginLeft: "10px" }}
                  >
                    שמור
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditName(cat.name);
                    }}
                    style={{ marginLeft: "10px" }}
                  >
                    ערוך
                  </button>
                )}
                <button
                  onClick={() => handleDelete(cat.id)}
                  style={{
                    color: "white",
                    backgroundColor: "#ff4d4d",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  מחק
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
