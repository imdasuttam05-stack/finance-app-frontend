import React, { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import "./TopNav.css";

function getPageTitle(pathname) {
  if (pathname.startsWith("/transactions/new")) return "Add Transaction";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  return "Finance";
}

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

  return (
    <>
      <header className="topnav">
        <div className="topnav-left">
          <button
            type="button"
            className="topnav-hamburger"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>

          <button type="button" className="topnav-brand" onClick={() => navigate("/dashboard")}>
            <span className="topnav-brandMark" aria-hidden="true" />
            <span className="topnav-brandText">Finance</span>
          </button>

          <div className="topnav-title">
            <div className="topnav-titleText">{pageTitle}</div>
            <div className="topnav-subtitle">Track income, expenses, loans, and investments</div>
          </div>
        </div>

        <nav className="topnav-links" aria-label="Primary">
          <NavLink className="topnav-link" to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink className="topnav-link" to="/transactions/new">
            Add Transaction
          </NavLink>
        </nav>

        <div className="topnav-right">
          <button type="button" className="topnav-cta" onClick={() => navigate("/transactions/new")}>
            New Entry
          </button>
          <div className="topnav-user" title="Local session">
            <div className="topnav-avatar">F</div>
            <div className="topnav-userMeta">
              <div className="topnav-userName">Finance User</div>
              <div className="topnav-userHint">Local</div>
            </div>
          </div>
        </div>
      </header>

      <div className={`topnav-overlay ${mobileOpen ? "is-visible" : ""}`} onClick={() => setMobileOpen(false)} />

      <aside className={`topnav-drawer ${mobileOpen ? "is-open" : ""}`} aria-label="Mobile menu">
        <div className="topnav-drawerHeader">
          <div className="topnav-drawerBrand">
            <span className="topnav-brandMark" aria-hidden="true" />
            Finance Menu
          </div>
          <button type="button" className="topnav-drawerClose" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            ×
          </button>
        </div>

        <div className="topnav-drawerLinks">
          <NavLink className="topnav-drawerLink" to="/dashboard" onClick={() => setMobileOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink className="topnav-drawerLink" to="/transactions/new" onClick={() => setMobileOpen(false)}>
            Add Transaction
          </NavLink>
        </div>
      </aside>
    </>
  );
}

