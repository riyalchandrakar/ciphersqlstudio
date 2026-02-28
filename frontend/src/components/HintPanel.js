import React, { useState } from "react";
import { hintsAPI } from "../services/api";
import { useToast } from "../context/ToastContext";

const HintPanel = ({ assignment, currentQuery }) => {
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [totalHints, setTotalHints] = useState(0);
  const { showToast } = useToast();

  const fetchHint = async () => {
    setLoading(true);
    try {
      const { data } = await hintsAPI.getHint(
        assignment._id,
        currentQuery,
        hintLevel,
      );
      setHint(data.hint);
      setTotalHints((prev) => prev + 1);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to get hint", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hint-panel">
      <div>
        <p className="question-panel__section-title">Hint Level</p>
        <div className="hint-panel__level-selector">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              className={`hint-panel__level-btn${hintLevel === level ? " hint-panel__level-btn--active" : ""}`}
              onClick={() => setHintLevel(level)}
            >
              Level {level}
              <span
                style={{ fontSize: "0.7rem", marginLeft: "4px", opacity: 0.7 }}
              >
                {level === 1
                  ? "(Subtle)"
                  : level === 2
                    ? "(Medium)"
                    : "(Direct)"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn--primary"
        onClick={fetchHint}
        disabled={loading}
        style={{ background: "#7c6bff", color: "white" }}
      >
        {loading ? (
          <>
            <span className="spinner" style={{ borderTopColor: "white" }} />
            Getting hint...
          </>
        ) : (
          <>💡 Get Hint</>
        )}
      </button>

      {totalHints > 0 && (
        <p className="hint-panel__count">
          Hints used this session: {totalHints}
        </p>
      )}

      {loading && (
        <div className="hint-panel__loading">
          <span className="spinner" />
          <span>AI is thinking...</span>
        </div>
      )}

      {!loading && hint && <div className="hint-panel__hint-box">{hint}</div>}

      {!loading && !hint && (
        <div className="hint-panel__empty">
          <span className="hint-panel__empty-icon">🤔</span>
          <span>
            Stuck? Click "Get Hint" for AI-powered guidance.
            <br />
            The AI will guide your thinking — not give you the answer!
          </span>
        </div>
      )}
    </div>
  );
};

export default HintPanel;
