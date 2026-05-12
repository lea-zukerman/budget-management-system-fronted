# SmartBudget - Frontend

A modern, high-performance financial management dashboard. This application allows users to track expenses, manage budgets, process invoices, and visualize financial trends through an intuitive and responsive interface.

## Key Features

* **Interactive Dashboard**: Real-time visualization of yearly trends and monthly spending.
* **Budget vs. Actuals**: Visual progress bars with color-coded alerts (green/red) for budget tracking.
* **Invoice Processing**: Dedicated module for uploading and analyzing financial documents.
* **Complete Management**: Comprehensive CRUD for Suppliers, Categories, and Expenses.
* **Email & Notifications**: Built-in settings for automated alerts and system notifications.
* **Secure Auth**: State-managed authentication flow using Redux Toolkit.

## 🛠️ Technology Stack

* **Framework**: React 19 (Functional Components & Hooks)
* **Language**: TypeScript for type-safe development.
* **State Management**: Redux Toolkit (Slices & Thunks)
* **Data Visualization**: Recharts (Line, Bar, and Pie charts)
* **Build Tool**: Vite
* **Routing**: React Router Dom v7
* **Styling**: CSS Modules (Scoped styling per component)
* **API Client**: Axios

## Getting Started

To run this project locally, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

* `src/components`: Reusable UI elements like Navbar and LoadingSpinners.
* `src/pages`: Main view components (Dashboard, Expenses, Budget, etc.).
* `src/redux`: Global state logic and authentication slices.
* `src/services`: API service layers for Backend communication.
* `src/routes`: Route definitions and protected path logic.

---
**Developed by Lea Zukerman**
