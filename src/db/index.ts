import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import { createClient } from "@libsql/client";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Two supported backends, picked at startup:
//  - Turso (libSQL over the network) when TURSO_DATABASE_URL is set — used
//    in production and whenever you want to develop against the real db.
//  - A local SQLite file under ./data (better-sqlite3) otherwise — zero
//    setup for quick local hacking without Turso credentials.
// Both are plain SQLite under the hood, so the same Drizzle schema
// (sqlite-core) and every query in the app work unchanged either way.
//
// better-sqlite3 is only require()'d lazily inside createLocalDb() below —
// it has a native binding that needs a working node-gyp/Python toolchain to
// compile. If you're only ever using Turso (TURSO_DATABASE_URL set), that
// binding is never touched, so `npm install` failing to build it (common on
// Windows without Python/Visual Studio build tools installed) doesn't block
// you — it's an optionalDependency in package.json for the same reason.

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const require = createRequire(import.meta.url);

type LocalSqliteHandle = { pragma: (sql: string) => unknown };

// Both drivers implement the same Drizzle SQLite query API (select/insert/
// update/delete/join) that the rest of the app relies on — only their
// underlying transport differs (network libSQL vs. a local file). Exporting
// a single canonical type here (rather than a union of the two drivers'
// distinct classes) keeps overload resolution for things like
// `.select({...}).innerJoin(...)` stable regardless of which backend is
// active, instead of TypeScript falling back to a looser common shape.
declare global {
  // eslint-disable-next-line no-var
  var __localSqlite: LocalSqliteHandle | undefined;
  // eslint-disable-next-line no-var
  var __db: LibSQLDatabase<typeof schema> | undefined;
}

function createTursoDb(): LibSQLDatabase<typeof schema> {
  const client = createClient({ url: tursoUrl!, authToken: tursoToken });
  return drizzleLibsql(client, { schema });
}

function createLocalDb(): LibSQLDatabase<typeof schema> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle: drizzleSqlite } = require("drizzle-orm/better-sqlite3");

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "app.db");

  const sqlite: LocalSqliteHandle = global.__localSqlite ?? new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  if (process.env.NODE_ENV !== "production") {
    global.__localSqlite = sqlite;
  }
  // better-sqlite3's driver is API-compatible with the libsql one for every
  // query shape this app uses; cast so the exported `db` has one stable type.
  return drizzleSqlite(sqlite, { schema }) as unknown as LibSQLDatabase<typeof schema>;
}

if (!tursoUrl && process.env.NODE_ENV === "production") {
  console.warn(
    "[db] TURSO_DATABASE_URL is not set — falling back to a local SQLite file. " +
      "This will NOT persist on most hosting platforms. Set TURSO_DATABASE_URL " +
      "and TURSO_AUTH_TOKEN for production."
  );
}

export const db = global.__db ?? (tursoUrl ? createTursoDb() : createLocalDb());

if (process.env.NODE_ENV !== "production") {
  global.__db = db;
}
