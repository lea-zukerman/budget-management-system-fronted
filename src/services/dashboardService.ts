import { budgetService } from "./budgetService";

export const dashboardService = {
  getCategoryOverview: async (userId: number, year: number, month: number) => {
    try {
      const res = await budgetService.getByUserId(userId);
      const allBudgets = res.data;

      console.log("1. All data from server:", allBudgets);
      console.log("2. Searching for:", { year, month });

      // סינון - הוספנו לוג כדי לראות מה עובר את הסינון
      const filtered = allBudgets.filter((b) => {
        const itemYear = b.year ?? b.Year;
        const itemMonth = b.month ?? b.Month;
        return itemYear === year && itemMonth === month;
      });

      console.log("3. Data after filtering:", filtered);

      const map = new Map();

      filtered.forEach((item: any) => {
        // תמיכה באותיות גדולות וקטנות מה-API
        const catId = item.categoryId ?? item.CategoryId;
        const catName =
          item.categoryName ?? item.CategoryName ?? `קטגוריה ${catId}`;
        const spent = item.totalSpentSoFar ?? item.TotalSpentSoFar ?? 0;
        const calculate = item.calculatedAmount ?? item.CalculatedAmount ?? 0;

        const existing = map.get(catId);
        if (existing) {
          existing.spent += Number(spent);
          existing.totalBudget += Number(calculate);
        } else {
          map.set(catId, {
            categoryId: catId,
            categoryName: catName,
            totalBudget: Number(calculate),
            spent: Number(spent),
          });
        }
      });

      return Array.from(map.values());
    } catch (error) {
      console.error("Error in Dashboard Service:", error);
      throw error;
    }
  },

  getYearlyTrend: async (userId: number, year: number) => {
    const res = await budgetService.getByUserId(userId);
    const allBudgets = res.data;

    const monthShortNames = [
      "ינו",
      "פב",
      "מרץ",
      "אפר",
      "מאי",
      "יוני",
      "יולי",
      "אוג",
      "ספט",
      "אוק",
      "נוב",
      "דצ",
    ];
    const trend = monthShortNames.map((name, index) => ({
      month: index + 1,
      monthName: name,
      totalSpent: 0,
      totalBudget: 0,
    }));

    allBudgets.forEach((item: any) => {
      const itemYear = item.year ?? item.Year;
      const itemMonth = item.month ?? item.Month;
      if (itemYear === year) {
        const monthIdx = itemMonth - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          trend[monthIdx].totalSpent += Number(
            item.totalSpentSoFar ?? item.TotalSpentSoFar ?? 0,
          );
          trend[monthIdx].totalBudget += Number(
            item.budgetLimit ?? item.BudgetLimit ?? 0,
          );
        }
      }
    });

    return trend;
  },
};
