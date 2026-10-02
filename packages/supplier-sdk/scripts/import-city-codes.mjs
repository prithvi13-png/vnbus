/**
 * Regenerates src/srdv/city-codes.ts from SRDV's city_code export.
 *
 *   node scripts/import-city-codes.mjs ~/Downloads/city_code.json
 *
 * Accepts the phpMyAdmin JSON export SRDV ships (a header/database/table
 * wrapper around the rows) or a plain array of rows.
 *
 * Only CITY rows are kept. The AREA rows are boarding points — bus stands
 * inside a city — and are not valid search origins, so including them would
 * let a search resolve to a stop rather than a city.
 *
 * The output embeds the data as a JSON string rather than a literal array:
 * TypeScript would otherwise infer a 27,000-element tuple type and typechecking
 * would crawl. Parsing once at first use costs milliseconds.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const source = process.argv[2];

if (!source) {
  console.error("usage: node scripts/import-city-codes.mjs <city_code.json>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(resolve(source), "utf8"));
const rows = Array.isArray(raw)
  ? (raw.find((entry) => entry?.type === "table" && Array.isArray(entry.data))?.data ?? raw)
  : null;

if (!Array.isArray(rows) || rows.length === 0) {
  console.error("import-city-codes: no rows found — is this SRDV's city_code export?");
  process.exit(1);
}

const REQUIRED = ["cico_id", "cico_city_name", "cico_state_name", "cico_type"];
const missing = REQUIRED.filter((field) => !(field in rows[0]));

if (missing.length > 0) {
  console.error(`import-city-codes: rows are missing ${missing.join(", ")}`);
  process.exit(1);
}

const coordinate = (value) => {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? Math.round(parsed * 1e6) / 1e6 : 0;
};

const cities = rows
  .filter((row) => row.cico_type === "CITY")
  .map((row) => [
    String(row.cico_id),
    String(row.cico_city_name).trim(),
    String(row.cico_state_name).trim(),
    coordinate(row.cico_latitude),
    coordinate(row.cico_longitude),
  ])
  .sort((left, right) => Number(left[0]) - Number(right[0]));

if (cities.length === 0) {
  console.error("import-city-codes: export contained no CITY rows");
  process.exit(1);
}

const payload = JSON.stringify(JSON.stringify(cities));
const out = resolve(dirname(fileURLToPath(import.meta.url)), "../src/srdv/city-codes.ts");
const existing = readFileSync(out, "utf8");

// Keep whatever prose the file already carries; only the data line changes.
const regenerated = existing.replace(
  /const CITY_ROWS_JSON = "[\s\S]*?";\n/,
  `const CITY_ROWS_JSON = ${payload};\n`,
);

if (regenerated === existing) {
  console.error("import-city-codes: could not find CITY_ROWS_JSON to replace");
  process.exit(1);
}

writeFileSync(out, regenerated);

const skipped = rows.length - cities.length;
const located = cities.filter(([, , , lat, lon]) => lat !== 0 || lon !== 0).length;

console.log(`import-city-codes: wrote ${cities.length} cities to src/srdv/city-codes.ts`);
console.log(`  skipped ${skipped} non-CITY rows (AREA = boarding points)`);
console.log(`  ${located} carry coordinates`);
