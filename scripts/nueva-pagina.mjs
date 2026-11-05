#!/usr/bin/env node
// =====================================================================
// Crea una página nueva en paginas/, con su CSS/JS/imágenes en su
// sitio, y abre la Pull Request que la solicita.
//
// Uso:
//   node scripts/nueva-pagina.mjs <carpeta-o-index.html> [opciones]
//
// Opciones:
//   --titulo "Mi idea"       (si no, se pregunta)
//   --autor "Mi nombre"      (si no: git config user.name, o se pregunta)
//   --css ruta/estilo.css    (si <carpeta> no trae ya un .css dentro)
//   --js  ruta/script.js     (si <carpeta> no trae ya un .js dentro)
//   --no-pr                  crea la carpeta y el commit, pero no empuja
//                             la rama ni abre la Pull Request
//
// Sin dependencias de npm. Funciona con o sin `gh` instalado: si no
// está, te da el enlace para abrir la Pull Request a mano.
// =====================================================================

import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, cpSync,
} from "node:fs";
import { join, basename, extname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const ROOT = process.cwd();
const REPO_SLUG = "Thaliesin/eltiburon.win"; // usuario/repo — ver CLAUDE.md si cambia
const [REPO_OWNER, REPO_NAME] = REPO_SLUG.split("/");

// Construye la URL para abrir la Pull Request, tanto si se trabaja
// clonando el repo original (con acceso de escritura) como desde un
// fork propio (lo habitual para colaboradores, al ser un repo público).
function buildCompareUrl(branch) {
  const originUrl = tryRun("git", ["remote", "get-url", "origin"]) || "";
  const m = originUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/i);
  const originOwner = m ? m[1] : REPO_OWNER;
  if (originOwner.toLowerCase() === REPO_OWNER.toLowerCase()) {
    return `https://github.com/${REPO_SLUG}/compare/main...${branch}?expand=1`;
  }
  // origin es un fork: sintaxis de comparación entre repos distintos.
  return `https://github.com/${REPO_SLUG}/compare/main...${originOwner}:${REPO_NAME}:${branch}?expand=1`;
}

function die(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", ...opts }).trim();
}

function tryRun(cmd, args, opts = {}) {
  try {
    return run(cmd, args, opts);
  } catch {
    return null;
  }
}

function hasCommand(cmd) {
  const probe = process.platform === "win32" ? "where" : "which";
  const r = spawnSync(probe, [cmd], { stdio: "ignore" });
  return r.status === 0;
}

async function ask(rl, question, fallback = "") {
  const answer = (await rl.question(fallback ? `${question} [${fallback}] ` : `${question} `)).trim();
  return answer || fallback;
}

function slugifyPart(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--titulo") out.titulo = argv[++i];
    else if (a === "--autor") out.autor = argv[++i];
    else if (a === "--css") out.css = argv[++i];
    else if (a === "--js") out.js = argv[++i];
    else if (a === "--no-pr") out.noPr = true;
    else out._.push(a);
  }
  return out;
}

function ensureHeadMeta(html, autor) {
  let out = html;
  if (!/<meta\s+name=["']autor["']/i.test(out)) {
    const metaTag = `<meta name="autor" content="${autor.replace(/"/g, "&quot;")}">`;
    if (/<\/title>/i.test(out)) {
      out = out.replace(/<\/title>/i, (m) => `${m}\n${metaTag}`);
    } else if (/<head[^>]*>/i.test(out)) {
      out = out.replace(/<head[^>]*>/i, (m) => `${m}\n${metaTag}`);
    } else {
      out = `${metaTag}\n${out}`;
    }
  }
  return out;
}

function rewriteLocalRef(html, tag, attr, originalBasename, absolutePath) {
  if (!originalBasename) return html;
  const re = new RegExp(`(<${tag}[^>]*\\s${attr}\\s*=\\s*["'])([^"']*${originalBasename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(["'])`, "i");
  if (re.test(html)) return html.replace(re, `$1${absolutePath}$3`);
  return html;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const srcArg = args._[0];
  if (!srcArg) {
    die(
      "Falta la carpeta o el index.html de tu página.\n" +
        "   Uso: node scripts/nueva-pagina.mjs <carpeta-o-index.html> [--titulo \"...\"] [--autor \"...\"]",
    );
  }
  const srcPath = resolve(ROOT, srcArg);
  if (!existsSync(srcPath)) die(`No existe "${srcArg}".`);

  const srcIsDir = statSync(srcPath).isDirectory();
  const srcDir = srcIsDir ? srcPath : null;
  const srcHtmlPath = srcIsDir ? join(srcPath, "index.html") : srcPath;
  if (!existsSync(srcHtmlPath)) die(`No encuentro "${srcIsDir ? join(srcArg, "index.html") : srcArg}".`);

  const rl = createInterface({ input: stdin, output: stdout });

  const titulo = args.titulo || (await ask(rl, "Título de tu idea:"));
  if (!titulo) die("El título no puede estar vacío.");

  const gitName = tryRun("git", ["config", "user.name"]);
  const autor = args.autor || (await ask(rl, "Tu nombre:", gitName || ""));
  if (!autor) die("El autor no puede estar vacío.");

  rl.close();

  const slug = `${todayISO()}-${slugifyPart(autor)}-${slugifyPart(titulo)}`;
  const destDir = join(ROOT, "paginas", slug);
  if (existsSync(destDir)) die(`"paginas/${slug}" ya existe (¿ya creaste esta página hoy?).`);

  console.log(`\nCreando paginas/${slug}/ ...`);
  mkdirSync(destDir, { recursive: true });

  // Copiar el contenido
  let html = readFileSync(srcHtmlPath, "utf8");
  let cssBasename = null;
  let jsBasename = null;

  if (srcIsDir) {
    for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
      if (entry.name === "index.html") continue;
      const full = join(srcDir, entry.name);
      const ext = extname(entry.name).toLowerCase();
      if (ext === ".css" && !entry.isDirectory()) {
        cssBasename = entry.name;
        continue; // se coloca en css/paginas/, no dentro de la carpeta de la página
      }
      if (ext === ".js" && !entry.isDirectory()) {
        jsBasename = entry.name;
        continue; // se coloca en js/paginas/
      }
      cpSync(full, join(destDir, entry.name), { recursive: true });
    }
  }

  const cssSrc = args.css ? resolve(ROOT, args.css) : cssBasename ? join(srcDir, cssBasename) : null;
  const jsSrc = args.js ? resolve(ROOT, args.js) : jsBasename ? join(srcDir, jsBasename) : null;

  if (cssSrc) {
    if (!existsSync(cssSrc)) die(`No existe el CSS indicado: ${cssSrc}`);
    mkdirSync(join(ROOT, "css", "paginas"), { recursive: true });
    cpSync(cssSrc, join(ROOT, "css", "paginas", `${slug}.css`));
    html = rewriteLocalRef(html, "link", "href", basename(cssSrc), `/css/paginas/${slug}.css`);
    if (!new RegExp(`/css/paginas/${slug}\\.css`).test(html)) {
      html = html.replace(/<\/head>/i, `  <link rel="stylesheet" href="/css/paginas/${slug}.css">\n</head>`);
    }
    console.log(`  css/paginas/${slug}.css`);
  }
  if (jsSrc) {
    if (!existsSync(jsSrc)) die(`No existe el JS indicado: ${jsSrc}`);
    mkdirSync(join(ROOT, "js", "paginas"), { recursive: true });
    cpSync(jsSrc, join(ROOT, "js", "paginas", `${slug}.js`));
    html = rewriteLocalRef(html, "script", "src", basename(jsSrc), `/js/paginas/${slug}.js`);
    if (!new RegExp(`/js/paginas/${slug}\\.js`).test(html)) {
      html = html.replace(/<\/body>/i, `  <script src="/js/paginas/${slug}.js"></script>\n</body>`);
    }
    console.log(`  js/paginas/${slug}.js`);
  }

  html = ensureHeadMeta(html, autor);
  if (!/<title>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  <title>${titulo.replace(/</g, "&lt;")}</title>`);
  }

  writeFileSync(join(destDir, "index.html"), html);
  console.log(`  paginas/${slug}/index.html`);

  if (args.noPr) {
    console.log("\n✅ Carpeta creada. No se ha tocado git (--no-pr).");
    return;
  }

  // --- git: rama, commit, push ---
  const branch = `pagina/${slug}`;
  console.log(`\nPreparando la Pull Request (rama ${branch}) ...`);

  const base = tryRun("git", ["rev-parse", "--abbrev-ref", "HEAD"]) || "main";
  // Si existe un remoto "upstream" (convención habitual al trabajar desde
  // un fork), parte de ahí para no arrancar de un main desactualizado.
  const hasUpstream = !!tryRun("git", ["remote", "get-url", "upstream"]);
  const remoteForBase = hasUpstream ? "upstream" : "origin";
  tryRun("git", ["fetch", remoteForBase, "main"]);
  const baseRef = tryRun("git", ["rev-parse", "--verify", `${remoteForBase}/main`])
    ? `${remoteForBase}/main`
    : "main";

  try {
    run("git", ["checkout", "-b", branch, baseRef]);
  } catch (e) {
    die(`No se pudo crear la rama "${branch}": ${e.message}`);
  }

  const toAdd = [`paginas/${slug}`];
  if (cssSrc) toAdd.push(`css/paginas/${slug}.css`);
  if (jsSrc) toAdd.push(`js/paginas/${slug}.js`);
  run("git", ["add", ...toAdd]);
  run("git", ["commit", "-m", `Nueva página: ${slug}`]);

  try {
    run("git", ["push", "-u", "origin", branch]);
  } catch (e) {
    console.log(`\n⚠️  No se pudo subir la rama automáticamente (${e.message.split("\n")[0]}).`);
    console.log(`   Súbela a mano con: git push -u origin ${branch}`);
    run("git", ["checkout", base]);
    return;
  }

  const prTitle = `Nueva página: ${titulo}`;
  const prBody = `### Autor\n${autor}\n\n### Título de la idea\n${titulo}\n\n### Descripción\n\n`;

  if (hasCommand("gh")) {
    const r = spawnSync(
      "gh",
      ["pr", "create", "--title", prTitle, "--body", prBody, "--base", "main", "--head", branch],
      { cwd: ROOT, stdio: "inherit" },
    );
    if (r.status !== 0) {
      console.log("\n⚠️  `gh pr create` falló; abre la Pull Request a mano con el enlace de abajo.");
    }
  }

  const compareUrl = buildCompareUrl(branch);
  console.log(`\n✅ Rama "${branch}" subida.`);
  console.log(`   Abre la Pull Request aquí (rellena autor/título/descripción):`);
  console.log(`   ${compareUrl}\n`);

  run("git", ["checkout", base]);
}

main().catch((e) => die(e.message));
