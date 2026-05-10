import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux";
import ProtectedRoute from "./ProtectedRoute";

// ייבוא הדפים
import LoginPage from "../auth/LoginPage/LoginPage";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import InvoiceAnalysisPage from "../pages/InvoiceAnalysisPage/InvoiceAnalysisPage";
import RegisterPage from "../auth/RegisterPage/RegisterPage";
import ExpencePage from "../pages/Expence/ExpencePage";
import BudgetSettingsPage from "../pages/BudgetSettingsPage/BudgetSettingsPage";
import CategoriesPage from "../pages/CategoriesPage/CategoriesPage";
import InvoiceProcessorPage from "../pages/InvoiceProcessorPage/InvoiceProcessorPage";
import SuppliersPage from "../pages/SuppliersPage/SuppliersPage";
import EmailSettingsPage from "../pages/EmailSettingsPage/EmailSettingsPage";
import NotificationsPage from "../pages/NotificationsPage/NotificationsPage";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  return (
    <Routes>
      {/* 1. דף הבית - ניתוב חכם ראשוני */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : user?.isAdmin ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 2. דף מנהל מערכת - רק לאדמין */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            {user?.isAdmin ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* 3. דפים רגילים - חסומים למנהל (Redirect חזרה ל-admin) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {!user?.isAdmin ? (
              <DashboardPage />
            ) : (
              <Navigate to="/admin" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            {!user?.isAdmin ? (
              <InvoiceAnalysisPage />
            ) : (
              <Navigate to="/admin" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            {!user?.isAdmin ? (
              <ExpencePage />
            ) : (
              <Navigate to="/admin" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            {!user?.isAdmin ? (
              <BudgetSettingsPage />
            ) : (
              <Navigate to="/admin" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoice-processor"
        element={
          <ProtectedRoute>
            {!user?.isAdmin ? (
              <InvoiceProcessorPage />
            ) : (
              <Navigate to="/admin" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            {!user?.isAdmin ? (
              <CategoriesPage />
            ) : (
              <Navigate to="/admin" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            {!user?.isAdmin ? (
              <SuppliersPage />
            ) : (
              <Navigate to="/admin" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/email-settings"
        element={
          <ProtectedRoute>
            {!user?.isAdmin ? (
              <EmailSettingsPage />
            ) : (
              <Navigate to="/admin" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            {!user?.isAdmin ? (
              <NotificationsPage />
            ) : (
              <Navigate to="/admin" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* 4. Catch-all - מטפל בכל נתיב לא קיים או טעויות הקלדה */}
      <Route
        path="*"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : user?.isAdmin ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
