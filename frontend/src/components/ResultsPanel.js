import React from "react";

const ResultsPanel = ({ result, error, isLoading }) => {
  const hasData = result && result.rows && result.rows.length > 0;
  const isEmpty = result && result.rows && result.rows.length === 0;

  const statusDotClass = error
    ? "attempt-page__results-title-dot--error"
    : hasData
      ? "attempt-page__results-title-dot--success"
      : "attempt-page__results-title-dot";

  return (
    <div className="attempt-page__results">
      <div className="attempt-page__results-header">
        <div className="attempt-page__results-title">
          <span
            className={`attempt-page__results-title-dot ${statusDotClass}`}
          />
          OUTPUT
        </div>
        {result && !error && (
          <span className="attempt-page__results-meta">
            {result.rowCount} row{result.rowCount !== 1 ? "s" : ""} ·{" "}
            {result.executionTime}ms
          </span>
        )}
      </div>

      <div className="attempt-page__results-body">
        {isLoading && (
          <div className="attempt-page__results-empty">
            <span className="spinner" />
            <span>Executing query...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="attempt-page__results-error">⚠ {error}</div>
        )}

        {!isLoading && !error && isEmpty && (
          <div className="attempt-page__results-empty">
            Query returned 0 rows
          </div>
        )}

        {!isLoading && !error && hasData && (
          <table className="results-table">
            <thead>
              <tr>
                {result.fields.map((f) => (
                  <th key={f.name}>{f.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i}>
                  {result.fields.map((f) => (
                    <td key={f.name} title={String(row[f.name] ?? "")}>
                      {row[f.name] === null ? (
                        <span style={{ color: "#565c7a", fontStyle: "italic" }}>
                          NULL
                        </span>
                      ) : (
                        String(row[f.name])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && !error && !result && (
          <div className="attempt-page__results-empty">
            ▶ Run your query to see results here
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
