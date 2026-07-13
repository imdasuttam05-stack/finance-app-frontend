import React, { useMemo, useState, useRef, useEffect } from "react";
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
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const username = localStorage.getItem("username") || "Uttam";
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const pageTitle = useMemo(
    () => getPageTitle(location.pathname),
    [location.pathname]
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userMobile");
    localStorage.removeItem("isApproved");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("role");
    navigate("/login");
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

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

          <NavLink className="topnav-link" to="/profile">
            Profile
          </NavLink>

          {isAdmin && (
            <NavLink className="topnav-link" to="/admin-approve">
              Approve
            </NavLink>
          )}
        </nav>
        <div className="topnav-right">
          <div className="topnav-search">
            <input
              placeholder="Search"
              className="topnav-searchInput"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = e.target.value.trim();
                  if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
                }
              }}
            />
          </div>

          <button className="topnav-iconButton" title="Notifications">
            <span className="bell">🔔</span>
            <span className="badge">3</span>
          </button>

          <div className="topnav-user" ref={userMenuRef}>
            <button
              className="topnav-userBtn"
              onClick={() => setUserMenuOpen((s) => !s)}
              aria-expanded={userMenuOpen}
            >
              <div className="topnav-avatar">{(username || "U")[0].toUpperCase()}</div>
              <div className="topnav-username">{username}</div>
            </button>

            {userMenuOpen && (
              <div className="topnav-userMenu">
                <button className="topnav-userMenuItem" onClick={() => go("/profile")}>Profile</button>
                <button className="topnav-userMenuItem" onClick={() => go("/settings")}>Settings</button>
                <div className="topnav-userMenuDivider" />
                <button className="topnav-userMenuItem logout" onClick={logout}>Logout</button>
              </div>
            )}
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

          <button className="topnav-drawerLink" onClick={() => go("/profile")}>
            Profile
          </button>

          {isAdmin && (
            <button className="topnav-drawerLink" onClick={() => go("/admin-approve")}>
              Approve Users
            </button>
          )}

          <button className="topnav-drawerLink logout" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
