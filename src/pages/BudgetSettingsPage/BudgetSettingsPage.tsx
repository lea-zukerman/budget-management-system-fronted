import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../redux";
import { categoryService, CategoryDto } from "../../services/categoryService";
import { userService } from "../../services/userService";
import api from "../../services/api";

const BudgetSettingsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [existingBudgets, setExistingBudgets] = useState<any[]>([]);
  const [monthlySalary, setMonthlySalary] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [categoryPercentages, setCategoryPercentages] = useState<{
    [key: number]: number;
  }>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // State חדש לניהול השורה המורחבת (פירוט חודשי)
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
    null,
  );
  // State לניהול ערכים זמניים של חודשים בעת עריכה פרטנית
  const [tempMonthlyValues, setTempMonthlyValues] = useState<{
    [budgetId: number]: number;
  }>({});

  // 1. טעינת נתונים ראשונית
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.id) return;
      try {
        const userRes = await userService.getById(user.id);
        setMonthlySalary(userRes.data.monthlyIncome ?? 0);

        const catRes = await categoryService.getByUserId(user.id);
        setCategories(catRes.data);

        await loadYearlyBudgets();
      } catch (err) {
        setError("שגיאה בטעינת נתונים ראשונית.");
      }
    };
    fetchInitialData();
  }, [user?.id]);

  // 2. שליפת תקציבים קיימים
  const loadYearlyBudgets = async () => {
    if (!user?.id) return;
    try {
      const res = await categoryService.getMonthlyBudgets();
      const filtered = res.data.filter(
        (b: any) =>
          (b.userId === user.id || b.UserId === user.id) &&
          (b.year === selectedYear || b.Year === selectedYear),
      );
      setExistingBudgets(filtered);

      const percentages: { [key: number]: number } = {};
      filtered.forEach((b: any) => {
        const catId = b.categoryId ?? b.CategoryId;
        const limit = b.budgetLimit ?? b.BudgetLimit;
        if (catId) percentages[catId] = limit;
      });
      setCategoryPercentages((prev) => ({ ...prev, ...percentages }));
    } catch (err) {
      console.error("לא הצלחתי לטעון תקציבים קיימים");
    }
  };

  useEffect(() => {
    loadYearlyBudgets();
  }, [selectedYear]);

  // 3. יצירת DTO
  const createBudgetDto = (
    cat: CategoryDto,
    month: number,
    percentage: number,
    salary: number,
    forceNew: boolean = false,
  ) => {
    const calculatedAmt = Number(((salary * percentage) / 100).toFixed(2));
    const catName = (cat as any).name || (cat as any).Name;

    const existingRecord = forceNew
      ? null
      : existingBudgets.find(
          (b) =>
            (b.categoryId === cat.id || b.CategoryId === cat.id) &&
            (b.month === month || b.Month === month),
        );

    return {
      Id: existingRecord ? existingRecord.id || existingRecord.Id : 0,
      UserId: user?.id ?? 0,
      CategoryId: cat.id,
      CategoryName: catName,
      BudgetLimit: percentage,
      CalculatedAmount: calculatedAmt,
      TotalSpentSoFar: existingRecord
        ? (existingRecord.totalSpentSoFar ??
          existingRecord.TotalSpentSoFar ??
          0)
        : 0,
      Month: month,
      Year: selectedYear,
    };
  };

  // 4. פונקציות עדכון
  const handleUpdateSalary = async () => {
    if (!user?.id) return;
    setIsUpdating(true);
    try {
      await userService.updateMonthlySettings(user.id, {
        monthlyIncome: monthlySalary,
      } as any);
      setMessage("השכר עודכן בהצלחה!");
    } catch (err) {
      setError("שגיאה בעדכון השכר.");
    } finally {
      setIsUpdating(false);
    }
  };

  const postSingleCategoryYearly = async (cat: CategoryDto) => {
    if (!user?.id) return;
    setIsUpdating(true);
    setMessage("");
    try {
      const percentage = categoryPercentages[cat.id] || 0;
      for (let month = 1; month <= 12; month++) {
        const dto = createBudgetDto(
          cat,
          month,
          percentage,
          monthlySalary,
          true,
        );
        await categoryService.addMonthlyBudget(dto);
      }
      setMessage(
        `התקציב ל"${cat.name || (cat as any).Name}" הופץ כחדש לכל השנה.`,
      );
      await loadYearlyBudgets();
    } catch (err) {
      setError("שגיאה בהפצת תקציב חדש.");
    } finally {
      setIsUpdating(false);
    }
  };

  const putSingleCategoryYearly = async (cat: CategoryDto) => {
    if (!user?.id) return;
    setIsUpdating(true);
    setMessage("");
    try {
      const percentage = categoryPercentages[cat.id] || 0;
      for (let month = 1; month <= 12; month++) {
        const dto = createBudgetDto(cat, month, percentage, monthlySalary);
        dto.Id > 0
          ? await categoryService.updateMonthlyBudget(dto)
          : await categoryService.addMonthlyBudget(dto);
      }
      setMessage(`התקציב ל"${cat.name || (cat as any).Name}" עודכן בהצלחה.`);
      await loadYearlyBudgets();
    } catch (err) {
      setError("שגיאה בעדכון תקציב קיים.");
    } finally {
      setIsUpdating(false);
    }
  };

  // פונקציה חדשה: עדכון חודש בודד בלבד
  const updateSingleMonthOnly = async (
    budgetRecord: any,
    newPercentage: number,
  ) => {
    setIsUpdating(true);
    setMessage("");
    try {
      const calculatedAmt = Number(
        ((monthlySalary * newPercentage) / 100).toFixed(2),
      );
      const dto = {
        ...budgetRecord,
        Id: budgetRecord.id || budgetRecord.Id,
        BudgetLimit: newPercentage,
        CalculatedAmount: calculatedAmt,
        // וודוא שמות שדות תואמים ל-API
        CategoryId: budgetRecord.categoryId || budgetRecord.CategoryId,
        UserId: user?.id ?? budgetRecord.userId ?? budgetRecord.UserId ?? 0,
      };

      await categoryService.updateMonthlyBudget(dto);
      setMessage(`חודש ${dto.month || dto.Month} עודכן ל-${newPercentage}%`);
      await loadYearlyBudgets();
    } catch (err) {
      setError("שגיאה בעדכון חודש בודד.");
    } finally {
      setIsUpdating(false);
    }
  };

  const saveAllCategories = async () => {
    if (!user?.id) return;
    setIsUpdating(true);
    setMessage("");
    try {
      for (const cat of categories) {
        const percentage = categoryPercentages[cat.id] || 0;
        for (let month = 1; month <= 12; month++) {
          const dto = createBudgetDto(cat, month, percentage, monthlySalary);
          dto.Id > 0
            ? await categoryService.updateMonthlyBudget(dto)
            : await categoryService.addMonthlyBudget(dto);
        }
      }
      setMessage("כל הטבלה עודכנה והופצה בהצלחה!");
      await loadYearlyBudgets();
    } catch (err) {
      setError("שגיאה בעדכון הכללי.");
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPercentage = Object.values(categoryPercentages).reduce(
    (a, b) => a + b,
    0,
  );

  const getMonthName = (m: number) => {
    const names = [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ];
    return names[m - 1];
  };

  return (
    <div
      style={{
        padding: "2rem",
        direction: "rtl",
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "Segoe UI",
      }}
    >
      <h2
        style={{
          borderBottom: "2px solid #007bff",
          paddingBottom: "10px",
          color: "#333",
        }}
      >
        הגדרות תקציב שנתי
      </h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: "bold", display: "block" }}>
            שכר חודשי נטו (₪):
          </label>
          <input
            type="number"
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(Number(e.target.value))}
            style={{
              padding: "8px",
              width: "100%",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: "bold", display: "block" }}>
            שנת תקציב:
          </label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: "8px",
              width: "100%",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <button
          onClick={handleUpdateSalary}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          עדכן שכר
        </button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#007bff", color: "white" }}>
            <th style={{ padding: "12px", textAlign: "right" }}>קטגוריה</th>
            <th style={{ padding: "12px", textAlign: "right" }}>אחוז (%)</th>
            <th style={{ padding: "12px", textAlign: "right" }}>סכום מחושב</th>
            <th style={{ padding: "12px", textAlign: "center" }}>
              פעולות לשורה
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const isExpanded = expandedCategoryId === cat.id;
            const monthlyData = existingBudgets
              .filter((b) => b.categoryId === cat.id || b.CategoryId === cat.id)
              .sort((a, b) => (a.month || a.Month) - (b.month || b.Month));

            return (
              <React.Fragment key={cat.id}>
                <tr
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: isExpanded ? "#f1faff" : "transparent",
                  }}
                >
                  <td style={{ padding: "12px" }}>
                    {cat.name || (cat as any).Name}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <input
                      type="number"
                      value={categoryPercentages[cat.id] ?? 0}
                      onChange={(e) =>
                        setCategoryPercentages({
                          ...categoryPercentages,
                          [cat.id]: Number(e.target.value),
                        })
                      }
                      style={{ width: "60px", padding: "5px" }}
                    />{" "}
                    %
                  </td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    {(
                      (monthlySalary * (categoryPercentages[cat.id] || 0)) /
                      100
                    ).toLocaleString()}{" "}
                    ₪
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => postSingleCategoryYearly(cat)}
                      disabled={isUpdating}
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      הפץ שנה (חדש)
                    </button>
                    <button
                      onClick={() => putSingleCategoryYearly(cat)}
                      disabled={isUpdating}
                      style={{
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      עדכן שנה (קיים)
                    </button>
                    <button
                      onClick={() =>
                        setExpandedCategoryId(isExpanded ? null : cat.id)
                      }
                      style={{
                        backgroundColor: "#ffc107",
                        color: "#000",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {isExpanded ? "סגור פירוט" : "עריכה חודשית"}
                    </button>
                  </td>
                </tr>

                {/* שורת פירוט חודשי נפתחת */}
                {isExpanded && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "20px",
                        backgroundColor: "#f9f9f9",
                        borderBottom: "2px solid #bee5eb",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: "15px",
                        }}
                      >
                        {monthlyData.length > 0 ? (
                          monthlyData.map((m) => {
                            const mId = m.id || m.Id;
                            const currentVal =
                              tempMonthlyValues[mId] ??
                              (m.budgetLimit || m.BudgetLimit);
                            return (
                              <div
                                key={mId}
                                style={{
                                  padding: "10px",
                                  backgroundColor: "white",
                                  borderRadius: "6px",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                  border: "1px solid #ddd",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    marginBottom: "5px",
                                  }}
                                >
                                  {getMonthName(m.month || m.Month)}
                                </div>
                                <div style={{ display: "flex", gap: "5px" }}>
                                  <input
                                    type="number"
                                    value={currentVal}
                                    onChange={(e) =>
                                      setTempMonthlyValues({
                                        ...tempMonthlyValues,
                                        [mId]: Number(e.target.value),
                                      })
                                    }
                                    style={{
                                      width: "50px",
                                      fontSize: "12px",
                                      padding: "2px",
                                    }}
                                  />
                                  <span style={{ fontSize: "12px" }}>%</span>
                                  <button
                                    onClick={() =>
                                      updateSingleMonthOnly(m, currentVal)
                                    }
                                    disabled={isUpdating}
                                    style={{
                                      backgroundColor: "#28a745",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "3px",
                                      padding: "2px 8px",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                    }}
                                  >
                                    שמור
                                  </button>
                                </div>
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: "#666",
                                    marginTop: "4px",
                                  }}
                                >
                                  {(
                                    (monthlySalary * currentVal) /
                                    100
                                  ).toLocaleString()}{" "}
                                  ₪
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ textAlign: "center", color: "#666" }}>
                            יש להפיץ את התקציב לשנה זו כדי לראות פירוט חודשי.
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#e9ecef",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: "bold" }}>סה"כ: {totalPercentage}%</span>
        <span>נותר: {100 - totalPercentage}%</span>
      </div>

      <button
        onClick={saveAllCategories}
        disabled={isUpdating || totalPercentage > 100}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "15px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        שמור והפץ את כל הטבלה לשנת {selectedYear}
      </button>

      {message && (
        <div
          style={{
            marginTop: "20px",
            color: "green",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default BudgetSettingsPage;

// import React, { useEffect, useState } from "react";
// import { useAppSelector } from "../../store";
// import { categoryService, CategoryDto } from "../../services/categoryService";
// import { userService } from "../../services/userService";

// const BudgetSettingsPage: React.FC = () => {
//   const user = useAppSelector((state) => state.auth.user);
//   const [categories, setCategories] = useState<CategoryDto[]>([]);
//   const [monthlySalary, setMonthlySalary] = useState<number>(0);
//   const [selectedYear, setSelectedYear] = useState<number>(
//     new Date().getFullYear(),
//   );
//   const [categoryPercentages, setCategoryPercentages] = useState<{
//     [key: number]: number;
//   }>({});
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [isUpdating, setIsUpdating] = useState(false);

//   // 1. טעינת נתונים ראשונית (משתמש וקטגוריות)
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       if (!user?.id) return;
//       try {
//         // טעינת נתוני משתמש בשביל השכר
//         const userRes = await userService.getById(user.id);
//         const salary =
//           userRes.data.monthlyIncome ?? userRes.data.MonthlyIncome ?? 0;
//         setMonthlySalary(salary);

//         // טעינת קטגוריות והאחוזים שלהן
//         await loadCategories();
//       } catch (err) {
//         console.error("Error loading initial data:", err);
//         setError("שגיאה בטעינת הנתונים.");
//       }
//     };
//     fetchInitialData();
//   }, [user?.id]);

//   const loadCategories = async () => {
//     if (!user?.id) return;
//     try {
//       const res = await categoryService.getByUserId(user.id);
//       setCategories(res.data);

//       const percentages: { [key: number]: number } = {};
//       res.data.forEach((cat: any) => {
//         // וידוא שליפת האחוז גם אם השם מתחיל באות גדולה או קטנה
//         percentages[cat.id] = cat.budgetPercentage ?? cat.BudgetPercentage ?? 0;
//       });
//       setCategoryPercentages(percentages);
//     } catch (err) {
//       setError("לא ניתן להביא קטגוריות.");
//     }
//   };

//   // 2. עדכון שכר המשתמש ב-DB
//   const handleUpdateSalary = async () => {
//     if (!user?.id) return;
//     setIsUpdating(true);
//     setMessage("");
//     setError("");
//     try {
//       // הנחה שיש פונקציה כזו ב-userService. אם השם שונה, עדכן בהתאם.
//       await userService.updateMonthlySettings(user.id, {
//         monthlyIncome: monthlySalary,
//       } as any);
//       setMessage("השכר עודכן בהצלחה במערכת!");
//     } catch (err) {
//       setError("שגיאה בעדכון השכר.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handlePercentageChange = (catId: number, value: string) => {
//     setCategoryPercentages({ ...categoryPercentages, [catId]: Number(value) });
//   };

//   // --- פונקציות הפצה ועדכון (ללא שינוי לוגי, רק וידוא שמות) ---
//   const postSingleCategoryYearly = async (cat: CategoryDto) => {
//     if (!user?.id) return;
//     setIsUpdating(true);
//     setMessage("");
//     try {
//       const percentage = categoryPercentages[cat.id] || 0;
//       const calculatedAmt = (monthlySalary * percentage) / 100;
//       const catName = cat.name || (cat as any).Name || "קטגוריה";

//       for (let month = 1; month <= 12; month++) {
//         await categoryService.addMonthlyBudget({
//           UserId: user.id,
//           CategoryId: cat.id,
//           CategoryName: catName,
//           BudgetLimit: percentage,
//           CalculatedAmount: calculatedAmt,
//           TotalSpentSoFar: 0,
//           Month: month,
//           Year: selectedYear,
//         });
//       }
//       setMessage(`התקציב ל"${catName}" נוצר לכל חודשי שנת ${selectedYear}`);
//     } catch (err) {
//       setError("שגיאה ביצירת התקציב.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const putSingleCategoryYearly = async (cat: CategoryDto) => {
//     if (!user?.id) return;
//     setIsUpdating(true);
//     setMessage("");
//     try {
//       const percentage = categoryPercentages[cat.id] || 0;
//       const calculatedAmt = (monthlySalary * percentage) / 100;
//       const catName = cat.name || (cat as any).Name;

//       for (let month = 1; month <= 12; month++) {
//         await categoryService.updateMonthlyBudget({
//           UserId: user.id,
//           CategoryId: cat.id,
//           CategoryName: catName,
//           BudgetLimit: percentage,
//           CalculatedAmount: calculatedAmt,
//           TotalSpentSoFar: 0,
//           Month: month,
//           Year: selectedYear,
//         });
//       }
//       setMessage(`התקציב ל"${catName}" עודכן לכל חודשי שנת ${selectedYear}`);
//     } catch (err) {
//       setError("שגיאה בעדכון - וודא שהרשומה קיימת (השתמש ב'הפץ' אם לא)");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const saveAllCategories = async () => {
//     if (!user?.id) return;
//     setIsUpdating(true);
//     setMessage("");
//     try {
//       const allPromises: any[] = [];
//       categories.forEach((cat) => {
//         const percentage = categoryPercentages[cat.id] || 0;
//         const calculatedAmt = (monthlySalary * percentage) / 100;
//         const catName = cat.name || (cat as any).Name;

//         for (let month = 1; month <= 12; month++) {
//           allPromises.push(
//             categoryService.addMonthlyBudget({
//               UserId: user.id,
//               CategoryId: cat.id,
//               CategoryName: catName,
//               BudgetLimit: percentage,
//               CalculatedAmount: calculatedAmt,
//               TotalSpentSoFar: 0,
//               Month: month,
//               Year: selectedYear,
//             }),
//           );
//         }
//       });
//       await Promise.all(allPromises);
//       setMessage("כל הקטגוריות הופצו בהצלחה!");
//     } catch (err) {
//       setError("שגיאה בהפצה כללית.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const totalPercentage = Object.values(categoryPercentages).reduce(
//     (a, b) => a + b,
//     0,
//   );

//   return (
//     <div
//       style={{
//         padding: "2rem",
//         direction: "rtl",
//         maxWidth: "1000px",
//         margin: "0 auto",
//         fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
//       }}
//     >
//       <h2
//         style={{
//           borderBottom: "2px solid #007bff",
//           paddingBottom: "10px",
//           color: "#333",
//         }}
//       >
//         הגדרות תקציב שנתי
//       </h2>

//       {/* אזור הגדרות שכר ושנה */}
//       <div
//         style={{
//           display: "flex",
//           gap: "20px",
//           marginBottom: "30px",
//           backgroundColor: "#f8f9fa",
//           padding: "20px",
//           borderRadius: "8px",
//           alignItems: "flex-end",
//           boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//         }}
//       >
//         <div style={{ flex: 1 }}>
//           <label
//             style={{
//               fontWeight: "bold",
//               display: "block",
//               marginBottom: "5px",
//             }}
//           >
//             שכר חודשי נטו (₪):{" "}
//           </label>
//           <input
//             type="number"
//             value={monthlySalary}
//             onChange={(e) => setMonthlySalary(Number(e.target.value))}
//             style={{
//               padding: "8px",
//               width: "100%",
//               borderRadius: "4px",
//               border: "1px solid #ccc",
//             }}
//           />
//         </div>
//         <div style={{ flex: 1 }}>
//           <label
//             style={{
//               fontWeight: "bold",
//               display: "block",
//               marginBottom: "5px",
//             }}
//           >
//             שנת תקציב:{" "}
//           </label>
//           <input
//             type="number"
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(Number(e.target.value))}
//             style={{
//               padding: "8px",
//               width: "100%",
//               borderRadius: "4px",
//               border: "1px solid #ccc",
//             }}
//           />
//         </div>
//         <button
//           onClick={handleUpdateSalary}
//           disabled={isUpdating}
//           style={{
//             backgroundColor: "#6c757d",
//             color: "white",
//             border: "none",
//             padding: "10px 20px",
//             borderRadius: "4px",
//             cursor: "pointer",
//             fontWeight: "bold",
//           }}
//         >
//           עדכן שכר במערכת
//         </button>
//       </div>

//       {/* טבלת קטגוריות */}
//       <table
//         style={{
//           width: "100%",
//           borderCollapse: "collapse",
//           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           backgroundColor: "white",
//         }}
//       >
//         <thead>
//           <tr style={{ backgroundColor: "#007bff", color: "white" }}>
//             <th style={{ padding: "12px", textAlign: "right" }}>שם קטגוריה</th>
//             <th style={{ padding: "12px", textAlign: "right" }}>אחוז (%)</th>
//             <th style={{ padding: "12px", textAlign: "right" }}>
//               סכום חודשי מחושב
//             </th>
//             <th style={{ padding: "12px", textAlign: "center" }}>
//               פעולות מהירות לשורה
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {categories.map((cat) => (
//             <tr key={cat.id} style={{ borderBottom: "1px solid #ddd" }}>
//               <td style={{ padding: "12px" }}>
//                 {cat.name || (cat as any).Name}
//               </td>
//               <td style={{ padding: "12px" }}>
//                 <input
//                   type="number"
//                   value={categoryPercentages[cat.id] ?? 0}
//                   onChange={(e) =>
//                     handlePercentageChange(cat.id, e.target.value)
//                   }
//                   style={{
//                     width: "60px",
//                     padding: "5px",
//                     borderRadius: "4px",
//                     border: "1px solid #eee",
//                   }}
//                 />{" "}
//                 %
//               </td>
//               <td
//                 style={{
//                   padding: "12px",
//                   fontWeight: "bold",
//                   color: "#007bff",
//                 }}
//               >
//                 {(
//                   (monthlySalary * (categoryPercentages[cat.id] || 0)) /
//                   100
//                 ).toLocaleString()}{" "}
//                 ₪
//               </td>
//               <td
//                 style={{
//                   padding: "12px",
//                   textAlign: "center",
//                   display: "flex",
//                   gap: "10px",
//                   justifyContent: "center",
//                 }}
//               >
//                 <button
//                   onClick={() => postSingleCategoryYearly(cat)}
//                   disabled={isUpdating}
//                   title="יוצר רשומות חדשות ל-12 חודשים"
//                   style={{
//                     backgroundColor: "#28a745",
//                     color: "white",
//                     border: "none",
//                     padding: "6px 12px",
//                     borderRadius: "4px",
//                     cursor: "pointer",
//                     fontSize: "12px",
//                   }}
//                 >
//                   הפץ שנה (חדש)
//                 </button>
//                 <button
//                   onClick={() => putSingleCategoryYearly(cat)}
//                   disabled={isUpdating}
//                   title="מעדכן רשומות קיימות ב-12 חודשים"
//                   style={{
//                     backgroundColor: "#17a2b8",
//                     color: "white",
//                     border: "none",
//                     padding: "6px 12px",
//                     borderRadius: "4px",
//                     cursor: "pointer",
//                     fontSize: "12px",
//                   }}
//                 >
//                   עדכן שנה (קיים)
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* סיכום וכפתור גורף */}
//       <div
//         style={{
//           marginTop: "20px",
//           padding: "15px",
//           backgroundColor: "#e9ecef",
//           borderRadius: "8px",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <span
//           style={{
//             fontWeight: "bold",
//             fontSize: "1.1rem",
//             color: totalPercentage > 100 ? "red" : "#333",
//           }}
//         >
//           סה"כ הקצאה: {totalPercentage}%
//           {totalPercentage > 100 && " (חריגה מהתקציב!)"}
//         </span>
//         <span style={{ color: "#666" }}>
//           נותר לחלוקה: {Math.max(0, 100 - totalPercentage)}%
//         </span>
//       </div>

//       <button
//         onClick={saveAllCategories}
//         disabled={isUpdating || totalPercentage > 100}
//         style={{
//           marginTop: "20px",
//           width: "100%",
//           padding: "18px",
//           backgroundColor: totalPercentage > 100 ? "#ccc" : "#007bff",
//           color: "white",
//           border: "none",
//           borderRadius: "6px",
//           fontWeight: "bold",
//           cursor: "pointer",
//           fontSize: "1rem",
//         }}
//       >
//         {isUpdating
//           ? "מעבד נתונים..."
//           : `שמור והפץ את כל הטבלה לשנת ${selectedYear}`}
//       </button>

//       {message && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "10px",
//             color: "#155724",
//             backgroundColor: "#d4edda",
//             border: "1px solid #c3e6cb",
//             borderRadius: "4px",
//             textAlign: "center",
//           }}
//         >
//           {message}
//         </div>
//       )}
//       {error && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "10px",
//             color: "#721c24",
//             backgroundColor: "#f8d7da",
//             border: "1px solid #f5c6cb",
//             borderRadius: "4px",
//             textAlign: "center",
//           }}
//         >
//           {error}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BudgetSettingsPage;

// import React, { useEffect, useState } from "react";
// import { useAppSelector } from "../../store";
// import { categoryService, CategoryDto } from "../../services/categoryService";
// import { userService } from "../../services/userService";
// import api from "../../services/api"; // וודא שיש לך גישה ל-axios/api

// const BudgetSettingsPage: React.FC = () => {
//   const user = useAppSelector((state) => state.auth.user);
//   const [categories, setCategories] = useState<CategoryDto[]>([]);
//   const [existingBudgets, setExistingBudgets] = useState<any[]>([]); // טבלת התקציבים מה-DB
//   const [monthlySalary, setMonthlySalary] = useState<number>(0);
//   const [selectedYear, setSelectedYear] = useState<number>(
//     new Date().getFullYear(),
//   );
//   const [categoryPercentages, setCategoryPercentages] = useState<{
//     [key: number]: number;
//   }>({});
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [isUpdating, setIsUpdating] = useState(false);

//   // 1. טעינת שמות הקטגוריות ונתוני המשתמש
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       if (!user?.id) return;
//       try {
//         const userRes = await userService.getById(user.id);
//         setMonthlySalary(
//           userRes.data.monthlyIncome ?? userRes.data.MonthlyIncome ?? 0,
//         );

//         const catRes = await categoryService.getByUserId(user.id);
//         setCategories(catRes.data);

//         await loadYearlyBudgets(); // טעינת התקציבים הקיימים מיד בטעינה
//       } catch (err) {
//         setError("שגיאה בטעינת נתונים ראשונית.");
//       }
//     };
//     fetchInitialData();
//   }, [user?.id]);

//   // 2. פונקציה לשליפת תקציבים קיימים מהטבלה MonthlyBudgets
//   const loadYearlyBudgets = async () => {
//     if (!user?.id) return;
//     try {
//       // שליפה של כל התקציבים לשנה הנבחרת
//       const res = await api.get(`/MonthlyBudgets`);
//       // סינון לפי משתמש ושנה (עדיף שהסינון יקרה ב-API, אבל כאן זה לביטחון)
//       const filtered = res.data.filter(
//         (b: any) => b.userId === user.id && b.year === selectedYear,
//       );

//       setExistingBudgets(filtered);

//       // עדכון האחוזים בתצוגה לפי מה שקיים ב-DB
//       const percentages: { [key: number]: number } = {};
//       filtered.forEach((b: any) => {
//         percentages[b.categoryId] = b.budgetLimit;
//       });
//       setCategoryPercentages((prev) => ({ ...prev, ...percentages }));
//     } catch (err) {
//       console.error("לא הצלחתי לטעון תקציבים קיימים");
//     }
//   };

//   // רענון נתונים כשמשנים שנה
//   useEffect(() => {
//     loadYearlyBudgets();
//   }, [selectedYear]);

//   // 3. עדכון קטגוריה בודדת - כאן אנחנו מוצאים את ה-ID האמיתי
//   const updateSingleCategoryYearly = async (cat: CategoryDto) => {
//     if (!user?.id) return;
//     setIsUpdating(true);

//     try {
//       const percentage = categoryPercentages[cat.id] || 0;
//       // וודא ש-monthlySalary הוא אכן מספר ולא מחרוזת
//       const salary = Number(monthlySalary);
//       const calculatedAmt = Number(((salary * percentage) / 100).toFixed(2));

//       const catName = (cat as any).name || (cat as any).Name;

//       for (let month = 1; month <= 12; month++) {
//         const existingRecord = existingBudgets.find(
//           (b) =>
//             b.categoryId === cat.id &&
//             b.month === month &&
//             b.year === selectedYear,
//         );

//         // שים לב לשמות השדות - חייבים להתאים ל-C# (PascalCase)
//         const budgetDto = {
//           Id: existingRecord ? existingRecord.id || existingRecord.Id : 0,
//           UserId: user.id,
//           CategoryId: cat.id,
//           CategoryName: catName,
//           BudgetLimit: percentage,
//           CalculatedAmount: calculatedAmt, // השדה שמופיע כ-0 ב-DB
//           TotalSpentSoFar: existingRecord
//             ? existingRecord.totalSpentSoFar || existingRecord.TotalSpentSoFar
//             : 0,
//           Month: month,
//           Year: selectedYear,
//         };

//         // הדפסה ל-Console כדי שתוכל לראות בדיוק מה נשלח רגע לפני השליחה
//         console.log("Sending DTO:", budgetDto);

//         if (budgetDto.Id > 0) {
//           await categoryService.updateMonthlyBudget(budgetDto);
//         } else {
//           await categoryService.addMonthlyBudget(budgetDto);
//         }
//       }

//       setMessage(
//         `התקציב ל"${catName}" עודכן בסכום של ${calculatedAmt.toLocaleString()} ₪ לחודש`,
//       );
//       await loadYearlyBudgets();
//     } catch (err) {
//       console.error("Error updating budget:", err);
//       setError("שגיאה בעדכון הנתונים.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handlePercentageChange = (catId: number, value: string) => {
//     setCategoryPercentages({ ...categoryPercentages, [catId]: Number(value) });
//   };

//   return (
//     <div
//       style={{
//         padding: "2rem",
//         direction: "rtl",
//         maxWidth: "1000px",
//         margin: "0 auto",
//         fontFamily: "Segoe UI",
//       }}
//     >
//       <h2>הגדרות תקציב חודשי לשנת {selectedYear}</h2>

//       {/* ... (שאר ה-UI של השכר והשנה נשאר זהה) ... */}
//       <div style={{ marginBottom: "20px" }}>
//         <label>שנת תקציב: </label>
//         <input
//           type="number"
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(Number(e.target.value))}
//         />
//       </div>

//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead style={{ backgroundColor: "#007bff", color: "white" }}>
//           <tr>
//             <th style={{ padding: "10px" }}>קטגוריה</th>
//             <th style={{ padding: "10px" }}>אחוז (%)</th>
//             <th style={{ padding: "10px" }}>סכום מחושב</th>
//             <th style={{ padding: "10px" }}>פעולה</th>
//           </tr>
//         </thead>
//         <tbody>
//           {categories.map((cat) => (
//             <tr key={cat.id} style={{ borderBottom: "1px solid #ddd" }}>
//               <td style={{ padding: "10px" }}>
//                 {(cat as any).name || (cat as any).Name}
//               </td>
//               <td style={{ padding: "10px" }}>
//                 <input
//                   type="number"
//                   value={categoryPercentages[cat.id] ?? 0}
//                   onChange={(e) =>
//                     handlePercentageChange(cat.id, e.target.value)
//                   }
//                   style={{ width: "60px" }}
//                 />{" "}
//                 %
//               </td>
//               <td style={{ padding: "10px" }}>
//                 {(
//                   (monthlySalary * (categoryPercentages[cat.id] || 0)) /
//                   100
//                 ).toLocaleString()}{" "}
//                 ₪
//               </td>
//               <td style={{ padding: "10px", textAlign: "center" }}>
//                 <button
//                   onClick={() => updateSingleCategoryYearly(cat)}
//                   disabled={isUpdating}
//                   style={{
//                     backgroundColor: "#17a2b8",
//                     color: "white",
//                     padding: "5px 10px",
//                     cursor: "pointer",
//                   }}
//                 >
//                   עדכן שנה (עם ID מה-DB)
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {message && <p style={{ color: "green" }}>{message}</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// };

// export default BudgetSettingsPage;
