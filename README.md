Smart Budget Management System (Backend)
A robust RESTful API built with ASP.NET Core designed to help users manage their personal finances intelligently. The system automates expense tracking, invoice management, and budget limits.

 Key Features
User Authentication & Security: Secure login and registration using JWT (JSON Web Tokens) with role-based access control (Admin/User).

Automated Expense Tracking: Track daily expenses and categorize them automatically based on vendor rules.

Smart Monthly Budgeting: Set financial goals and limits for different categories and monitor progress in real-time.

Invoice Management: Upload, store, and process digital invoices, linking them directly to budget transactions.

Notification System: Real-time alerts for budget overruns and important account updates.

Admin Dashboard: Dedicated endpoints for managing default categories and global system settings.

 Tech Stack
Framework: .NET Core Web API

Security: JWT Bearer Authentication, Identity Policy Management

Architecture: Clean Architecture with Repository Pattern and Services Layer

Features: File Upload Handling, Async/Await operations, DTO mapping

 API Overview
auth/ - Handle registration and secure login.

expenses/ - Manage user transactions and category assignments.

invoices/ - Upload and process invoice files.

monthlybudgets/ - Set and track monthly financial limits.

notifications/ - Manage user alerts and read statuses.

admin/ - Administrative controls for system defaults.
