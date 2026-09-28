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
import { readFileSync, writeFileSync, existsSync } from "node:fs";
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
}
