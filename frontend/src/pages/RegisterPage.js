import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "../styles/pages/_auth.scss";

const RegisterPage = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      showToast("Account created! Welcome to CipherSQLStudio 🎉", "success");
      navigate("/assignments");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.length) {
        setError(errors.map((e) => e.msg).join(", "));
      } else {
        setError(err.response?.data?.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <Link to="/" className="auth-page__logo">
          <div className="auth-page__logo-icon">CS</div>
          <span className="auth-page__logo-text">
            Cipher<span>SQL</span>Studio
          </span>
        </Link>

        <h1 className="auth-page__title">Create account</h1>
        <p className="auth-page__subtitle">
          Start practicing SQL with real data today
        </p>

        {error && <div className="auth-page__error">{error}</div>}

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-group__label">Username</label>
            <input
              className="input"
              type="text"
              name="username"
              placeholder="sqlmaster42"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label className="form-group__label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-group__label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg auth-page__submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner"
                  style={{ borderTopColor: "#0d0e14" }}
                />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-page__divider">or</div>

        <p className="auth-page__switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
