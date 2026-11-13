#!/usr/bin/env node
// Generates both plugin trees from core/. Run from the repo root:
//   node tools/generate.mjs           write the trees
//   node tools/generate.mjs --check   exit non-zero if a tree is out of date or hand-edited

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const MARKER = "GENERATED from ";
const HOST_OPEN = /^<!-- host:(claude|codex) -->\s*$/;
const HOST_CLOSE = /^<!-- \/host -->\s*$/;

const CHECK = process.argv.includes("--check");
const drift = [];

function fail(message) {
  console.error(`generate: ${message}`);
  process.exit(1);
}

const posix = (p) => p.split(path.sep).join("/");
const lf = (s) => s.replace(/\r\n?/g, "\n");
const trailingLf = (s) => (s.endsWith("\n") ? s : `${s}\n`);

function read(file) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) fail(`missing core source: ${file}`);
  return lf(fs.readFileSync(abs, "utf8"));
}

function listFiles(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const e of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const child = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listFiles(child));
    else if (e.isFile()) out.push(posix(child));
  }
  return out;
}

// Keep only the blocks belonging to `host`. A marker sharing its line with other text is not
// recognised and would leak into BOTH trees, so that is an error rather than a silent pass.
function selectHost(raw, host, source) {
  const kept = [];
  let active = null;
  raw.split("\n").forEach((line, i) => {
    const open = line.match(HOST_OPEN);
    if (open) {
      if (active) fail(`${source}:${i + 1}: nested host marker inside host:${active}`);
      active = open[1];
      return;
    }
    if (HOST_CLOSE.test(line)) {
      if (!active) fail(`${source}:${i + 1}: closing host marker without an open marker`);
      active = null;
      return;
    }
    if (/<!-- (host:|\/host)/.test(line)) {
      fail(`${source}:${i + 1}: host marker must sit alone on its line`);
    }
    if (!active || active === host) kept.push(line);
  });
  if (active) fail(`${source}: unclosed host:${active} marker`);
  return kept.join("\n");
}

function splitFrontmatter(content, source) {
  if (!content.startsWith("---\n")) return { attrs: null, body: content };
  const end = content.indexOf("\n---\n", 4);
  if (end < 0) fail(`${source}: frontmatter opened but not closed`);
  const attrs = {};
  for (const line of content.slice(4, end).split("\n")) {
    if (!line.trim()) continue;
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) fail(`${source}: unsupported frontmatter line: ${line}`);
    attrs[m[1]] = m[2];
  }
  return { attrs, body: content.slice(end + 5) };
}

function renderFrontmatter(attrs) {
  return `---\n${Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join("\n")}\n---\n`;
}

// The marker goes AFTER the frontmatter: a comment before it breaks frontmatter parsing on both
// hosts. Files without frontmatter take it on line 1.
function withMarker(source, target, body) {
  const comment = path.extname(target) === ".yml" ? "#" : "<!--";
  const close = comment === "#" ? "" : " -->";
  const header = `${comment} ${MARKER}${source} — edit the core file and run node tools/generate.mjs; hand edits will be overwritten${close}`;
  const text = trailingLf(body);
  if (text.startsWith("---\n")) {
    const end = text.indexOf("\n---\n", 4);
    return `${text.slice(0, end + 5)}${header}\n${text.slice(end + 5)}`;
  }
  return `${header}\n${text}`;
}

function write(target, content) {
  const abs = path.join(ROOT, target);
  const next = trailingLf(content);
  if (CHECK) {
    const current = fs.existsSync(abs) ? lf(fs.readFileSync(abs, "utf8")) : null;
    if (current !== next) drift.push(target);
    return;
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, next, "utf8");
}

// --- the Codex transform: sigil + frontmatter ------------------------------------------------
// Claude is canonical in core/ (`/crew:x`, `allowed-tools`); Codex uses `$crew-x` and takes a
// `name` instead. Everything else is identical, which is why there is no third source tree.
const toCodexSigil = (text) => text.replace(/\/crew:([a-z-]+)/g, "$crew-$1");

function codexFrontmatter(attrs, name) {
  if (!attrs) return null;
  const out = { name };
  if (attrs.description) out.description = toCodexSigil(attrs.description);
  return out;
}

function emit(source, claudeTarget, codexTarget, codexName) {
  const raw = read(source);

  const claudeBody = selectHost(raw, "claude", source);
  write(claudeTarget, withMarker(source, claudeTarget, claudeBody));

  const codexRaw = selectHost(raw, "codex", source);
  const { attrs, body } = splitFrontmatter(codexRaw, source);
  const codexAttrs = codexFrontmatter(attrs, codexName);
  const codexBody = codexAttrs
    ? renderFrontmatter(codexAttrs) + toCodexSigil(body)
    : toCodexSigil(codexRaw);
  write(codexTarget, withMarker(source, codexTarget, codexBody));
}

// --- the map ---------------------------------------------------------------------------------
emit("core/skill.md", "skills/crew/SKILL.md", "codex/skills/crew-core/SKILL.md", "crew-core");

for (const file of listFiles("core/commands")) {
  const name = path.basename(file, ".md");
  emit(file, `commands/${name}.md`, `codex/skills/crew-${name}/SKILL.md`, `crew-${name}`);
}

for (const file of listFiles("core")) {
  if (file.startsWith("core/commands/") || file === "core/skill.md") continue;
  const rel = file.slice("core/".length);
  const sub = rel.startsWith("templates/") ? rel : `references/${rel}`;
  emit(file, `skills/crew/${sub}`, `codex/skills/crew-core/${sub}`, null);
}

// --- report ----------------------------------------------------------------------------------
if (CHECK) {
  if (drift.length) {
    console.error(`generate --check: ${drift.length} file(s) out of date:`);
    for (const f of drift) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log("generate --check: both trees match core/");
} else {
  console.log("generate: wrote skills/crew, commands/ and codex/skills/");
}
