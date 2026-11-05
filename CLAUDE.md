# eltiburon.win — estructura del proyecto

Este fichero describe cómo está organizado el repositorio: dónde va cada
cosa, qué puede tocar cada persona y cómo funciona la publicación.
**Consúltalo antes de crear o mover ficheros.** Si una petición
contradice esta estructura, hay que avisar antes de hacerlo.

Ver también:
- `docs/PUBLICACION.md` — estado del proyecto, decisiones, protecciones activas, próximo paso.
- `docs/APROBAR.md` — cómo aprobar una solicitud (yo, desde GitHub Mobile).
- `docs/COMO-SOLICITAR-UNA-SUBIDA.md` — guía para colaboradores.

## Árbol del proyecto

```
eltiburon.win/
├── .github/
│   ├── workflows/
│   │   ├── validar.yml          valida cada Pull Request (sin secrets)
│   │   └── deploy.yml           build + despliegue a Cloudflare Pages
│   ├── CODEOWNERS               Thaliesin, propietario de todo
│   └── PULL_REQUEST_TEMPLATE.md
├── css/
│   ├── base.css                 COMPARTIDO — solo Thaliesin
│   └── paginas/
│       └── AAAA-MM-DD-autor-titulo.css   propio de una página
├── js/
│   └── paginas/
│       └── AAAA-MM-DD-autor-titulo.js    propio de una página
├── img/                          imágenes/recursos COMPARTIDOS — solo Thaliesin
├── paginas/
│   ├── _ejemplo/                 plantilla; el build la ignora siempre
│   └── AAAA-MM-DD-autor-titulo/
│       ├── index.html
│       └── img/                  imágenes propias de esa página
├── scripts/
│   ├── build.mjs                 genera dist/ (rotación de portada/archivo)
│   ├── validar-pr.mjs            reglas que aplica validar.yml
│   └── nueva-pagina.mjs          crea una página + rama + Pull Request
├── docs/
│   ├── PUBLICACION.md
│   ├── APROBAR.md
│   └── COMO-SOLICITAR-UNA-SUBIDA.md
├── CLAUDE.md                     (este fichero)
├── README.md
└── package.json
```

`dist/` no se versiona: lo genera `scripts/build.mjs` en cada
despliegue y Cloudflare Pages lo publica tal cual.

## Reglas de ubicación

- **HTML de cada página:** `paginas/AAAA-MM-DD-autor-titulo/index.html`.
  - Nombre de carpeta: fecha de hoy, luego autor y título en minúsculas,
    sin acentos ni espacios, separados por guiones. Lo genera solo
    `scripts/nueva-pagina.mjs`; si se hace a mano, debe seguir el mismo
    formato exacto (lo exige `scripts/validar-pr.mjs`).
- **CSS y JS compartidos** (comunes a toda la web): sueltos en la raíz de
  `css/` y `js/` (p. ej. `css/base.css`). **Solo Thaliesin los toca.**
- **CSS y JS propios de una página:** en `css/paginas/` y `js/paginas/`,
  con el mismo nombre que la carpeta de la página:
  - `css/paginas/AAAA-MM-DD-autor-titulo.css`
  - `js/paginas/AAAA-MM-DD-autor-titulo.js`
- **Imágenes propias de una página:** dentro de su carpeta,
  `paginas/AAAA-MM-DD-autor-titulo/img/`.
- **Imágenes y recursos compartidos:** en `img/` (raíz). **Solo
  Thaliesin los toca.**
- **Rutas:** cada página referencia su CSS y JS (propio o compartido)
  con **ruta absoluta desde la raíz** (`/css/...`, `/js/...`). Las
  imágenes propias de la página pueden ser relativas (`img/foto.png`),
  porque su `index.html` siempre vive junto a su propia carpeta `img/`
  (ver "Cómo se publica" más abajo). Lo exige `scripts/validar-pr.mjs`
  (avisa si detecta una ruta relativa a CSS/JS).
- **Nada de `<style>` o `<script>` largos en línea:** si una página los
  trae, van a sus ficheros propios siguiendo las reglas de arriba.
- Las carpetas de `paginas/` que empiezan por `_` (p. ej.
  `paginas/_ejemplo/`) son plantillas; `scripts/build.mjs` las ignora
  siempre.

## Metadatos de cada página

Cada `index.html` debe traer:
- `<title>…</title>` — se usa como título en el listado del archivo.
- `<meta name="autor" content="…">` — se usa como autor en ese listado.

`scripts/nueva-pagina.mjs` los añade solo. Si faltan, la página se
publica igual pero con un título/autor genérico en el archivo.

## Cómo se publica (rotación)

`scripts/build.mjs` genera `dist/` desde cero en cada despliegue:

- **Cada página vive siempre en `dist/archivo/AAAA-MM-DD-autor-titulo/`**,
  con su propio `index.html` y su propia carpeta `img/` al lado — nunca
  hay dos sitios distintos para la misma página. Esa URL es estable
  para siempre: sirve para compartirla o meterla en un QR.
- **La portada no es una copia aparte.** `dist/_redirects` reescribe
  `/` hacia `/archivo/<la-más-reciente>/` con código 200 (Cloudflare
  Pages lo interpreta como seguir sirviendo ese contenido sin cambiar
  la URL de la barra de direcciones). "Más reciente" = la fecha del
  nombre de la carpeta; si dos empatan, desempata la fecha en que se
  fusionó a `main`.
- `dist/archivo/index.html` lista todas las páginas (fecha, autor,
  título, enlace), de la más reciente a la más antigua.
- Cada página publicada lleva, inyectado por el build, un enlace
  discreto a `/archivo/` antes de `</body>`. Para que una página no lo
  lleve, su autor incluye en el HTML el comentario
  `<!-- eltiburon:sin-enlace-archivo -->`.
- Los ficheros compartidos (`css/`, `js/`, `img/`) se copian a `dist/`
  tal cual, con la misma ruta, para que las rutas absolutas funcionen
  igual en la portada y en `/archivo/`.

## Quién puede tocar qué

| Qué | Colaboradores (Pull Request) | Thaliesin |
|---|---|---|
| Carpeta nueva en `paginas/` | ✅ (la suya, solo ficheros nuevos) | ✅ |
| `css/paginas/<su-página>.css`, `js/paginas/<su-página>.js` nuevos | ✅ | ✅ |
| Cualquier fichero que ya existiera (otras páginas, `css/base.css`, `img/`, `scripts/`, `.github/`, `CLAUDE.md`, `docs/`) | ❌ — lo bloquea `validar.yml` | ✅ |

`scripts/validar-pr.mjs` reconoce a Thaliesin por el usuario de GitHub
que abre la Pull Request y, solo para él, omite las reglas de
estructura (sigue pidiendo revisión humana del diff).

## Cómo publico yo (Thaliesin)

Igual que cualquiera: una Pull Request contra `main`, pasando
`validar.yml`. La diferencia es que la protección de rama me deja
fusionar mis propias Pull Requests sin que otra persona las apruebe
(bypass actor del ruleset — ver `docs/PUBLICACION.md`), así que no me
quedo bloqueado. El despliegue sigue pasando siempre por
`deploy.yml`.

Para crear una página (mía o ayudando a alguien sin Git):
```
node scripts/nueva-pagina.mjs <carpeta-o-index.html> --titulo "..." --autor "..."
```

## Cambios de estructura

Cualquier cambio de convención (carpeta nueva, fichero compartido
nuevo, regla nueva) se anota aquí **y** en `docs/PUBLICACION.md`
("Cambios de estructura realizados").

- 2026-11-05 — estructura inicial creada.
