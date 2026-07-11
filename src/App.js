import React from "react";

import {
  BrowserRouter as Router,

  Routes,

  Route,

  Navigate,

} from "react-router-dom";

import "./App.css";

// ======================
// COMPONENTS
// ======================

import TopNav
from "./components/TopNav";

// ======================
// PAGES
// ======================

import Dashboard
from "./pages/Dashboard";

import AddTransaction
from "./pages/AddTransaction";

import LedgerMaster
from "./pages/LedgerMaster";

import LedgerPage
from "./pages/LedgerPage";

import DayBook
from "./pages/DayBook";

import MonthlyReport
from "./pages/MonthlyReport";

import EditTransaction
from "./pages/EditTransaction";

import Profile
from "./pages/Profile";

import AdminApprove
from "./pages/AdminApprove";

import Login
from "./pages/Login";

// ======================
// PRIVATE ROUTE
// ======================

function PrivateRoute({
  children,
}) {

  const token =
    localStorage.getItem(
      "token"
    );

  return token
    ? children
    : <Navigate
        to="/login"
        replace
      />;

}

// ======================
// APP
// ======================

function App() {

  const isLoggedIn =
    !!localStorage.getItem(
      "token"
    );

  return (

    <Router>

      <div className="app-shell">

        {/* NAVBAR */}

        {isLoggedIn && (
          <TopNav />
        )}

        {/* CONTENT */}

        <main
          className="app-content"
        >

          <Routes>

            {/* LOGIN */}

            <Route

              path="/login"

              element={

                isLoggedIn

                  ? (
                      <Navigate
                        to="/dashboard"
                        replace
                      />
                    )

                  : <Login />

              }

            />

            {/* DEFAULT */}

            <Route

              path="/"

              element={

                <Navigate

                  to={
                    isLoggedIn
                      ? "/dashboard"
                      : "/login"
                  }

                  replace

                />

              }

            />

            {/* DASHBOARD */}

            <Route

              path="/dashboard"

              element={

                <PrivateRoute>

                  <Dashboard />

                </PrivateRoute>

              }

            />

            {/* ADD TRANSACTION */}

            <Route

              path="/transactions/new"

              element={

                <PrivateRoute>

                  <AddTransaction />

                </PrivateRoute>

              }

            />

            {/* LEDGER MASTER */}

            <Route

              path="/ledger"

              element={

                <PrivateRoute>

                  <LedgerMaster />

                </PrivateRoute>

              }

            />

            {/* SINGLE LEDGER */}

            <Route

              path="/ledger/:id"

              element={

                <PrivateRoute>

                  <LedgerPage />

                </PrivateRoute>

              }

            />

            {/* DAY BOOK */}

            <Route

              path="/daybook"

              element={

                <PrivateRoute>

                  <DayBook />

                </PrivateRoute>

              }

            />

            {/* MONTHLY */}

            <Route

              path="/monthly"

              element={

                <PrivateRoute>

                  <MonthlyReport />

                </PrivateRoute>

              }

            />

            {/* EDIT */}

            <Route

              path="/edit/:id"

              element={

                <PrivateRoute>

                  <EditTransaction />

                </PrivateRoute>

              }

            />

            {/* PROFILE */}

            <Route

              path="/profile"

              element={

                <PrivateRoute>

                  <Profile />

                </PrivateRoute>

              }

            />

            <Route
              path="/admin-approve"
              element={<AdminApprove />}
            />

            {/* 404 */}

            <Route

              path="*"

              element={

                <Navigate

                  to={
                    isLoggedIn
                      ? "/dashboard"
                      : "/login"
                  }

                  replace

                />

              }

            />

          </Routes>

        </main>

      </div>

    </Router>

  );

}

export default App;
