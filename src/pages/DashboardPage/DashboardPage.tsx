import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../redux";
import {
  dashboardService,
  CategoryOverview,
  YearlyTrend,
} from "../../services/dashboardService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const DashboardPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  // States לנתונים
  const [categories, setCategories] = useState<CategoryOverview[]>([]);
  const [yearlyTrend, setYearlyTrend] = useState<YearlyTrend[]>([]);

  // States לסינון
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      // הוספת לוגים כדי לראות איפה זה נעצר
      console.log("User Status:", user);

      if (!user?.id) {
        console.log("No User ID - waiting...");
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching for user:", user.id);
        const categoryData = await dashboardService.getCategoryOverview(
          user.id,
          selectedYear,
          selectedMonth,
        );
        setCategories(categoryData);

        const trendData = await dashboardService.getYearlyTrend(
          user.id,
          selectedYear,
        );
        setYearlyTrend(trendData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("טעינת הנתונים נכשלה");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, selectedYear, selectedMonth]); // ודאי ש-user?.id נמצא כאן

  // חישובי סיכום לכרטיסים (Widgets)
  const totalBudget = categories.reduce((sum, c) => sum + c.totalBudget, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const remaining = totalBudget - totalSpent;

  const monthNames = [
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

  const pieData = categories.map((c) => ({
    name: c.categoryName,
    value: c.spent,
  }));

  return (
    <div
      style={{
        padding: "20px",
        direction: "rtl",
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
          color: "#333",
          fontWeight: "bold",
        }}
      >
        לוח בקרה תקציבי
      </h2>

      {/* סרגל סינון */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px",
          background: "#fff",
          padding: "15px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "12px", marginBottom: "4px" }}>שנה</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ddd",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "12px", marginBottom: "4px" }}>חודש</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              minWidth: "120px",
            }}
          >
            {monthNames.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          style={{ color: "red", textAlign: "center", marginBottom: "20px" }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          טוען נתונים...
        </div>
      ) : (
        <>
          {/* כרטיסי סיכום */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <SummaryCard
              title="תקציב מוגדר"
              value={totalBudget}
              color="#007bff"
              icon="💰"
            />
            <SummaryCard
              title="בוצע בפועל"
              value={totalSpent}
              color={totalSpent > totalBudget ? "#dc3545" : "#6f42c1"}
              icon="📉"
            />
            <SummaryCard
              title="יתרה שנותרה"
              value={remaining}
              color={remaining < 0 ? "#dc3545" : "#28a745"}
              icon="🏁"
            />
          </div>

          {/* גרף מגמה שנתי (Line Chart) */}
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              marginBottom: "30px",
            }}
          >
            <h4 style={{ marginBottom: "20px", color: "#555" }}>
              מגמת הוצאות שנתית - {selectedYear}
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={yearlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip
                  formatter={(val) => `₪${Number(val).toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalSpent"
                  name="הוצאות"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="totalBudget"
                  name="תקציב"
                  stroke="#82ca9d"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* גרפים חודשיים */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <h5 style={{ marginBottom: "15px", color: "#666" }}>
                תקציב מול ביצוע ({monthNames[selectedMonth - 1]})
              </h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categories}>
                  <XAxis dataKey="categoryName" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="totalBudget"
                    name="תקציב"
                    fill="#a8dadc"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="spent"
                    name="הוצאה"
                    fill="#457b9d"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <h5 style={{ marginBottom: "15px", color: "#666" }}>
                התפלגות הוצאות חודשית
              </h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* כרטיסיות פירוט קטגוריות */}
          <h4 style={{ marginBottom: "15px", color: "#555" }}>
            פירוט לפי קטגוריה
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "15px",
            }}
          >
            {categories.map((c) => {
              const percent =
                c.totalBudget > 0
                  ? Math.round((c.spent / c.totalBudget) * 100)
                  : 0;
              const isExceeded = c.spent > c.totalBudget;

              return (
                <div
                  key={c.categoryId}
                  style={{
                    background: "#fff",
                    padding: "15px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    borderRight: `5px solid ${isExceeded ? "#dc3545" : "#28a745"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>{c.categoryName}</span>
                    <span
                      style={{
                        color: isExceeded ? "#dc3545" : "#28a745",
                        fontSize: "13px",
                      }}
                    >
                      {percent}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      background: "#eee",
                      borderRadius: "4px",
                      overflow: "hidden",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        height: "100%",
                        background: isExceeded ? "#dc3545" : "#28a745",
                        transition: "width 0.5s",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>הוצאה: ₪{c.spent.toLocaleString()}</span>
                    <span>תקציב: ₪{c.totalBudget.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// רכיב עזר לכרטיסי סיכום
const SummaryCard = ({ title, value, color, icon }: any) => (
  <div
    style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      borderTop: `4px solid ${color}`,
    }}
  >
    <div style={{ fontSize: "24px", marginBottom: "10px" }}>{icon}</div>
    <div style={{ color: "#888", fontSize: "14px" }}>{title}</div>
    <div style={{ fontSize: "22px", fontWeight: "bold", color: "#333" }}>
      ₪{value.toLocaleString()}
    </div>
  </div>
);

export default DashboardPage;
