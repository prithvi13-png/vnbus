/**
 * Loads the built package the way Node will in production and fails the build
 * if it cannot be imported.
 *
 * This exists because the test suites cannot catch the failure it guards
 * against: every jest config maps "@vnbus/supplier-sdk" to src/, so a dist that
 * Node refuses to load still shows a fully green suite. That is exactly what
 * happened — the package is "type": "module" while tsconfig uses
 * moduleResolution "Bundler", so TypeScript accepted extensionless relative
 * imports and emitted them unchanged, and Node's ESM loader rejected them with
 * ERR_MODULE_NOT_FOUND. The API could not boot at all.
 *
 * Importing the entry point is the real assertion: it resolves the whole
 * relative-import graph. The named-export check then confirms the SRDV surface
 * actually reached the artifact rather than being silently tree-shaken away.
 */

import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const entry = resolve(import.meta.dirname, "../dist/index.js");

const REQUIRED_EXPORTS = [
  "SrdvBusAdapter",
  "SrdvClient",
  "SrdvApiError",
  "MockSupplierAdapter",
  "SUPPLIER_CODES",
];

let module;

try {
  module = await import(pathToFileURL(entry).href);
} catch (error) {
  console.error("verify-dist: the built package failed to load under Node.\n");
  console.error(`  ${error.code ?? error.name}: ${error.message.split("\n")[0]}`);
  console.error(
    "\n  Relative imports in an ESM package need explicit file extensions" +
      '\n  (import "./thing.js", not "./thing").',
  );
  process.exit(1);
}

const missing = REQUIRED_EXPORTS.filter((name) => module[name] === undefined);

if (missing.length > 0) {
  console.error(`verify-dist: built package is missing exports: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`verify-dist: ok (${REQUIRED_EXPORTS.length} exports present)`);
