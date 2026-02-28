import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { attemptsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/pages/_assignments.scss";

const MyAttemptsPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await attemptsAPI.getMy();
        setAttempts(data.attempts);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "#8b91a8" }}>
        <p>
          Please <Link to="/login">log in</Link> to view your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="assignments-page">
      <div className="container">
        <div className="assignments-page__header">
          <p className="assignments-page__header-eyebrow">Progress</p>
          <h1 className="assignments-page__header-title">My Attempts</h1>
          <p className="assignments-page__header-subtitle">
            Track all the assignments you've worked on and revisit saved
            queries.
          </p>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px",
              gap: "12px",
              color: "#8b91a8",
            }}
          >
            <span className="spinner spinner--lg" />
          </div>
        ) : attempts.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "80px", color: "#8b91a8" }}
          >
            <p style={{ marginBottom: "16px" }}>
              You haven't attempted any assignments yet.
            </p>
            <Link to="/assignments" className="btn btn--primary">
              Browse Assignments →
            </Link>
          </div>
        ) : (
          <div className="assignments-page__grid">
            {attempts.map((attempt) => (
              <Link
                key={attempt._id}
                to={`/assignments/${attempt.assignment._id}`}
                className="assignment-card"
              >
                <div className="assignment-card__header">
                  <span className="assignment-card__category">
                    {attempt.assignment.category}
                  </span>
                  <span
                    className={`badge badge--${attempt.assignment.difficulty?.toLowerCase()}`}
                  >
                    {attempt.assignment.difficulty}
                  </span>
                </div>

                <h3 className="assignment-card__title">
                  {attempt.assignment.title}
                </h3>

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    fontSize: "0.75rem",
                    color: "#565c7a",
                    fontFamily: "var(--font-code)",
                  }}
                >
                  <span>📝 {attempt.queries?.length || 0} queries run</span>
                  <span>💡 {attempt.hintsUsed || 0} hints used</span>
                </div>

                {attempt.savedQuery && (
                  <div
                    style={{
                      background: "#1a1b26",
                      border: "1px solid #2a2d3e",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      fontFamily: "var(--font-code)",
                      fontSize: "0.7rem",
                      color: "#8b91a8",
                      maxHeight: "60px",
                      overflow: "hidden",
                      whiteSpace: "pre",
                    }}
                  >
                    {attempt.savedQuery}
                  </div>
                )}

                <div className="assignment-card__footer">
                  <span style={{ fontSize: "0.75rem", color: "#565c7a" }}>
                    Last active:{" "}
                    {new Date(attempt.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="assignment-card__arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttemptsPage;
