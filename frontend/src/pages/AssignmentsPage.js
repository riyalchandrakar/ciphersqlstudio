import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { assignmentsAPI } from "../services/api";
import "../styles/pages/_assignments.scss";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const CATEGORIES = [
  "All",
  "SELECT",
  "JOIN",
  "Aggregation",
  "Subquery",
  "Window Functions",
];

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = {};
        if (difficultyFilter !== "All") params.difficulty = difficultyFilter;
        if (categoryFilter !== "All") params.category = categoryFilter;
        if (search.trim()) params.search = search.trim();
        const { data } = await assignmentsAPI.getAll(params);
        setAssignments(data.assignments);
      } catch (e) {
        setError("Failed to load assignments. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [difficultyFilter, categoryFilter, search]);

  return (
    <div className="assignments-page">
      <div className="container">
        <div className="assignments-page__header">
          <p className="assignments-page__header-eyebrow">Practice</p>
          <h1 className="assignments-page__header-title">SQL Assignments</h1>
          <p className="assignments-page__header-subtitle">
            Choose an assignment, write your query, and get instant feedback.
            Use the hint system when you're stuck.
          </p>
        </div>

        <div className="assignments-page__filters">
          <div className="assignments-page__filter-group">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                className={`assignments-page__filter-btn${
                  d !== "All"
                    ? ` assignments-page__filter-btn--${d.toLowerCase()}`
                    : ""
                }${difficultyFilter === d ? " assignments-page__filter-btn--active" : ""}`}
                onClick={() => setDifficultyFilter(d)}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="assignments-page__filter-group">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`assignments-page__filter-btn${
                  categoryFilter === c
                    ? " assignments-page__filter-btn--active"
                    : ""
                }`}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="assignments-page__search">
            <input
              className="input"
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!loading && (
          <p className="assignments-page__stats">
            Showing {assignments.length} assignment
            {assignments.length !== 1 ? "s" : ""}
          </p>
        )}

        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px",
              gap: "12px",
              color: "#8b91a8",
            }}
          >
            <span className="spinner spinner--lg" />
            <span>Loading assignments...</span>
          </div>
        ) : error ? (
          <div
            style={{ textAlign: "center", padding: "80px", color: "#ff4d6d" }}
          >
            {error}
          </div>
        ) : (
          <div className="assignments-page__grid">
            {assignments.length === 0 ? (
              <div className="assignments-page__empty">
                <span className="assignments-page__empty-icon">🔍</span>
                <span>No assignments found with those filters.</span>
              </div>
            ) : (
              assignments.map((a, i) => (
                <Link
                  key={a._id}
                  to={`/assignments/${a._id}`}
                  className="assignment-card"
                >
                  <div className="assignment-card__header">
                    <span className="assignment-card__category">
                      {a.category}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        className={`badge badge--${a.difficulty.toLowerCase()}`}
                      >
                        {a.difficulty}
                      </span>
                      <span className="assignment-card__number">#{i + 1}</span>
                    </div>
                  </div>

                  <h3 className="assignment-card__title">{a.title}</h3>
                  <p className="assignment-card__description">
                    {a.description}
                  </p>

                  <div className="assignment-card__footer">
                    <div className="assignment-card__tags">
                      {a.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="assignment-card__tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="assignment-card__arrow">→</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsPage;
