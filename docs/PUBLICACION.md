# Estado del proyecto — eltiburon.win

Documento vivo. Se actualiza después de cada paso. Para retomar el
trabajo en otra sesión: lee este fichero entero y ve directo a
**"Próximo paso"**, al final.

## Datos del proyecto

| Dato | Valor |
|---|---|
| Repositorio | `Thaliesin/eltiburon.win` (confirmado por el usuario) |
| Visibilidad | **Privada** (según el usuario — pendiente de confirmar con `gh`/API, ver más abajo) |
| Carpeta local | `C:\desarrollo\eltiburon.win` (nueva, distinta de `C:\desarrollo\eltibuton.win`, que es otro proyecto sin relación) |
| Dominio | `https://eltiburon.win/` — **sin** `www` |
| Aprobador único | `Thaliesin` (inferido de la URL del repo; el usuario dio un email, no un `@usuario` — ver "Decisiones tomadas") |
| Proyecto Cloudflare Pages | `eltiburon-win` |
| Aprobación de solicitudes de colaboradores | **Una sola**: la del Pull Request (ruleset). No hay "required reviewers" en el Environment — el despliegue sale automático al fusionar. |
| Nombre de la web | eltiburon.win (no se pidió un nombre de marca aparte) |
| Nombre de la sección de archivo | "Archivo", en `/archivo/` |

## Checklist

### Repositorio y entorno local
- ✅ Repo clonado en `C:\desarrollo\eltiburon.win` (estaba vacío: sin ramas ni commits).
- ✅ Acceso de escritura por HTTPS confirmado (credenciales ya configuradas en esta máquina).
- ✅ Identidad de git configurada, **solo en este repo**: `Thaliesin <david.esquiu@gmail.com>`.
- ⚠️ `gh` (GitHub CLI) **no está instalado** en esta máquina. No ha bloqueado el trabajo de ficheros/estructura, pero hace falta para los pasos de GitHub de más abajo (o, en su defecto, un token personal o los pasos manuales que se detallan en "Próximo paso").

### Estructura y ficheros (local, todavía sin commit)
- ✅ Estructura de carpetas creada y confirmada por el usuario: `css/`, `js/`, `img/`, `paginas/`, `scripts/`, `docs/`, `.github/` (ver `CLAUDE.md`).
- ✅ `CLAUDE.md` — estructura del proyecto.
- ✅ `README.md`.
- ✅ `docs/PUBLICACION.md` (este fichero).
- ✅ `docs/APROBAR.md`.
- ✅ `docs/COMO-SOLICITAR-UNA-SUBIDA.md`.
- ✅ `.github/CODEOWNERS` (`* @Thaliesin`).
- ✅ `.github/PULL_REQUEST_TEMPLATE.md`.
- ✅ `.github/workflows/validar.yml` — valida la Pull Request, sin `pull_request_target`, sin secrets. Comenta el resultado (edita el mismo comentario en vez de duplicar). **Ejecuta siempre la copia de `scripts/validar-pr.mjs` que hay en `main`**, nunca la del propio PR, para que una solicitud no pueda manipular su propia validación.
- ✅ `scripts/validar-pr.mjs` — reglas de validación. Probado con `node --check` (sintaxis). Pendiente probarlo contra una Pull Request real (no se puede probar el diff localmente sin commits en main).
- ✅ `.github/workflows/deploy.yml` — build + `cloudflare/wrangler-action`, job de deploy con `environment: produccion`.
- ✅ `scripts/build.mjs` — genera `dist/`. **Probado localmente** con páginas de prueba (creadas y borradas después, no se han commiteado): rotación por fecha, desempate por `git log`, inyección del enlace al archivo, comentario de exclusión `<!-- eltiburon:sin-enlace-archivo -->`, extracción de `<title>`/`<meta name="autor">`, copiado de compartidos. Todo correcto.
  - Diseño: cada página vive siempre en `dist/archivo/<slug>/` (estable para siempre); la portada es un `_redirects` de Cloudflare Pages que reescribe `/` → `/archivo/<la-más-reciente>/` con código 200. Evita cualquier colisión entre imágenes propias de una página y `img/` compartido. Detalle en `CLAUDE.md`, sección "Cómo se publica".
- ✅ `scripts/nueva-pagina.mjs` — crea página + rama + Pull Request (o da el enlace para abrirla a mano si no hay `gh`). **Probado de punta a punta** con una carpeta de ejemplo (`--no-pr`, sin tocar git de verdad): slug generado bien, acentos fuera, CSS/JS movidos y reescritos a ruta absoluta, meta `autor` insertada. No se ha probado todavía el camino que sí crea rama/commit/push de verdad (no tiene sentido hasta que exista el primer commit en `main`).
- ✅ `package.json` (sin dependencias de runtime).
- ✅ `.gitignore` (`dist/`, `node_modules/`, etc.).
- ✅ `paginas/_ejemplo/` — plantilla de referencia, el build la ignora.
- ✅ `css/base.css` — estilos compartidos mínimos (incluye el estilo del enlace al archivo y de la página de archivo).

### Nada de esto está todavía commiteado ni subido a GitHub.

### Pendiente — lado de GitHub (necesita `gh` o acceso manual)
- ⏳ Primer commit y push a `main` (el andamiaje de arriba). Como el repo está vacío y sin protección todavía, este primer push puede ir directo.
- ⏳ Confirmar visibilidad real del repo (`gh repo view` o ajuste manual) — el usuario dijo "privada", no verificado por API todavía.
- ⏳ Ruleset de `main`: Pull Request obligatoria + mi aprobación + check `validar.yml` en verde; prohibido push directo, force-push y borrado, **salvo** `Thaliesin` como *bypass actor*. Pendiente comprobar si el plan del repo permite rulesets con bypass actor (debería estar disponible en el plan gratuito también para repos privados, pero se confirma antes de aplicar nada).
- ⏳ Activar "Require review from Code Owners" (el fichero `CODEOWNERS` por sí solo no obliga nada sin este ajuste).
- ⏳ Crear el Environment `produccion` en GitHub (sin "required reviewers" — aprobación única, ver decisión más arriba) y guardar ahí, como secrets del entorno (no del repositorio):
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- ⏳ Revisar colaboradores actuales del repo (`gh api repos/Thaliesin/eltiburon.win/collaborators`) y confirmar que nadie salvo Thaliesin tiene rol admin.
- ⏳ Invitar a los amigos que vayan a colaborar, rol **write** como máximo (o ninguno, si se decide pedirles fork — no aplica mientras el repo sea privado).

### Pendiente — lado de Cloudflare
- ⏳ Crear el proyecto Pages `eltiburon-win` en modo **Direct Upload** (sin integración Git de Cloudflare — la única vía de publicar debe ser `deploy.yml`).
- ⏳ Generar el `CLOUDFLARE_API_TOKEN` (permiso mínimo: editar Cloudflare Pages en esa cuenta) y obtener el `CLOUDFLARE_ACCOUNT_ID`.
- ⏳ Asociar el dominio `eltiburon.win` (sin `www`) al proyecto Pages.

### Pendiente — primera página real
- ⏳ Publicar una primera página (por ejemplo, de bienvenida, de Thaliesin) siguiendo el propio flujo de Pull Request, para probar el sistema de punta a punta antes de invitar a nadie.

## Decisiones tomadas

- **Carpeta local separada**: se creó `C:\desarrollo\eltiburon.win` en vez de reutilizar `C:\desarrollo\eltibuton.win` (otro proyecto del usuario, sin relación, ya existente en esa máquina). Motivo: nombres de dominio/repo distintos ("eltiburon" vs "eltibuton"); mezclar los contenidos habría sido un error.
- **Usuario de GitHub = `Thaliesin`**: el usuario dio un email (`david.esquiu@gmail.com`) en vez de un `@usuario` de GitHub. Se infirió `Thaliesin` del propietario del repositorio (`github.com/Thaliesin/eltiburon.win`) y se usó para `CODEOWNERS`, el bypass actor pendiente de aplicar, y la identidad de los commits locales. **No confirmado explícitamente por el usuario** — si su usuario real de GitHub es otro, hay que corregir `CODEOWNERS`, `scripts/nueva-pagina.mjs` (constante `REPO_SLUG`/menciones) y `scripts/validar-pr.mjs` (constante `OWNER`).
- **Aprobación única, no doble**: el usuario eligió explícitamente "una" tras la recomendación (doble) que se le ofreció. Se implementa sin "required reviewers" en el Environment `produccion`: la aprobación del Pull Request (ya obligatoria por el ruleset) es el único gate; el despliegue sale automático al fusionar.
- **Diseño de portada/archivo por `_redirects`** en vez de copiar la página actual a dos sitios (raíz y archivo): decisión técnica tomada durante la implementación, no estaba en la propuesta de estructura original que aprobó el usuario, pero el resultado visible es exactamente el pedido (portada = última aprobada, anteriores accesibles con URL estable) — con la ventaja añadida de eliminar cualquier colisión entre imágenes propias de una página y las compartidas. Detallado en `CLAUDE.md`.
- **Metadato `<meta name="autor">`**: se añadió esta convención (no estaba explícita en el encargo original) porque el nombre de carpeta `AAAA-MM-DD-autor-titulo` no se puede separar en "autor" y "título" de forma fiable cuando cualquiera de los dos tiene varias palabras. `scripts/nueva-pagina.mjs` la rellena sola; si falta, el archivo muestra un autor genérico en vez de fallar.
- **Límites de la validación** (`scripts/validar-pr.mjs`): HTML/CSS/JS hasta 300 KB por fichero, imágenes/fuentes hasta 4 MB. Son valores de partida, ajustables en ese mismo fichero si hacen falta.

## Protecciones activas y las que no se pudieron aplicar

Todavía **ninguna protección de GitHub está aplicada** (ni ruleset, ni
Environment, ni Code Owners enforcement): el repo está vacío y el
trabajo de hoy ha sido de ficheros locales. Se aplicarán en la próxima
sesión, en este orden: push inicial → ruleset → Environment + secrets →
Cloudflare → primera página de prueba.

## Cambios de estructura realizados

- 2026-11-05 — estructura inicial: `css/`, `js/`, `img/`, `paginas/`,
  `scripts/`, `docs/`, `.github/`, tal y como queda descrito en
  `CLAUDE.md`. Sin cambios posteriores todavía.

## Próximo paso

1. Confirmar con el usuario que `Thaliesin` es su usuario de GitHub
   (ver "Decisiones tomadas").
2. Conseguir acceso a `gh` CLI (instalación + `gh auth login`) o un
   token personal, para poder:
   - confirmar visibilidad del repo y revisar colaboradores,
   - crear el ruleset de `main` con bypass actor,
   - activar "Require review from Code Owners",
   - crear el Environment `produccion`.
3. Hacer el primer commit y push del andamiaje actual a `main` (antes
   de aplicar ningún ruleset, para no bloquearlo).
4. Aplicar el ruleset y el Environment (paso 2), ya con `main` protegida.
5. Pedir al usuario el token de Cloudflare y el account ID; crear el
   proyecto Pages `eltiburon-win` en modo Direct Upload; guardar los
   secrets en el Environment `produccion`.
6. Asociar el dominio `eltiburon.win`.
7. Publicar una primera página de prueba por Pull Request, de
   principio a fin, para validar todo el sistema.
8. Invitar a los amigos colaboradores.
