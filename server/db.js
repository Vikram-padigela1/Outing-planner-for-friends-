import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const databasePath = path.join(dataDir, "planner.sqlite");
const database = new DatabaseSync(databasePath);

database.exec(`
  CREATE TABLE IF NOT EXISTS planner_sessions (
    id TEXT PRIMARY KEY,
    draft_json TEXT NOT NULL,
    result_json TEXT,
    updated_at TEXT NOT NULL
  )
`);

const getSessionStatement = database.prepare(`
  SELECT id, draft_json, result_json, updated_at
  FROM planner_sessions
  WHERE id = ?
`);

const upsertSessionStatement = database.prepare(`
  INSERT INTO planner_sessions (id, draft_json, result_json, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    draft_json = excluded.draft_json,
    result_json = excluded.result_json,
    updated_at = excluded.updated_at
`);

function safeParse(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function getPlannerSession(sessionId = "default") {
  const row = getSessionStatement.get(sessionId);
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    draft: safeParse(row.draft_json),
    result: safeParse(row.result_json),
    updatedAt: row.updated_at
  };
}

export function savePlannerSession({ sessionId = "default", draft, result }) {
  const updatedAt = new Date().toISOString();

  upsertSessionStatement.run(
    sessionId,
    JSON.stringify(draft),
    result ? JSON.stringify(result) : null,
    updatedAt
  );

  return getPlannerSession(sessionId);
}

export function getDatabasePath() {
  return databasePath;
}
