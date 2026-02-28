const { pool } = require("../config/postgres");
const { validateQuery } = require("../utils/sqlSanitizer");
const Attempt = require("../models/Attempt");

// @POST /api/query/execute
const executeQuery = async (req, res) => {
  const { sql, assignmentId } = req.body;

  if (!sql) {
    return res
      .status(400)
      .json({ success: false, message: "SQL query is required." });
  }

  const validation = validateQuery(sql);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.error,
      isValidationError: true,
    });
  }

  let client;
  const startTime = Date.now();

  try {
    client = await pool.connect();
    await client.query("SET statement_timeout = 8000");

    const result = await client.query(validation.sanitized);
    const executionTime = Date.now() - startTime;

    const response = {
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields
        ? result.fields.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID }))
        : [],
      executionTime,
      message: `Query returned ${result.rowCount} row(s) in ${executionTime}ms`,
    };

    if (req.user && assignmentId) {
      try {
        await Attempt.findOneAndUpdate(
          { user: req.user._id, assignment: assignmentId },
          {
            $push: {
              queries: {
                sql: validation.sanitized,
                wasSuccessful: true,
                rowCount: result.rowCount,
              },
            },
            $set: { savedQuery: validation.sanitized },
          },
          { upsert: true, new: true },
        );
      } catch (attemptError) {
        console.error("Failed to save attempt:", attemptError.message);
      }
    }

    res.json(response);
  } catch (error) {
    const executionTime = Date.now() - startTime;

    if (req.user && assignmentId) {
      try {
        await Attempt.findOneAndUpdate(
          { user: req.user._id, assignment: assignmentId },
          {
            $push: {
              queries: {
                sql: validation.sanitized || sql,
                wasSuccessful: false,
                errorMessage: error.message,
              },
            },
          },
          { upsert: true, new: true },
        );
      } catch (attemptError) {
        console.error("Failed to save failed attempt:", attemptError.message);
      }
    }

    res.status(400).json({
      success: false,
      message: error.message,
      isQueryError: true,
      executionTime,
    });
  } finally {
    if (client) client.release();
  }
};

// @GET /api/query/sample-data/:tableName
const getSampleData = async (req, res) => {
  const { tableName } = req.params;

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid table name." });
  }

  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT * FROM ${tableName} LIMIT 10`);
    res.json({
      success: true,
      tableName,
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields.map((f) => ({
        name: f.name,
        dataTypeID: f.dataTypeID,
      })),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: `Could not fetch data from table "${tableName}": ${error.message}`,
    });
  } finally {
    if (client) client.release();
  }
};

module.exports = { executeQuery, getSampleData };
