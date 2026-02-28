import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/components/_navbar.scss";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || "U";

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">CS</div>
          <span className="navbar__logo-text">
            Cipher<span>SQL</span>Studio
          </span>
        </Link>

        <div className="navbar__nav">
          <NavLink
            to="/assignments"
            className={({ isActive }) =>
              `navbar__link${isActive ? " navbar__link--active" : ""}`
            }
          >
            Assignments
          </NavLink>
          {user && (
            <NavLink
              to="/my-attempts"
              className={({ isActive }) =>
                `navbar__link${isActive ? " navbar__link--active" : ""}`
              }
            >
              My Progress
            </NavLink>
          )}
        </div>

        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user">
              <span className="navbar__user-name">{user.username}</span>
              <div
                className="navbar__user-avatar"
                title={`${user.username} — Click to logout`}
                onClick={handleLogout}
              >
                {initials}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">
                Login
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
                Sign Up
              </Link>
            </>
          )}

          <button
            className="navbar__menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar__mobile-menu">
          <NavLink
            to="/assignments"
            className="navbar__link"
            onClick={() => setMobileOpen(false)}
          >
            Assignments
          </NavLink>
          {user ? (
            <>
              <NavLink
                to="/my-attempts"
                className="navbar__link"
                onClick={() => setMobileOpen(false)}
              >
                My Progress
              </NavLink>
              <button
                className="btn btn--danger btn--sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn--ghost btn--sm"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn--primary btn--sm"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
