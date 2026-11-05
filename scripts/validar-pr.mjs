#!/usr/bin/env node
// =====================================================================
// Valida que una Pull Request de paginas/ cumple las reglas del repo.
// Lo ejecuta .github/workflows/validar.yml, SIEMPRE con la copia de
// este fichero que hay en main (ver ese workflow) para que una PR no
// pueda manipular su propia validación.
//
// No requiere dependencias de npm. No necesita secrets: solo lee el
// diff de la PR con git.
// =====================================================================

import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { writeFileSync } from "node:fs";

const BASE_SHA = process.env.BASE_SHA;
const HEAD_SHA = process.env.HEAD_SHA;
const PR_AUTHOR = (process.env.PR_AUTHOR || "").trim();
const OWNER = "Thaliesin";

const MAX_SIZE_CODE = 300 * 1024; // html/css/js
const MAX_SIZE_ASSET = 4 * 1024 * 1024; // imágenes/fuentes
const ALLOWED_EXT = new Set([
  ".html", ".css", ".js",
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico",
  ".woff", ".woff2", ".ttf", ".otf",
]);
const SLUG_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errors = [];
const warnings = [];
const notes = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function report(status) {
  const lines = [];
  lines.push(status === "ok" ? "### ✅ Validación superada" : "### ❌ Validación con problemas");
  lines.push("");
  if (PR_AUTHOR.toLowerCase() === OWNER.toLowerCase()) {
    lines.push(`Autor **${PR_AUTHOR}** es el propietario del repositorio: se omiten las reglas de estructura (solo él puede tocar ficheros compartidos). Recuerda revisar igualmente el diff a mano.`);
  }
  if (errors.length) {
    lines.push("", "**Hay que corregir esto antes de poder fusionar:**", "");
    for (const e of errors) lines.push(`- ❌ ${e}`);
  }
  if (warnings.length) {
    lines.push("", "**Avisos — no bloquean, pero revísalos antes de aprobar:**", "");
    for (const w of warnings) lines.push(`- ⚠️ ${w}`);
  }
  if (notes.length) {
    lines.push("", "<details><summary>Detalle técnico</summary>", "", ...notes.map((n) => `- ${n}`), "", "</details>");
  }
  if (!errors.length && !warnings.length) {
    lines.push("", "Todo en orden. Lista para revisión humana.");
  }
  writeFileSync("validation-report.md", lines.join("\n") + "\n");
}

function gitDiffNameStatus(base, head) {
  const out = execFileSync("git", ["diff", "--name-status", "--no-renames", `${base}...${head}`], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32,
  });
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split("\t");
      return { status, path: rest.join("\t") };
    });
}

// --- Si el autor es el propietario, la validación de estructura no aplica ---
if (PR_AUTHOR.toLowerCase() === OWNER.toLowerCase()) {
  report("ok");
  process.exit(0);
}

if (!BASE_SHA || !HEAD_SHA) {
  fail("No se pudo determinar la comparación de la Pull Request (BASE_SHA/HEAD_SHA vacíos).");
  report("error");
  process.exit(1);
}

let changed;
try {
  changed = gitDiffNameStatus(BASE_SHA, HEAD_SHA);
} catch (e) {
  fail(`No se pudo calcular el diff de la Pull Request: ${e.message}`);
  report("error");
  process.exit(1);
}

if (changed.length === 0) {
  fail("La Pull Request no contiene cambios.");
  report("error");
  process.exit(1);
}

// --- 1. Ningún fichero existente puede modificarse ni borrarse ---
for (const { status, path } of changed) {
  if (status !== "A") {
    const verbo = status === "D" ? "borra" : status === "M" ? "modifica" : `toca (${status})`;
    fail(`${verbo} un fichero que ya existía: \`${path}\`. Una solicitud solo puede **añadir** ficheros nuevos de tu propia página.`);
  }
}

const added = changed.filter((c) => c.status === "A").map((c) => c.path);

// --- 2. Localizar la(s) carpeta(s) paginas/<slug>/ propuestas ---
const pageSlugs = new Set();
for (const p of added) {
  const m = p.match(/^paginas\/([^/]+)\//);
  if (m) pageSlugs.add(m[1]);
}

if (pageSlugs.size === 0) {
  fail("No se encontró ninguna carpeta nueva en `paginas/`. Toda solicitud debe añadir `paginas/AAAA-MM-DD-autor-titulo/index.html`.");
} else if (pageSlugs.size > 1) {
  fail(`Esta solicitud propone más de una página a la vez (${[...pageSlugs].join(", ")}). Abre una Pull Request por idea.`);
}

const slug = pageSlugs.size === 1 ? [...pageSlugs][0] : null;

if (slug && !SLUG_RE.test(slug)) {
  fail(`El nombre de carpeta \`${slug}\` no sigue el formato \`AAAA-MM-DD-autor-titulo\` (minúsculas, dígitos y guiones solamente, sin espacios ni acentos).`);
}

if (slug && slug.startsWith("_")) {
  fail(`\`${slug}\` empieza por guion bajo: esas carpetas son plantillas y el build las ignora. Elige un nombre que empiece por la fecha.`);
}

// --- 3. Cada fichero añadido debe estar en una de las tres zonas permitidas ---
const pageFiles = [];
const pageCssFiles = [];
const pageJsFiles = [];
const rejected = [];

for (const p of added) {
  if (slug && p.startsWith(`paginas/${slug}/`)) {
    pageFiles.push(p);
  } else if (/^css\/paginas\/[^/]+\.css$/.test(p)) {
    pageCssFiles.push(p);
  } else if (/^js\/paginas\/[^/]+\.js$/.test(p)) {
    pageJsFiles.push(p);
  } else if (p.startsWith("paginas/")) {
    // pertenece a otra carpeta de paginas/ distinta de la detectada
    rejected.push(p);
  } else {
    rejected.push(p);
  }
}

for (const p of rejected) {
  fail(`\`${p}\` está fuera de tu página: solo puedes añadir ficheros dentro de \`paginas/${slug ?? "AAAA-MM-DD-autor-titulo"}/\`, o CSS/JS propios con el mismo nombre.`);
}

// --- 4. El CSS/JS propio debe llamarse exactamente como la carpeta ---
for (const p of pageCssFiles) {
  const base = p.replace(/^css\/paginas\//, "").replace(/\.css$/, "");
  if (base !== slug) {
    fail(`\`${p}\` no coincide con el nombre de tu carpeta (\`${slug}\`). Debe llamarse \`css/paginas/${slug}.css\`.`);
  }
}
for (const p of pageJsFiles) {
  const base = p.replace(/^js\/paginas\//, "").replace(/\.js$/, "");
  if (base !== slug) {
    fail(`\`${p}\` no coincide con el nombre de tu carpeta (\`${slug}\`). Debe llamarse \`js/paginas/${slug}.js\`.`);
  }
}

// --- 5. Debe existir un index.html dentro de la carpeta de la página ---
if (slug && !pageFiles.includes(`paginas/${slug}/index.html`)) {
  fail(`Falta \`paginas/${slug}/index.html\`. Toda página necesita ese fichero en la raíz de su carpeta.`);
}

// --- 6. Extensión y tamaño de cada fichero propio ---
const allOwnFiles = [...pageFiles, ...pageCssFiles, ...pageJsFiles];
for (const p of allOwnFiles) {
  const dot = p.lastIndexOf(".");
  const ext = dot === -1 ? "" : p.slice(dot).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    fail(`\`${p}\` tiene una extensión no permitida (\`${ext || "sin extensión"}\`). Permitidas: ${[...ALLOWED_EXT].join(", ")}.`);
    continue;
  }
  let size = 0;
  try {
    size = statSync(p).size;
  } catch {
    continue; // el fichero pudo borrarse en un commit posterior de la misma PR; no es relevante aquí
  }
  const isCode = ext === ".html" || ext === ".css" || ext === ".js";
  const limit = isCode ? MAX_SIZE_CODE : MAX_SIZE_ASSET;
  if (size > limit) {
    fail(`\`${p}\` pesa ${(size / 1024).toFixed(0)} KB, por encima del límite (${(limit / 1024).toFixed(0)} KB).`);
  }
}

// --- 7. Escanear el HTML de la página: referencias a CSS/JS ajenos, avisos ---
if (slug) {
  const htmlFiles = pageFiles.filter((p) => p.toLowerCase().endsWith(".html"));
  for (const p of htmlFiles) {
    let html = "";
    try {
      html = readFileSync(p, "utf8");
    } catch {
      continue;
    }

    const refRe = /(?:href|src|action)\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = refRe.exec(html))) {
      const ref = m[1];
      const pagesAssetRe = /^\/?(?:css|js)\/paginas\/([^/?#]+)\.(?:css|js)$/i;
      const am = ref.match(pagesAssetRe);
      if (am && am[1] !== slug) {
        fail(`\`${p}\` enlaza \`${ref}\`, el CSS/JS de otra página. Solo puedes usar el tuyo (\`${slug}\`) o CSS/JS compartidos.`);
      }
      if (/\.(?:css|js)$/i.test(ref) && !/^https?:\/\//i.test(ref) && !ref.startsWith("/")) {
        warn(`\`${p}\` enlaza \`${ref}\` con ruta relativa. Usa una ruta absoluta (\`/css/...\`, \`/js/...\`) para que funcione también como portada y en /archivo/.`);
      }
    }

    const scriptSrcRe = /<script[^>]+src\s*=\s*["'](https?:)?\/\/[^"']+["']/gi;
    while ((m = scriptSrcRe.exec(html))) {
      warn(`\`${p}\` carga un script externo (\`${m[0]}\`). Revísalo antes de aprobar: se serviría bajo tu dominio.`);
    }

    if (/<form[\s>]/i.test(html)) {
      warn(`\`${p}\` contiene un \`<form>\`. Este sitio es estático (sin servidor propio): comprueba a dónde envía los datos antes de aprobar.`);
    }

    if (/<input[^>]+type\s*=\s*["']password["']/i.test(html)) {
      warn(`\`${p}\` tiene un campo de contraseña. Revísalo con atención: esta web no debe pedir credenciales.`);
    }
  }
}

notes.push(`Comparando \`${BASE_SHA?.slice(0, 7)}\`…\`${HEAD_SHA?.slice(0, 7)}\`, ${changed.length} fichero(s) tocado(s), ${added.length} añadido(s).`);
if (slug) notes.push(`Carpeta detectada: \`paginas/${slug}/\`.`);

report(errors.length ? "error" : "ok");
process.exit(errors.length ? 1 : 0);
