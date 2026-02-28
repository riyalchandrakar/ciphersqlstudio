/**
 * SQL Query Sanitizer & Validator
 * Blocks dangerous DDL/DML commands to keep the sandbox safe
 */

// Commands that are completely forbidden
const FORBIDDEN_KEYWORDS = [
  "DROP",
  "DELETE",
  "TRUNCATE",
  "INSERT",
  "UPDATE",
  "CREATE",
  "ALTER",
  "GRANT",
  "REVOKE",
  "EXEC",
  "EXECUTE",
  "CALL",
  "COPY",
  "pg_sleep",
  "pg_read_file",
  "pg_write_file",
  "lo_import",
  "lo_export",
  "LOAD",
];

// Patterns that suggest SQL injection attempts
const DANGEROUS_PATTERNS = [
  /;\s*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE)/gi,
  /--.*$/gm,
  /\/\*[\s\S]*?\*\//g,
  /xp_cmdshell/gi,
  /OPENROWSET/gi,
  /BULK\s+INSERT/gi,
];

/**
 * Validates and sanitizes a SQL query
 * @param {string} query - The SQL query to validate
 * @returns {{ isValid: boolean, error?: string, sanitized?: string }}
 */
const validateQuery = (query) => {
  if (!query || typeof query !== "string") {
    return { isValid: false, error: "Query must be a non-empty string." };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: "Query cannot be empty." };
  }

  if (trimmed.length > 5000) {
    return {
      isValid: false,
      error: "Query is too long (max 5000 characters).",
    };
  }

  // Check for forbidden keywords (word boundary check)
  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    if (regex.test(trimmed)) {
      return {
        isValid: false,
        error: `Query contains forbidden keyword: "${keyword}". Only SELECT queries are allowed.`,
      };
    }
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: "Query contains potentially dangerous patterns and was blocked.",
      };
    }
  }

  // Must start with SELECT or WITH (CTEs)
  if (!/^\s*(SELECT|WITH)\s/i.test(trimmed)) {
    return {
      isValid: false,
      error:
        "Only SELECT queries are allowed. Your query must start with SELECT or WITH.",
    };
  }

  return { isValid: true, sanitized: trimmed };
};

/**
 * Adds a query timeout wrapper
 * @param {string} query
 * @param {number} timeoutMs
 */
const wrapWithTimeout = (query, timeoutMs = 5000) => {
  return `SET statement_timeout = ${timeoutMs}; ${query}`;
};

module.exports = { validateQuery, wrapWithTimeout };
