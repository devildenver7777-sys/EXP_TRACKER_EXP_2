# Expense Tracker Web Application

An enterprise-ready, pixel-perfect replication and implementation of the **Expense Tracker** application built strictly according to the **Software Requirements Specification (SRS v1.0)** and approved UI design.

![UI Design](C:/Users/yuvan/.gemini/antigravity/brain/896502cf-1411-4ce0-8271-a1e3d372fc2c/.user_uploaded/media_1794891406973_cd394e9b.jpg)

---

## 🌟 Key Features & SRS Compliance Matrix

| Requirement | Description | Status | Implementation Details |
| :--- | :--- | :---: | :--- |
| **FR-1.1 to 1.7** | **Authentication & Login** | ✅ Done | Email/password validation, inline error messaging, show/hide password toggle, 5-attempt lockout (15 min), JWT token auth, and redirect to `/dashboard`. |
| **FR-2.1** | **User Greeting** | ✅ Done | Dynamic greeting: `"Hello, Yuvan! 👋"` and subtitle `"Here's your expense overview for this month."` |
| **FR-2.2** | **Month Selector** | ✅ Done | Calendar dropdown default to `July 2025 ⌄` with month switching. |
| **FR-2.3** | **Summary KPI Cards** | ✅ Done | Total Balance (₹12,450, +8%), Total Income (₹25,000, +5%), Total Expenses (₹12,550, +3%), Monthly Budget (₹15,000). |
| **FR-2.4** | **Monthly Budget Progress** | ✅ Done | Progress bar filled with percentage indicator (`84%`). |
| **FR-2.5** | **Expense Overview Donut** | ✅ Done | Donut chart with center text (`₹12,550 Total Expenses`), 5 category breakdown (`Food ₹4k (32%)`, `Shopping ₹2.5k (20%)`, `Travel ₹2k (16%)`, `Bills ₹2k (16%)`, `Others ₹2.05k (16%)`), and time range toggle (`This Month` / `Last Month` / `This Year`). |
| **FR-2.6** | **Spending Trend Chart** | ✅ Done | 7-month curve (Jan–Jul) with purple tooltip banner on latest month: `₹12,550`. |
| **FR-2.7** | **Recent Transactions Table**| ✅ Done | 5 exact records with badges (`Zomato Order`, `Amazon Purchase`, `Salary`, `Metro Card`, `Electricity Bill`), and `"View All →"` linking to Reports. |
| **FR-2.8** | **Set Monthly Budget Card** | ✅ Done | Input field with ₹ prefix icon and `"Update Budget"` button with instant recalculations. |
| **FR-2.9** | **Expense by Category Pie** | ✅ Done | Pie chart with percentage legend for Food, Shopping, Travel, Bills, Others. |
| **FR-2.10** | **Sidebar Navigation** | ✅ Done | Active pill highlight for Dashboard, Add Transaction, Reports, Budget, Settings, Logout, plus bottom Piggy Bank card with `"Save More, Spend Wisely!"`. |
| **FR-3.1 to 3.3** | **Other Pages** | ✅ Done | `/transactions/new` (Add transaction with live preview), `/reports` (filters, chart & CSV export), `/budget` (category limits & 80% warning banner), `/settings` (profile, password, currency). |
| **FR-3.4** | **Access Control** | ✅ Done | Protected routes redirect unauthenticated users to `/login`. User can only access their own data. |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons, Recharts / SVG charts, React Router DOM v7.
- **Backend**: Django 6, Django REST Framework, SimpleJWT (JSON Web Tokens), django-cors-headers.
- **Database**: SQLite (pre-seeded with Yuvan's July 2025 data).
- **Timezone**: `Asia/Kolkata` (UTC+05:30) as required by SRS section 2.4.
- **Currency**: Indian Rupees (`₹`).

---

## 🚀 Quick Start Guide

### Credentials
- **Email**: `yuvan@example.com`
- **Password**: `password123`
*(A "One-Click Login" button is also provided on `/login` for immediate testing)*

### Launching the Application
You can launch both services using the provided batch files in the root folder:

1. **Start Both Services at Once**:
   Double click or run:
   ```cmd
   run_all.bat
   ```
2. **Or Run Separately**:
   - Backend:
     ```cmd
     run_backend.bat
     ```
     Runs Django API on `http://127.0.0.1:8000/api/`
   - Frontend:
     ```cmd
     run_frontend.bat
     ```
     Runs Vite React dev server on `http://localhost:5173`

---

## 🧪 Testing & Verification

The backend includes a comprehensive test suite covering authentication, account lockout, summary cards calculation, budget updates, CSV report generation, and security access control:

```cmd
cd backend
C:\Users\yuvan\AppData\Roaming\ProjectLightningV5\resources\binaries\win\python\python.exe manage.py test tracker
```
Result: **9/9 tests pass (OK)**.

The frontend build succeeds cleanly:
```cmd
cd frontend
npm run build
```
Result: **0 errors, built in < 1 second**.
