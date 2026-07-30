import path from "node:path";
import fs from "node:fs";
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
// better-sqlite3 is an optionalDependency (its native binding needs a
// working node-gyp/Python toolchain, which e.g. plain Windows without
// Visual Studio build tools doesn't have) — if you're only ever using Turso
// (TURSO_DATABASE_URL set), it may not be installed at all, and that's fine.
// The tricky part: Next.js's bundler (Turbopack/webpack) statically scans
// source text for `require("literal")` / `import ... from "literal"` and
// tries to resolve every one it finds — including ones inside an
// if-branch that never runs — and hard-fails the whole build/dev-server if
// the module isn't on disk. A plain `require("better-sqlite3")` guarded by
// `if (!tursoUrl)` is NOT enough to avoid this. `require("drizzle-orm/
// better-sqlite3")` isn't safe either: that package IS always installed
// (it's part of drizzle-orm), so the bundler happily opens it — and its
// own internal driver file does an unconditional `require("better-sqlite3")`
// that we don't control, which then fails the same way.
// The fix used below (`eval("require")`) obtains the real Node `require`
// through an expression bundlers don't statically parse as a module
// request, so neither module is ever added to the build graph unless this
// code path actually executes at runtime.
function nodeRequire(specifier: string): unknown {
  // eslint-disable-next-line no-eval
  return eval("require")(specifier);
}

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

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
  const Database = nodeRequire("better-sqlite3") as new (path: string) => LocalSqliteHandle;
  const { drizzle: drizzleSqlite } = nodeRequire("drizzle-orm/better-sqlite3") as {
    drizzle: (db: unknown, opts: { schema: typeof schema }) => unknown;
  };

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
