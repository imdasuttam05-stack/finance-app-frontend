import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import TopNav from "./components/TopNav";

// 📄 Pages
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import LedgerMaster from "./pages/LedgerMaster";
import LedgerPage from "./pages/LedgerPage";
import DayBook from "./pages/DayBook";
import MonthlyReport from "./pages/MonthlyReport";
import EditTransaction from "./pages/EditTransaction";
import Login from "./pages/Login";

function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Router>
      <div className="app-shell">
        
        {/* 🔐 Hide navbar on login */}
        {isLoggedIn && <TopNav />}

        <main className="app-content">
          <Routes>

            {/* 🔐 Login */}
            <Route
              path="/login"
              element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
            />

            {/* 🔁 Default redirect */}
            <Route
              path="/"
              element={
                isLoggedIn
                  ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/login" replace />
              }
            />

            {/* 🏠 Dashboard */}
            <Route
              path="/dashboard"
              element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
            />

            {/* ➕ Add Transaction */}
            <Route
              path="/transactions/new"
              element={isLoggedIn ? <AddTransaction /> : <Navigate to="/login" />}
            />

            {/* 📒 Ledger Master */}
            <Route
              path="/ledger"
              element={isLoggedIn ? <LedgerMaster /> : <Navigate to="/login" />}
            />

            {/* 📄 Single Ledger */}
            <Route
              path="/ledger/:id"
              element={isLoggedIn ? <LedgerPage /> : <Navigate to="/login" />}
            />

            {/* 📊 Day Book */}
            <Route
              path="/daybook"
              element={isLoggedIn ? <DayBook /> : <Navigate to="/login" />}
            />

            {/* 📅 Monthly Report */}
            <Route
              path="/monthly"
              element={isLoggedIn ? <MonthlyReport /> : <Navigate to="/login" />}
            />

            {/* ✏️ Edit Transaction */}
            <Route
              path="/edit/:id"
              element={isLoggedIn ? <EditTransaction /> : <Navigate to="/login" />}
            />

            {/* ❌ Fallback */}
            <Route
              path="*"
              element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
            />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
