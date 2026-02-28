import React, { useState } from "react";

const SchemaViewer = ({ tables }) => {
  const [openTables, setOpenTables] = useState(() => {
    const initial = {};
    tables?.forEach((t) => (initial[t.tableName] = true));
    return initial;
  });

  const toggle = (name) =>
    setOpenTables((prev) => ({ ...prev, [name]: !prev[name] }));

  if (!tables?.length) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        No schema available.
      </p>
    );
  }

  return (
    <div className="schema-viewer">
      {tables.map((table) => (
        <div key={table.tableName} className="schema-viewer__table">
          <div
            className="schema-viewer__table-header"
            onClick={() => toggle(table.tableName)}
          >
            <div>
              <div className="schema-viewer__table-name">{table.tableName}</div>
              {table.description && (
                <div className="schema-viewer__table-desc">
                  {table.description}
                </div>
              )}
            </div>
            <span
              className={`schema-viewer__table-chevron${
                openTables[table.tableName]
                  ? " schema-viewer__table-chevron--open"
                  : ""
              }`}
            >
              ⌄
            </span>
          </div>

          {openTables[table.tableName] && (
            <div className="schema-viewer__columns">
              {table.columns.map((col) => (
                <div key={col.name} className="schema-viewer__column">
                  <span className="schema-viewer__column-name">{col.name}</span>
                  <span className="schema-viewer__column-type">{col.type}</span>
                  <span className="schema-viewer__column-constraint">
                    {col.constraints}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SchemaViewer;
