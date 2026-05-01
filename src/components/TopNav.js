import React, { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./TopNav.css";

function getPageTitle(pathname) {
  if (pathname.startsWith("/transactions/new")) return "Add Transaction";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/ledger")) return "Ledger";
  if (pathname.startsWith("/daybook")) return "Day Book";
  if (pathname.startsWith("/monthly")) return "Monthly Report";
  if (pathname.startsWith("/edit")) return "Edit Transaction";
  return "Finance";
}

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = useMemo(
    () => getPageTitle(location.pathname),
    [location.pathname]
  );

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const go = (path) => {
    navigate(path);
    setMobileOpen(false); // 🔥 auto close mobile menu
  };

  return (
    <>
      <header className="topnav">
        {/* LEFT */}
        <div className="topnav-left">
          <button
            className="topnav-hamburger"
            onClick={() => setMobileOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>

          <button className="topnav-brand" onClick={() => go("/dashboard")}>
            <span className="topnav-brandMark" />
            <span className="topnav-brandText">Finance</span>
          </button>

          <div className="topnav-title">
            <div className="topnav-titleText">{pageTitle}</div>
            <div className="topnav-subtitle">
              Track income, expense, loans & investments
            </div>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <nav className="topnav-links">
          <NavLink className="topnav-link" to="/dashboard">
            Dashboard
          </NavLink>

          <NavLink className="topnav-link" to="/transactions/new">
            Add
          </NavLink>

          <NavLink className="topnav-link" to="/ledger">
            Ledger
          </NavLink>

          <NavLink className="topnav-link" to="/daybook">
            DayBook
          </NavLink>

          <NavLink className="topnav-link" to="/monthly">
            Report
          </NavLink>
        </nav>

        {/* RIGHT */}
        <div className="topnav-right">
          <button className="topnav-cta" onClick={() => go("/transactions/new")}>
            + Add
          </button>

          <button className="topnav-logout" onClick={logout}>
            Logout
          </button>

          <div className="topnav-user">
            <div className="topnav-avatar">F</div>
          </div>
        </div>
      </header>

      {/* OVERLAY */}
      <div
        className={`topnav-overlay ${mobileOpen ? "is-visible" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* MOBILE DRAWER */}
      <aside className={`topnav-drawer ${mobileOpen ? "is-open" : ""}`}>
        <div className="topnav-drawerHeader">
          <div className="topnav-drawerBrand">Finance Menu</div>
          <button
            className="topnav-drawerClose"
            onClick={() => setMobileOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="topnav-drawerLinks">
          <button className="topnav-drawerLink" onClick={() => go("/dashboard")}>
            Dashboard
          </button>

          <button className="topnav-drawerLink" onClick={() => go("/transactions/new")}>
            Add Transaction
          </button>

          <button className="topnav-drawerLink" onClick={() => go("/ledger")}>
            Ledger
          </button>

          <button className="topnav-drawerLink" onClick={() => go("/daybook")}>
            DayBook
          </button>

          <button className="topnav-drawerLink" onClick={() => go("/monthly")}>
            Monthly Report
          </button>

          <button className="topnav-drawerLink logout" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
