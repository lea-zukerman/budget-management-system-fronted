import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../redux";
import { expenseService, Expense } from "../../services/expenseService";
import { categoryService, CategoryDto } from "../../services/categoryService";

interface VendorItem {
  vendorName: string;
  categoryId?: number;
  categoryName?: string;
  expenseIds: number[];
}

const SuppliersPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingVendor, setEditingVendor] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError("");
      try {
        const [expRes, catRes] = await Promise.all([
          expenseService.getUserExpenses(user.id),
          categoryService.getByUserId(user.id),
        ]);
        setExpenses(expRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת ספקים וקטגוריות");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const vendors = useMemo<VendorItem[]>(() => {
    const map = new Map<string, VendorItem>();
    expenses.forEach((exp) => {
      const vendor = exp.vendorName?.trim() || "ללא ספק";
      const existing = map.get(vendor);
      const categoryName = exp.categoryName || "ללא קטגוריה";
      const categoryId = exp.categoryId;

      if (!existing) {
        map.set(vendor, {
          vendorName: vendor,
          categoryId,
          categoryName,
          expenseIds: [exp.id],
        });
      } else {
        existing.expenseIds.push(exp.id);
        if (!existing.categoryId && categoryId) {
          existing.categoryId = categoryId;
          existing.categoryName = categoryName;
        }
      }
    });
    return Array.from(map.values());
  }, [expenses]);

  const filteredVendors = useMemo<VendorItem[]>(() => {
    return vendors
      .filter((vendor) =>
        vendor.vendorName
          .toLowerCase()
          .includes(vendorSearch.trim().toLowerCase()),
      )
      .filter((vendor) =>
        categoryFilter === "" ? true : vendor.categoryId === categoryFilter,
      );
  }, [vendors, vendorSearch, categoryFilter]);

  const startEdit = (vendor: VendorItem) => {
    setEditingVendor(vendor.vendorName);
    setSelectedCategoryId(vendor.categoryId ?? "");
  };

  const cancelEdit = () => {
    setEditingVendor("");
    setSelectedCategoryId("");
  };

  const saveVendorCategory = async (vendor: VendorItem) => {
    if (selectedCategoryId === "" || !vendor.expenseIds.length) return;

    setSaving(true);
    setError("");

    try {
      const updatedExpenses = await Promise.all(
        vendor.expenseIds.map((expenseId) =>
          expenseService.updateExpense(expenseId, {
            categoryId: selectedCategoryId as number,
          }),
        ),
      );

      const newExpenseIdSet = new Set(vendor.expenseIds);
      setExpenses((prev) =>
        prev.map((exp) => {
          if (newExpenseIdSet.has(exp.id)) {
            const newCat = categories.find((c) => c.id === selectedCategoryId);
            return {
              ...exp,
              categoryId: selectedCategoryId as number,
              categoryName: newCat?.name ?? newCat?.Name ?? exp.categoryName,
            };
          }
          return exp;
        }),
      );

      setEditingVendor("");
      setSelectedCategoryId("");
    } catch (err) {
      console.error(err);
      setError("שגיאה בעדכון קטגוריית ספק");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>טוען ספקים...</div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        direction: "rtl",
        maxWidth: "1100px",
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
        ניהול ספקים
      </h2>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="חיפוש לפי שם ספק..."
          value={vendorSearch}
          onChange={(e) => setVendorSearch(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            flex: 1,
          }}
        />

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            minWidth: "220px",
          }}
        >
          <option value="">כל הקטגוריות</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name || cat.Name || "לא ידוע"}
            </option>
          ))}
        </select>
      </div>

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
            <th style={{ padding: "12px", textAlign: "right" }}>ספק</th>
            <th style={{ padding: "12px", textAlign: "right" }}>
              קטגוריה נוכחית
            </th>
            <th style={{ padding: "12px", textAlign: "right" }}>
              היקף רישומים
            </th>
            <th style={{ padding: "12px", textAlign: "center" }}>עריכה</th>
          </tr>
        </thead>
        <tbody>
          {filteredVendors.map((vendor) => {
            const isEditing = editingVendor === vendor.vendorName;

            return (
              <tr
                key={vendor.vendorName}
                style={{ borderBottom: "1px solid #eee" }}
              >
                <td style={{ padding: "12px" }}>{vendor.vendorName}</td>
                <td style={{ padding: "12px" }}>
                  {vendor.categoryName || "ללא קטגוריה"}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {vendor.expenseIds.length}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {isEditing ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      <select
                        value={selectedCategoryId}
                        onChange={(e) =>
                          setSelectedCategoryId(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        style={{
                          padding: "5px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      >
                        <option value="">בחר קטגוריה...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name || cat.Name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => saveVendorCategory(vendor)}
                        disabled={saving || selectedCategoryId === ""}
                        style={{
                          padding: "6px 10px",
                          background: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                        }}
                      >
                        שמור
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        style={{
                          padding: "6px 10px",
                          background: "#ccc",
                          color: "#333",
                          border: "none",
                          borderRadius: "4px",
                        }}
                      >
                        ביטול
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(vendor)}
                      style={{
                        padding: "6px 10px",
                        background: "#ffc107",
                        color: "#000",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      ערוך קטגוריה
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {filteredVendors.length === 0 && (
            <tr>
              <td
                colSpan={4}
                style={{ padding: "20px", textAlign: "center", color: "#666" }}
              >
                לא נמצאו ספקים
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SuppliersPage;
