#!/usr/bin/env node

/**
 * check-deps.js
 * -------------
 * Generic dependency checker for any Node.js project.
 *
 * What it does:
 *   1. Reads package.json in the target project (default: current folder).
 *   2. Lists every dependency + devDependency declared there.
 *   3. Checks node_modules/ to see which ones are actually installed.
 *   4. For installed packages, does a best-effort check that the installed
 *      version satisfies the version range you declared (e.g. "^1.2.0").
 *   5. Prints a clear report: OK / MISSING / VERSION MISMATCH.
 *   6. If anything is missing, prints ready-to-run npm install commands.
 *
 * Usage:
 *   node check-deps.js                → checks package.json in current folder
 *   node check-deps.js /path/to/project → checks that project instead
 *
 * No external packages required -- only Node's built-in fs/path modules,
 * so you can drop this file into any project and run it immediately,
 * even before running `npm install`.
 */

const fs = require("fs");
const path = require("path");

// ---------- 1. Resolve which project we're checking ----------

const projectDir = path.resolve(process.argv[2] || ".");
const packageJsonPath = path.join(projectDir, "package.json");
const nodeModulesPath = path.join(projectDir, "node_modules");

if (!fs.existsSync(packageJsonPath)) {
  console.error(`No package.json found at: ${packageJsonPath}`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

// ---------- 2. Collect all declared dependencies ----------

// Tag each dependency with which section it came from, so we can generate
// the correct install flag later (--save vs --save-dev).
const sections = [
  { key: "dependencies", flag: "" },
  { key: "devDependencies", flag: "--save-dev" },
  { key: "optionalDependencies", flag: "--save-optional" },
];

const declared = []; // { name, range, flag }

for (const { key, flag } of sections) {
  const deps = pkg[key] || {};
  for (const [name, range] of Object.entries(deps)) {
    declared.push({ name, range, flag });
  }
}

if (declared.length === 0) {
  console.log("No dependencies declared in package.json. Nothing to check.");
  process.exit(0);
}

// ---------- 3. Minimal semver comparison (no external semver package) ----------

// Strips prerelease/build metadata (e.g. "1.2.0-beta.1" -> [1,2,0])
function parseVersion(v) {
  const clean = String(v).trim().replace(/^v/, "").split(/[-+]/)[0];
  return clean.split(".").map((n) => parseInt(n, 10) || 0);
}

// Returns -1, 0, or 1
function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

/**
 * Best-effort range check. Supports the common cases: ^, ~, >=, <=, >, <,
 * exact versions, and "*"/"latest"/"". Anything more complex (hyphen
 * ranges, ||, x-ranges) is reported as UNKNOWN rather than guessed at --
 * safer to say "please verify manually" than to silently give a wrong answer.
 */
function satisfies(installedVersion, range) {
  const r = String(range).trim();

  if (r === "" || r === "*" || r === "latest") return true;

  if (r.startsWith("^")) {
    const target = r.slice(1);
    const [tMajor, tMinor] = parseVersion(target);
    const [iMajor, iMinor] = parseVersion(installedVersion);
    if (tMajor > 0) {
      return iMajor === tMajor && compareVersions(installedVersion, target) >= 0;
    }
    // ^0.x.y is stricter: minor must also match
    return iMajor === 0 && iMinor === tMinor && compareVersions(installedVersion, target) >= 0;
  }

  if (r.startsWith("~")) {
    const target = r.slice(1);
    const [tMajor, tMinor] = parseVersion(target);
    const [iMajor, iMinor] = parseVersion(installedVersion);
    return iMajor === tMajor && iMinor === tMinor && compareVersions(installedVersion, target) >= 0;
  }

  if (r.startsWith(">=")) return compareVersions(installedVersion, r.slice(2)) >= 0;
  if (r.startsWith("<=")) return compareVersions(installedVersion, r.slice(2)) <= 0;
  if (r.startsWith(">")) return compareVersions(installedVersion, r.slice(1)) > 0;
  if (r.startsWith("<")) return compareVersions(installedVersion, r.slice(1)) < 0;

  // Exact version, e.g. "1.2.3"
  if (/^\d+\.\d+\.\d+/.test(r)) return compareVersions(installedVersion, r) === 0;

  return null; // complex range (workspace:, ||, hyphen ranges, git urls, etc.)
}

// ---------- 4. Check each declared dependency against node_modules ----------

const results = { ok: [], missing: [], mismatch: [], unknown: [] };

for (const dep of declared) {
  // Scoped packages (@scope/name) live at node_modules/@scope/name
  const depPath = path.join(nodeModulesPath, ...dep.name.split("/"));
  const depPkgJsonPath = path.join(depPath, "package.json");

  if (!fs.existsSync(depPkgJsonPath)) {
    results.missing.push(dep);
    continue;
  }

  let installedVersion;
  try {
    installedVersion = JSON.parse(fs.readFileSync(depPkgJsonPath, "utf-8")).version;
  } catch {
    results.unknown.push({ ...dep, installedVersion: "unreadable" });
    continue;
  }

  const ok = satisfies(installedVersion, dep.range);

  if (ok === true) {
    results.ok.push({ ...dep, installedVersion });
  } else if (ok === false) {
    results.mismatch.push({ ...dep, installedVersion });
  } else {
    results.unknown.push({ ...dep, installedVersion });
  }
}

// ---------- 5. Print the report ----------

console.log(`\nChecking dependencies for: ${pkg.name || "(unnamed project)"}`);
console.log(`Project path: ${projectDir}\n`);

console.log(`Installed & satisfied: ${results.ok.length}`);
console.log(`Missing:               ${results.missing.length}`);
console.log(`Version mismatch:      ${results.mismatch.length}`);
console.log(`Unverifiable range:    ${results.unknown.length}\n`);

if (results.missing.length > 0) {
  console.log("MISSING (not found in node_modules):");
  for (const d of results.missing) {
    console.log(`  - ${d.name}@${d.range}`);
  }
  console.log("");
}

if (results.mismatch.length > 0) {
  console.log("VERSION MISMATCH (installed, but doesn't satisfy declared range):");
  for (const d of results.mismatch) {
    console.log(`  - ${d.name}: have ${d.installedVersion}, need ${d.range}`);
  }
  console.log("");
}

if (results.unknown.length > 0) {
  console.log("COULD NOT VERIFY (complex range -- check manually):");
  for (const d of results.unknown) {
    console.log(`  - ${d.name}: have ${d.installedVersion}, declared ${d.range}`);
  }
  console.log("");
}

// ---------- 6. Generate ready-to-run install commands ----------

if (results.missing.length > 0) {
  console.log("Run this to install what's missing:\n");

  const byFlag = {};
  for (const d of results.missing) {
    byFlag[d.flag] = byFlag[d.flag] || [];
    byFlag[d.flag].push(d.name);
  }

  for (const [flag, names] of Object.entries(byFlag)) {
    const flagPart = flag ? ` ${flag}` : "";
    console.log(`  npm install ${names.join(" ")}${flagPart}`);
  }
  console.log("");
}

if (results.missing.length === 0 && results.mismatch.length === 0) {
  console.log("Everything declared in package.json is installed and satisfied.\n");
}

// Exit code 1 if anything is missing (useful in CI pipelines / pre-run checks)
process.exit(results.missing.length > 0 ? 1 : 0);
