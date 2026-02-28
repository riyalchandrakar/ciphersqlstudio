import React, { useState, useEffect } from "react";
import { queryAPI } from "../services/api";

const TablePreview = ({ tableName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await queryAPI.getSampleData(tableName);
        setData(res);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [tableName]);

  if (loading)
    return (
      <div
        style={{
          padding: "16px",
          color: "#565c7a",
          fontSize: "0.75rem",
          fontFamily: "var(--font-code)",
        }}
      >
        Loading {tableName}...
      </div>
    );

  if (error)
    return (
      <div style={{ padding: "16px", color: "#ff4d6d", fontSize: "0.75rem" }}>
        {error}
      </div>
    );

  if (!data?.rows?.length)
    return (
      <div style={{ padding: "16px", color: "#565c7a", fontSize: "0.75rem" }}>
        No data in {tableName}
      </div>
    );

  return (
    <div className="sample-data__scroll">
      <table className="results-table">
        <thead>
          <tr>
            {data.fields.map((f) => (
              <th key={f.name}>{f.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i}>
              {data.fields.map((f) => (
                <td key={f.name}>{String(row[f.name] ?? "NULL")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SampleDataViewer = ({ tables }) => {
  if (!tables?.length) {
    return (
      <p style={{ color: "#565c7a", fontSize: "0.875rem" }}>
        No tables available.
      </p>
    );
  }

  return (
    <div className="sample-data">
      {tables.map((table) => (
        <div key={table.tableName}>
          <div className="sample-data__table-header">
            <span className="sample-data__table-name">{table.tableName}</span>
            <span className="sample-data__count">first 10 rows</span>
          </div>
          <TablePreview tableName={table.tableName} />
        </div>
      ))}
    </div>
  );
};

export default SampleDataViewer;
