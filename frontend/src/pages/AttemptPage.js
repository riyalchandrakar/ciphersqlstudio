import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { assignmentsAPI, queryAPI, attemptsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SchemaViewer from "../components/SchemaViewer";
import SampleDataViewer from "../components/SampleDataViewer";
import HintPanel from "../components/HintPanel";
import ResultsPanel from "../components/ResultsPanel";
import "../styles/pages/_attempt.scss";

const LEFT_TABS = ["Question", "Schema", "Data", "Hints"];

const AttemptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leftTab, setLeftTab] = useState("Question");
  const [query, setQuery] = useState("-- Write your SQL query here\nSELECT ");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);

  // Load assignment + previous attempt
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await assignmentsAPI.getById(id);
        setAssignment(data.assignment);

        if (user) {
          try {
            const { data: attemptData } = await attemptsAPI.getByAssignment(id);
            if (attemptData.attempt?.savedQuery) {
              setQuery(attemptData.attempt.savedQuery);
            }
          } catch {
            // no previous attempt, use default
          }
        }
      } catch (e) {
        showToast("Assignment not found", "error");
        navigate("/assignments");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, user, navigate, showToast]);

  const runQuery = useCallback(async () => {
    if (!query.trim()) return;
    setExecuting(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await queryAPI.execute(query, id);
      setResult(data);
      showToast(
        `✓ ${data.rowCount} rows returned in ${data.executionTime}ms`,
        "success",
        2500,
      );
    } catch (e) {
      const msg = e.response?.data?.message || "Query execution failed";
      setError(msg);
      if (!e.response?.data?.isValidationError) {
        showToast("Query error — check output panel", "error");
      }
    } finally {
      setExecuting(false);
    }
  }, [query, id, showToast]);

  const saveQuery = async () => {
    if (!user) {
      showToast("Log in to save your query", "info");
      return;
    }
    setSaving(true);
    try {
      await attemptsAPI.saveQuery(id, query);
      showToast("Query saved!", "success");
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runQuery();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runQuery]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.addCommand(
      // Monaco KeyMod.CtrlCmd | Monaco.KeyCode.Enter
      2048 | 3,
      runQuery,
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 68px)",
          gap: "12px",
          color: "#8b91a8",
        }}
      >
        <span className="spinner spinner--lg" />
        <span>Loading assignment...</span>
      </div>
    );
  }

  if (!assignment) return null;

  return (
    <div className="attempt-page">
      {/* Top toolbar */}
      <div className="attempt-page__toolbar">
        <div className="attempt-page__toolbar-left">
          <Link to="/assignments" className="attempt-page__back-btn">
            ← Back
          </Link>
          <h1 className="attempt-page__assignment-title">{assignment.title}</h1>
          <span
            className={`badge badge--${assignment.difficulty.toLowerCase()}`}
          >
            {assignment.difficulty}
          </span>
        </div>
        <div className="attempt-page__toolbar-right">
          {user && (
            <button
              className="btn btn--secondary btn--sm"
              onClick={saveQuery}
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save Query"}
            </button>
          )}
          {!user && (
            <Link to="/login" className="btn btn--ghost btn--sm">
              Login to save
            </Link>
          )}
        </div>
      </div>

      <div className="attempt-page__body">
        {/* Left panel */}
        <div className="attempt-page__left-panel">
          <div className="attempt-page__panel-tabs">
            {LEFT_TABS.map((tab) => (
              <button
                key={tab}
                className={`attempt-page__panel-tab${leftTab === tab ? " attempt-page__panel-tab--active" : ""}`}
                onClick={() => setLeftTab(tab)}
              >
                {tab === "Hints" ? "💡 " : ""}
                {tab}
              </button>
            ))}
          </div>

          <div className="attempt-page__panel-content scrollable">
            {leftTab === "Question" && (
              <div className="question-panel">
                <p className="question-panel__section-title">Problem</p>
                <div className="question-panel__question">
                  {assignment.question}
                </div>

                {assignment.expectedOutputDescription && (
                  <>
                    <p className="question-panel__section-title">
                      Expected Output
                    </p>
                    <p className="question-panel__expected">
                      {assignment.expectedOutputDescription}
                    </p>
                  </>
                )}

                {assignment.tags?.length > 0 && (
                  <>
                    <p className="question-panel__section-title">Concepts</p>
                    <div className="question-panel__tags">
                      {assignment.tags.map((tag) => (
                        <span
                          key={tag}
                          className="badge"
                          style={{
                            color: "#8b91a8",
                            background: "#1a1b26",
                            border: "1px solid #2a2d3e",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {leftTab === "Schema" && (
              <SchemaViewer tables={assignment.tables} />
            )}

            {leftTab === "Data" && (
              <SampleDataViewer tables={assignment.tables} />
            )}

            {leftTab === "Hints" && (
              <HintPanel assignment={assignment} currentQuery={query} />
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="attempt-page__right-panel">
          <div className="attempt-page__editor-area">
            <div className="attempt-page__editor-header">
              <span className="attempt-page__editor-label">SQL Editor</span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#565c7a",
                  fontFamily: "var(--font-code)",
                }}
              >
                Ctrl+Enter to run
              </span>
            </div>

            <div className="attempt-page__monaco-wrapper">
              <Editor
                height="100%"
                defaultLanguage="sql"
                value={query}
                onChange={(val) => setQuery(val || "")}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  lineNumbers: "on",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                  padding: { top: 16 },
                  suggest: { showFields: true },
                  quickSuggestions: true,
                  bracketPairColorization: { enabled: true },
                }}
              />
            </div>

            <div className="attempt-page__run-bar">
              <span className="attempt-page__run-meta">
                {assignment.tables.map((t) => t.tableName).join(", ")}
              </span>
              <div className="attempt-page__run-actions">
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => {
                    setQuery("-- Write your SQL query here\nSELECT ");
                    setResult(null);
                    setError(null);
                  }}
                >
                  Clear
                </button>
                <button
                  className="btn btn--primary"
                  onClick={runQuery}
                  disabled={executing || !query.trim()}
                >
                  {executing ? (
                    <>
                      <span
                        className="spinner"
                        style={{ borderTopColor: "#0d0e14" }}
                      />
                      Running...
                    </>
                  ) : (
                    "▶ Run Query"
                  )}
                </button>
              </div>
            </div>
          </div>

          <ResultsPanel result={result} error={error} isLoading={executing} />
        </div>
      </div>
    </div>
  );
};

export default AttemptPage;
