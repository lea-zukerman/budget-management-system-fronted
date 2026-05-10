import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar: React.FC = () => (
  <header className={styles.navbar}>
    <div className={styles.brand}>SmartBudget</div>
    <nav className={styles.links}>
      <NavLink
        to="/dashboard"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        דשבורד
      </NavLink>
      <NavLink
        to="/analysis"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        חשבוניות
      </NavLink>
      <NavLink
        to="/invoice-processor"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        העלאת חשבונית
      </NavLink>
      <NavLink
        to="/budget"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        תקציב
      </NavLink>
      <NavLink
        to="/expenses"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        הוצאות
      </NavLink>
      <NavLink
        to="/categories"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        קטגוריות
      </NavLink>
      <NavLink
        to="/suppliers"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        ספקים
      </NavLink>
      <NavLink
        to="/email-settings"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        הגדרות מייל
      </NavLink>
      <NavLink
        to="/notifications"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        התראות
      </NavLink>
      <NavLink
        to="/login"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        הרשמה/התחברות
      </NavLink>
    </nav>
  </header>
);

export default Navbar;
