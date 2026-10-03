/**
 * Regenerates src/srdv/city-codes.ts from SRDV's city_code export.
 *
 *   node scripts/import-city-codes.mjs ~/Downloads/city_code.csv
 *   node scripts/import-city-codes.mjs ~/Downloads/city_code.json
 *
 * Accepts either phpMyAdmin export SRDV ships:
 *   - CSV: no header, columns cico_id, cico_city_name, cico_state_name,
 *     cico_type, cico_latitude, cico_longitude.
 *   - JSON: a header/database/table wrapper around the rows, or a plain array.
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
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const source = process.argv[2];

if (!source) {
  console.error("usage: node scripts/import-city-codes.mjs <city_code.csv | city_code.json>");
  process.exit(1);
}

const CSV_COLUMNS = [
  "cico_id",
  "cico_city_name",
  "cico_state_name",
  "cico_type",
  "cico_latitude",
  "cico_longitude",
];

/** RFC 4180 fields: quoted or bare, "" escapes a quote inside quotes. */
const parseCsv = (text) => {
  const records = [];
  let record = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records.filter((fields) => fields.some((value) => value !== ""));
};

const readCsvRows = (text) => {
  const records = parseCsv(text);
  const malformed = records.findIndex((fields) => fields.length !== CSV_COLUMNS.length);

  if (malformed !== -1) {
    console.error(
      `import-city-codes: CSV line ${malformed + 1} has ${records[malformed].length} columns, expected ${CSV_COLUMNS.length}`,
    );
    process.exit(1);
  }

  // phpMyAdmin may include a header row; skip it if present.
  const body = records[0]?.[0] === "cico_id" ? records.slice(1) : records;

  return body.map((fields) =>
    Object.fromEntries(CSV_COLUMNS.map((column, index) => [column, fields[index]])),
  );
};

const readJsonRows = (text) => {
  const raw = JSON.parse(text);

  return Array.isArray(raw)
    ? (raw.find((entry) => entry?.type === "table" && Array.isArray(entry.data))?.data ?? raw)
    : null;
};

const text = readFileSync(resolve(source), "utf8");
const rows = extname(source).toLowerCase() === ".csv" ? readCsvRows(text) : readJsonRows(text);

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

// Written the way Prettier formats it (single-quoted, on its own line), so a
// re-import of unchanged data leaves the file byte-for-byte the same.
const json = JSON.stringify(cities);
const literal = `'${json.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
const out = resolve(dirname(fileURLToPath(import.meta.url)), "../src/srdv/city-codes.ts");
const existing = readFileSync(out, "utf8");
// Matches the data line in either quote style, before or after Prettier.
const DATA_LINE = /const CITY_ROWS_JSON =\s*(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1;\n/;

if (!DATA_LINE.test(existing)) {
  console.error("import-city-codes: could not find CITY_ROWS_JSON to replace");
  process.exit(1);
}

// Keep whatever prose the file already carries; only the data line changes.
const regenerated = existing.replace(DATA_LINE, () => `const CITY_ROWS_JSON =\n  ${literal};\n`);

writeFileSync(out, regenerated);

const skipped = rows.length - cities.length;
const located = cities.filter(([, , , lat, lon]) => lat !== 0 || lon !== 0).length;

console.log(
  `import-city-codes: wrote ${cities.length} cities to src/srdv/city-codes.ts` +
    (regenerated === existing ? " (unchanged)" : ""),
);
console.log(`  skipped ${skipped} non-CITY rows (AREA = boarding points)`);
console.log(`  ${located} carry coordinates`);
