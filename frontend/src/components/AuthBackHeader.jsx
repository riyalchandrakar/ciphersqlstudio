import React from "react";
import { Link } from "react-router-dom";
import "../styles/components/_authBackHeader.scss";

const AuthBackHeader = () => {
  return (
    <div className="auth-back-header">
      <Link to="/" className="auth-back-header__link">
        ← Back to Home
      </Link>
    </div>
  );
};

export default AuthBackHeader;
