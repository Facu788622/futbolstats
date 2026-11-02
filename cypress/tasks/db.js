// ============================================================
// cypress/tasks/db.js
// Cypress task to run READ-ONLY SQL queries against MySQL.
// It runs in the Cypress Node process (not in the browser), so the
// credentials never reach the browser.
//
// Connection variables (the same ones the backend uses):
//   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
// They are read from the environment (e.g. Jenkins job variables) and, if
// not defined, from backend/.env. Anything already defined in the
// environment takes precedence.
// ============================================================
const path = require("path");
const mysql = require("mysql2/promise");

// Node >= 20.12: loads a .env without extra dependencies and does NOT
// override variables that are already defined
try {
  process.loadEnvFile(path.join(__dirname, "..", "..", "backend", ".env"));
} catch (_) {
  // If backend/.env does not exist, the environment variables are used
}

// This task is only for validating data: any statement that modifies it is rejected
const READ_ONLY = /^\s*(SELECT|DESCRIBE|DESC|SHOW|WITH)\b/i;

async function consultar({ sql, params = [] }) {
  if (!READ_ONLY.test(sql)) {
    throw new Error(`db:query only allows read queries. Received: ${sql}`);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true, // dates as strings, to serialize to JSON without surprises
  });

  try {
    // query() (text protocol) instead of execute(): it supports DESCRIBE and SHOW
    const [rows] = await connection.query(sql, params);
    // cy.task serializes to JSON: normalize to return plain objects
    return JSON.parse(JSON.stringify(rows));
  } finally {
    await connection.end();
  }
}

module.exports = { consultar };
