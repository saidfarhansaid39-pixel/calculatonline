#!/usr/bin/env node
/**
 * Post-build fix for the OpenNext -> wrangler handoff.
 *
 * OpenNext's @vercel/og patch rewrites the fallback font to a dynamic import of
 * a `.bin` file (so wrangler needs no .ttf loader). When esbuild externalizes
 * that import it can emit an ABSOLUTE path (observed on Windows builds), and
 * wrangler's module collector then does `path.join(handlerDir, specifier)`,
 * which produces a doubled path and fails with ENOENT at deploy time.
 *
 * This rewrites absolute specifiers that point inside the handler directory to
 * relative ones. It is a no-op when no such specifiers exist (e.g. builds that
 * already emit relative specifiers).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const handlerPath = path.join(
  root,
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs"
);

if (!existsSync(handlerPath)) {
  console.log("[cf-fix-og-import] handler.mjs not found, nothing to do");
  process.exit(0);
}

const handlerDir = path.dirname(handlerPath);
let code = readFileSync(handlerPath, "utf8");

const specifierPrefixes = [
  'import("',
  "import('",
  "import(`",
  'from "',
  "from '",
  'require("',
  "require('",
];

const absForms = [
  ...new Set([
    handlerDir,
    handlerDir.split(path.sep).join("/"),
    handlerDir.split(path.sep).join("\\"),
  ]),
];

let changed = 0;
for (const abs of absForms) {
  for (const prefix of specifierPrefixes) {
    const needle = `${prefix}${abs}/`;
    const replacement = `${prefix}./`;
    while (code.includes(needle)) {
      code = code.replace(needle, replacement);
      changed += 1;
    }
  }
}

if (changed > 0) {
  writeFileSync(handlerPath, code);
}

const leftover = code.match(/(?:import|require)\(\s*["'][A-Za-z]:[/\\][^"']*["']/g) ?? [];
console.log(
  `[cf-fix-og-import] rewrote ${changed} absolute specifier(s); ${leftover.length} windows-absolute specifier(s) remain`
);
if (leftover.length > 0) {
  console.log(leftover.slice(0, 5).join("\n"));
  process.exit(1);
}

// ------------------------------------------------------------------
// Materialize missing external asset imports.
//
// Next's nft trace does not list `Geist-Regular.ttf.bin` (the @vercel/og
// fallback font), so the traced handler dir lacks it while the import in
// handler.mjs points at it -> wrangler's module collector fails with ENOENT.
// Copy any unresolved `./` import target from the project tree when present.
// ------------------------------------------------------------------
const relImports = [...code.matchAll(/(?:import|require)\(\s*["'](\.\/[^"']+)["']\s*\)/g)].map(
  (m) => m[1]
);
const unresolved = [];
let copied = 0;
for (const spec of relImports) {
  const rel = spec.slice(2);
  const target = path.join(handlerDir, rel);
  if (existsSync(target)) continue;
  const source = path.join(root, rel);
  if (existsSync(source)) {
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(source, target);
    copied += 1;
    console.log(`[cf-fix-og-import] copied missing import target: ${rel}`);
  } else {
    unresolved.push(spec);
  }
}
console.log(`[cf-fix-og-import] ${copied} copied, ${unresolved.length} unresolved`);
if (unresolved.length > 0) {
  console.error(unresolved.join("\n"));
  process.exit(1);
}
