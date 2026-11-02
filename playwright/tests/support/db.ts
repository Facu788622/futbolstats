// ============================================================
// db.ts - READ-ONLY SQL queries against MySQL
// In Playwright the tests run in Node, so no "task" is needed as in
// Cypress: the database is queried directly.
//
// Connection variables (the same ones the backend uses):
//   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
// They are read from the environment (e.g. Jenkins) and, if not defined,
// from backend/.env. Anything already defined in the environment takes
// precedence.
// ============================================================
import path from "node:path";
import * as mysql from "mysql2/promise";

// Node >= 20.12: loads a .env without extra dependencies and does NOT
// override variables that are already defined
try {
  process.loadEnvFile(path.resolve(__dirname, "..", "..", "..", "backend", ".env"));
} catch {
  // If backend/.env does not exist, the environment variables are used
}

// Only for validating data: any statement that modifies it is rejected
const READ_ONLY = /^\s*(SELECT|DESCRIBE|DESC|SHOW|WITH)\b/i;

export async function consulta<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  if (!READ_ONLY.test(sql)) {
    throw new Error(`consulta() only allows read queries. Received: ${sql}`);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true, // dates as strings
  });

  try {
    // query() (text protocol) instead of execute(): it supports DESCRIBE and SHOW
    const [rows] = await connection.query(sql, params);
    return rows as T[];
  } finally {
    await connection.end();
  }
}
