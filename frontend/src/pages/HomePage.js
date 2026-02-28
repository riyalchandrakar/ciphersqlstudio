import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/pages/_home.scss";

const features = [
  {
    icon: "⚡",
    title: "Real-time Execution",
    desc: "Run SQL queries instantly against live PostgreSQL data and see results in milliseconds.",
  },
  {
    icon: "🧠",
    title: "AI-Powered Hints",
    desc: "Stuck? Get intelligent hints that guide your thinking — not the answer.",
  },
  {
    icon: "📊",
    title: "Live Data Preview",
    desc: "See table schemas and sample data side-by-side with your editor.",
  },
  {
    icon: "🔒",
    title: "Safe Sandbox",
    desc: "Write freely — the sandbox blocks destructive queries automatically.",
  },
  {
    icon: "📈",
    title: "Track Progress",
    desc: "Save your queries and track your improvement across all assignments.",
  },
  {
    icon: "🎯",
    title: "7 Curated Challenges",
    desc: "From basic SELECTs to complex JOINs and aggregations — something for every level.",
  },
];

const difficulties = [
  {
    label: "Easy",
    count: 2,
    color: "#00e5a0",
    desc: "Basic SELECT, WHERE, ORDER BY",
  },
  {
    label: "Medium",
    count: 3,
    color: "#ffa94d",
    desc: "JOINs, GROUP BY, Subqueries",
  },
  {
    label: "Hard",
    count: 2,
    color: "#ff4d6d",
    desc: "Date functions, Window functions",
  },
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-page__hero">
        <div className="home-page__hero-bg" />
        <div className="container">
          <div className="home-page__hero-content fade-in">
            <div className="home-page__hero-badge">
              <span>🚀</span> Browser-Based SQL Practice Platform
            </div>
            <h1 className="home-page__hero-title">
              Master SQL with
              <br />
              <span>Real Queries,</span>
              <br />
              Real Data.
            </h1>
            <p className="home-page__hero-subtitle">
              Practice SQL against a live PostgreSQL database. Get AI-powered
              hints when you're stuck. Track your progress across curated
              assignments.
            </p>
            <div className="home-page__hero-actions">
              <Link
                to={user ? "/assignments" : "/register"}
                className="btn btn--primary btn--lg"
              >
                {user ? "Browse Assignments" : "Start for Free"} →
              </Link>
              {!user && (
                <Link to="/assignments" className="btn btn--secondary btn--lg">
                  Explore Assignments
                </Link>
              )}
            </div>
          </div>

          <div className="home-page__hero-preview fade-in">
            <div className="home-page__code-preview">
              <div className="home-page__code-header">
                <div className="home-page__code-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="home-page__code-filename">query.sql</span>
              </div>
              <pre className="home-page__code-body">
                <code>
                  {`SELECT 
  d.name AS department,
  COUNT(e.id) AS headcount,
  ROUND(AVG(e.salary), 2) 
    AS avg_salary
FROM employees e
JOIN departments d 
  ON e.department_id = d.id
GROUP BY d.name
HAVING AVG(e.salary) > 70000
ORDER BY avg_salary DESC;`}
                </code>
              </pre>
              <div className="home-page__code-result">
                <div className="home-page__code-result-header">
                  ● 3 rows returned · 4ms
                </div>
                <div className="home-page__code-result-row">
                  <span>Engineering</span>
                  <span>5</span>
                  <span>$83,400.00</span>
                </div>
                <div className="home-page__code-result-row">
                  <span>Finance</span>
                  <span>2</span>
                  <span>$86,000.00</span>
                </div>
                <div className="home-page__code-result-row">
                  <span>Sales</span>
                  <span>3</span>
                  <span>$72,666.67</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Difficulty tiers */}
      <section className="home-page__section">
        <div className="container">
          <h2 className="home-page__section-title">
            Something for Every Level
          </h2>
          <div className="home-page__difficulty-grid">
            {difficulties.map((d) => (
              <div
                key={d.label}
                className="home-page__difficulty-card"
                style={{ "--accent": d.color }}
              >
                <div className="home-page__difficulty-badge">{d.label}</div>
                <div className="home-page__difficulty-count">
                  {d.count} assignments
                </div>
                <div className="home-page__difficulty-desc">{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home-page__section home-page__section--alt">
        <div className="container">
          <h2 className="home-page__section-title">
            Everything You Need to Learn SQL
          </h2>
          <div className="home-page__features-grid">
            {features.map((f) => (
              <div key={f.title} className="home-page__feature-card">
                <div className="home-page__feature-icon">{f.icon}</div>
                <h3 className="home-page__feature-title">{f.title}</h3>
                <p className="home-page__feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-page__cta">
        <div className="container">
          <h2>Ready to Level Up Your SQL?</h2>
          <p>Join thousands of students practicing real SQL on real data.</p>
          <Link
            to={user ? "/assignments" : "/register"}
            className="btn btn--primary btn--lg"
          >
            {user ? "Continue Learning →" : "Create Free Account →"}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
