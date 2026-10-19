// A tiny JSON-file database behind two functions, so it can be swapped for a real
// database later without touching the rest of the app.
// Limitation: a file on disk does not persist on serverless hosting.
import fs from "node:fs";
import path from "node:path";

function dbPath() {
  return process.env.MOMENTUM_DB_PATH || path.join(process.cwd(), "data", "db.json");
}

function seedPath() {
  return path.join(process.cwd(), "data", "seed.json");
}

export function writeDb(db) {
  const file = dbPath();
  fs.mkdirSync(/*turbopackIgnore: true*/ path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(/*turbopackIgnore: true*/ tmp, JSON.stringify(db, null, 2));
  fs.renameSync(/*turbopackIgnore: true*/ tmp, file); // write then rename, so a crash never leaves half a file
}

export function readDb() {
  const file = dbPath();
  if (!fs.existsSync(/*turbopackIgnore: true*/ file)) {
    const seed = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ seedPath(), "utf8"));
    writeDb(seed);
    return seed;
  }
  return JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ file, "utf8"));
}
