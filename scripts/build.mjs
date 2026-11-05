#!/usr/bin/env node
// =====================================================================
// Genera dist/ a partir de paginas/.
//
// Diseño: CADA página vive siempre en dist/archivo/<slug>/, con su
// propio index.html y su propia carpeta img/ al lado — sin excepción,
// también la más reciente. La portada no es una copia aparte: es un
// _redirects de Cloudflare Pages que reescribe "/" a la página más
// reciente (código 200, la URL de la barra de direcciones sigue
// mostrando "/"). Así:
//   - nunca hay colisión entre las imágenes propias de una página y
//     las imágenes compartidas de img/ (cada página tiene su propia
//     carpeta, siempre en el mismo sitio relativo a su index.html),
//   - la URL /archivo/<slug>/ de cada página es estable para siempre,
//     sea o no la portada ahora mismo.
//
// Sin dependencias de npm: solo módulos nativos de Node 20+.
// =====================================================================

import { execFileSync } from "node:child_process";
import {
  readdirSync, statSync, readFileSync, writeFileSync, mkdirSync,
  rmSync, cpSync, existsSync,
} from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PAGINAS = join(ROOT, "paginas");
const DIST = join(ROOT, "dist");

const SLUG_RE = /^(\d{4})-(\d{2})-(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const OPT_OUT_COMMENT = "eltiburon:sin-enlace-archivo";
const ARCHIVE_LINK_HTML =
  '<a class="eltiburon-archivo-link" href="/archivo/">Ver ideas anteriores →</a>';

function log(msg) {
  console.log(`[build] ${msg}`);
}

// --------------------------- 1. Listar páginas ---------------------------

function listPageSlugs() {
  if (!existsSync(PAGINAS)) return [];
  return readdirSync(PAGINAS, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .map((e) => e.name)
    .filter((name) => {
      if (!SLUG_RE.test(name)) {
        log(`⚠️  ignorando "paginas/${name}": el nombre no sigue AAAA-MM-DD-autor-titulo`);
        return false;
      }
      if (!existsSync(join(PAGINAS, name, "index.html"))) {
        log(`⚠️  ignorando "paginas/${name}": no tiene index.html`);
        return false;
      }
      return true;
    });
}

function mergeTimestamp(slug) {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%ct", "--", `paginas/${slug}`],
      { cwd: ROOT, encoding: "utf8" },
    ).trim();
    return out ? parseInt(out, 10) : 0;
  } catch {
    return 0; // sin historial git disponible (p.ej. build local sin commits)
  }
}

function sortedPages(slugs) {
  return slugs
    .map((slug) => ({ slug, fecha: slug.slice(0, 10), ts: mergeTimestamp(slug) }))
    .sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1; // fecha del nombre, descendente
      return b.ts - a.ts; // empate: más reciente fusionado a main, antes
    });
}

// --------------------------- 2. Leer metadatos ----------------------------

function readMeta(slug) {
  const html = readFileSync(join(PAGINAS, slug, "index.html"), "utf8");
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const autorMatch = html.match(/<meta\s+name=["']autor["']\s+content=["']([^"']*)["']/i);
  const humanFallback = slug
    .slice(11)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    titulo: titleMatch ? titleMatch[1].trim() : humanFallback,
    autor: autorMatch ? autorMatch[1].trim() : "—",
    html,
  };
}

// --------------------------- 3. Escribir una página -----------------------

function injectArchiveLink(html) {
  if (html.includes(OPT_OUT_COMMENT)) return html;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `  ${ARCHIVE_LINK_HTML}\n</body>`);
  }
  log("   (sin </body>: el enlace al archivo se añade al final del fichero)");
  return html + `\n${ARCHIVE_LINK_HTML}\n`;
}

function writePage(slug) {
  const srcDir = join(PAGINAS, slug);
  const outDir = join(DIST, "archivo", slug);
  mkdirSync(outDir, { recursive: true });

  // Copia todo lo que no sea el propio index.html (imágenes, etc.)
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name === "index.html") continue;
    cpSync(join(srcDir, entry.name), join(outDir, entry.name), { recursive: true });
  }

  const { html } = readMeta(slug);
  writeFileSync(join(outDir, "index.html"), injectArchiveLink(html));
}

// --------------------------- 4. Índice del archivo -------------------------

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function writeArchiveIndex(pages) {
  const items = pages.length
    ? pages
        .map(({ slug, fecha, meta }) => `      <li>
        <span class="fecha">${fecha}</span>
        <a href="/archivo/${slug}/">${escapeHtml(meta.titulo)}</a>
        <span class="autor"> — ${escapeHtml(meta.autor)}</span>
      </li>`)
        .join("\n")
    : '      <li class="vacio">Todavía no hay ninguna página publicada.</li>';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Archivo — eltiburon.win</title>
<link rel="stylesheet" href="/css/base.css">
</head>
<body>
  <main class="eltiburon-archivo-index">
    <h1>Archivo</h1>
    <p>Todas las ideas publicadas en eltiburon.win, de la más reciente a la más antigua. Cada enlace es permanente.</p>
    <ul>
${items}
    </ul>
  </main>
</body>
</html>
`;
  mkdirSync(join(DIST, "archivo"), { recursive: true });
  writeFileSync(join(DIST, "archivo", "index.html"), html);
}

// --------------------------- 5. _redirects (portada) ------------------------

function writeRedirects(newestSlug) {
  const lines = [];
  if (newestSlug) {
    lines.push(`/  /archivo/${newestSlug}/  200`);
  }
  writeFileSync(join(DIST, "_redirects"), lines.join("\n") + (lines.length ? "\n" : ""));
}

function writeEmptyHome() {
  // Todavía no hay ninguna página aprobada: portada provisional.
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>eltiburon.win</title>
<link rel="stylesheet" href="/css/base.css">
</head>
<body>
  <main class="eltiburon-archivo-index">
    <h1>eltiburon.win</h1>
    <p>Todavía no hay ninguna idea publicada. En cuanto se apruebe la primera Pull Request, aparecerá aquí.</p>
  </main>
</body>
</html>
`;
  writeFileSync(join(DIST, "index.html"), html);
}

// --------------------------- 6. Compartidos ---------------------------------

function copySharedFolder(name) {
  const src = join(ROOT, name);
  if (!existsSync(src)) return;
  cpSync(src, join(DIST, name), { recursive: true });
}

// --------------------------------- main -------------------------------------

function main() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  for (const name of ["css", "js", "img", "fonts"]) copySharedFolder(name);

  const slugs = listPageSlugs();
  const pages = sortedPages(slugs).map(({ slug, fecha }) => ({ slug, fecha, meta: readMeta(slug) }));

  for (const { slug } of pages) {
    writePage(slug);
    log(`página: paginas/${slug} → dist/archivo/${slug}/`);
  }

  writeArchiveIndex(pages);

  const newest = pages[0]?.slug ?? null;
  writeRedirects(newest);
  if (!newest) writeEmptyHome();

  log(`listo. ${pages.length} página(s). portada actual: ${newest ?? "(ninguna todavía)"}`);
}

main();
