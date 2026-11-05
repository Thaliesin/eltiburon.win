# Estado del proyecto — eltiburon.win

Documento vivo. Se actualiza después de cada paso. Para retomar el
trabajo en otra sesión: lee este fichero entero y ve directo a
**"Próximo paso"**, al final.

## Datos del proyecto

| Dato | Valor |
|---|---|
| Repositorio | `Thaliesin/eltiburon.win` — confirmado |
| Visibilidad | **Privada** — confirmado por API (`gh repo view`) |
| Plan de GitHub | **Free** — confirmado por API: no permite branch protection/rulesets en repos privados (ver bloqueo más abajo, es el único punto que falta) |
| Carpeta local | `C:\desarrollo\eltiburon.win` (nueva, distinta de `C:\desarrollo\eltibuton.win`, otro proyecto del usuario sin relación) |
| Dominio | `https://eltiburon.win/` — **sin** `www` — **activo**, responde 200 |
| Aprobador único | `Thaliesin` — confirmado |
| Proyecto Cloudflare Pages | `eltiburon-win`, modo Direct Upload — **creado y publicando** |
| Cloudflare Account ID | `1b58d65304c59a1739d0951c7851268e` |
| Aprobación de solicitudes de colaboradores | **Una sola**: la del Pull Request. Sin "required reviewers" en el Environment — el despliegue sale automático al fusionar. |
| Nombre de la web | eltiburon.win |
| Nombre de la sección de archivo | "Archivo", en `/archivo/` |

## Checklist

### Repositorio, estructura y ficheros — ✅ todo hecho y en `main`
- ✅ Repo clonado, identidad de git local configurada (`Thaliesin <david.esquiu@gmail.com>`, solo en este repo).
- ✅ Tres commits en `main`: andamiaje inicial (`71598fe`), `.gitignore` de `.wrangler/` (`0ee0f13`), este documento (`a4a7c27`).
- ✅ `CLAUDE.md`, `README.md`, `docs/APROBAR.md`, `docs/COMO-SOLICITAR-UNA-SUBIDA.md`.
- ✅ `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`.
- ✅ `.github/workflows/validar.yml` — sin `pull_request_target`, sin secrets, ejecuta siempre la copia de `scripts/validar-pr.mjs` de `main`. Pendiente probarlo contra una Pull Request real.
- ✅ `.github/workflows/deploy.yml` — **probado de punta a punta y funcionando**: disparado a mano (`workflow_dispatch`) tras guardar los secrets, build (11 s) + deploy (28 s), los dos en verde. `https://eltiburon-win.pages.dev` y `https://eltiburon.win` sirven el contenido generado.
- ✅ `scripts/build.mjs`, `scripts/nueva-pagina.mjs` — probados localmente (ver sesión anterior de este documento en el historial de git para el detalle de las pruebas).
- ✅ `package.json`, `.gitignore`, `paginas/_ejemplo/`, `css/base.css`.

### Cloudflare — ✅ todo hecho
- ✅ Proyecto Pages `eltiburon-win` creado en modo Direct Upload (sin integración Git de Cloudflare).
- ✅ Dominio `eltiburon.win` asociado y **activo** (el usuario añadió el registro CNAME; confirmado con `curl` devolviendo 200).
- ✅ `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` guardados como secrets del **Environment `produccion`** en GitHub (no del repositorio). No están escritos en ningún fichero versionado.

### GitHub — acceso conseguido, la mayoría hecho
- ✅ Token personal clásico del usuario, scope `repo`, verificado contra la API (confirma identidad `Thaliesin`). `gh` CLI ya estaba instalado en la máquina (solo faltaba en el PATH de la sesión); autenticado vía `GH_TOKEN` (el flujo normal `gh auth login --with-token` lo rechazó por no tener el scope `read:org`, que no hace falta para nada de esto — usar la variable de entorno lo evita).
- ✅ Colaboradores revisados: solo `Thaliesin`, rol admin. Nadie más tiene acceso todavía.
- ✅ Environment `produccion` creado, sin protection rules (coherente con la aprobación única elegida).
- ✅ Los dos secrets de Cloudflare guardados ahí (`gh secret set`).
- ❌ **Ruleset de `main` — BLOQUEADO por el plan.** Intentado con la API moderna (Rulesets) y con la clásica (branch protection): las dos devuelven `403 Upgrade to GitHub Pro or make this repository public to enable this feature`. Confirmado con pruebas reales contra la API, no es una suposición. Es el único requisito de la petición original que falta por cumplir — ver "Decisión pendiente del usuario" más abajo.
- ⏳ "Require review from Code Owners" — depende de lo anterior (es un parámetro del propio ruleset).
- ⏳ Invitar a los amigos colaboradores — con sentido dejarlo para después de resolver el ruleset, así no quedan invitados a un repo todavía sin protección.

### Pendiente — primera página real
- ⏳ Publicar una primera página (de bienvenida, de Thaliesin) por Pull Request, de principio a fin, en cuanto el ruleset esté activo.

## 🔴 Decisión pendiente del usuario — bloqueo real, no solo burocracia

GitHub **no permite proteger la rama `main` de un repositorio privado en
el plan Free** — ni con Rulesets (lo nuevo) ni con la protección de rama
clásica. Las dos vías probadas devuelven el mismo error pidiendo
upgrade a Pro o hacer el repo público. Sin esto, cualquier colaborador
con acceso de escritura podría subir directamente a `main` sin pasar
por una Pull Request, que es justo lo que se quería impedir.

Dos salidas:

1. **Pasar a GitHub Pro** (de pago, revisa el precio actual en
   github.com/pricing — históricamente unos 4 USD/mes). El repo sigue
   privado, y todo lo demás queda exactamente como se diseñó: ruleset
   con tu usuario como único *bypass actor*, Code Owners obligatorio,
   nada se publica sin tu aprobación. En cuanto esté activado, aplico
   el ruleset en un minuto (ya está probado, solo falta que la API deje
   de devolver el 403).
2. **Hacer el repositorio público.** Gratis, y el ruleset funciona sin
   más. Cambia dos cosas:
   - El código fuente (y el historial) se puede ver desde fuera —
     incluidas las Pull Requests propuestas antes de aprobarlas. El
     contenido ya publicado en la web es público de todas formas
     (está en `eltiburon.win`), así que la diferencia real es que las
     *propuestas todavía no aprobadas* también quedarían visibles.
   - Tus amigos piden la subida hacienda **fork** en vez de ser
     invitados como colaboradores (de hecho simplifica un paso: no
     hace falta gestionar invitaciones). `docs/COMO-SOLICITAR-UNA-SUBIDA.md`
     tiene ya escrita la variante de "Vía 1" para fork; la until ahora
     activa es la de colaborador directo — en cuanto decidas, ajusto
     esa guía a la vía que corresponda.

No voy a decidir esto por ti. Dímelo y en cuanto lo sepa (y, si eliges
la opción 1, en cuanto esté activado el Pro) remato el ruleset, activo
Code Owners y lo dejo todo según lo pedido.

## Decisiones tomadas

- **Carpeta local separada**: `C:\desarrollo\eltiburon.win`, distinta de `C:\desarrollo\eltibuton.win`.
- **Usuario de GitHub = `Thaliesin`**: confirmado por el usuario.
- **Aprobación única, no doble**: sin "required reviewers" en el Environment `produccion`.
- **Diseño de portada/archivo por `_redirects`**: cada página vive siempre en `dist/archivo/<slug>/`. Detallado en `CLAUDE.md`.
- **Metadato `<meta name="autor">`**: convención añadida para el listado del archivo.
- **Límites de validación**: HTML/CSS/JS hasta 300 KB, imágenes/fuentes hasta 4 MB.
- **Proyecto Pages creado con `wrangler ... --force`**: necesario una sola vez, para que `wrangler` use la vía clásica de Pages (Direct Upload) en vez de intentar delegar a "Workers con assets". No hace falta en despliegues futuros.
- **Autenticación de `gh` vía `GH_TOKEN`, no `gh auth login --with-token`**: el token clásico con scope `repo` es suficiente para todo lo que hace falta, pero `gh auth login` por defecto exige también `read:org`, que no se pidió (y no hace falta, al ser un repo personal, no de una organización).

## Protecciones activas y las que no se pudieron aplicar

- ✅ Cloudflare Pages en modo Direct Upload: la única vía de publicar es `deploy.yml` (confirmado, funcionando).
- ✅ Secrets de Cloudflare solo en el Environment `produccion`, no en el repositorio.
- ❌ **Ruleset de `main` (Pull Request + aprobación + Code Owners obligatorios, bypass para Thaliesin) — no aplicado.** Motivo: el plan Free de GitHub no permite branch protection en repos privados (confirmado por API, ver sección de arriba). Pendiente de la decisión del usuario (Pro vs. público).
- Mientras tanto, **no hay ninguna barrera técnica que impida un push directo a `main`** — de hecho, cualquiera con rol write podría saltarse el flujo de Pull Request por completo. No se debe invitar a ningún colaborador hasta resolver esto.

## Cambios de estructura realizados

- 2026-11-05 — estructura inicial: `css/`, `js/`, `img/`, `paginas/`, `scripts/`, `docs/`, `.github/` (ver `CLAUDE.md`). Commit `71598fe`.
- 2026-11-05 — `.gitignore` ignora también `.wrangler/`. Commit `0ee0f13`.

## Próximo paso

1. **Esperar la decisión del usuario**: GitHub Pro o repositorio
   público (ver "Decisión pendiente del usuario").
2. En cuanto se sepa:
   - Si Pro: confirmar que ya está activo, aplicar el ruleset (JSON ya
     preparado y probado la sintaxis — solo falta que la cuenta deje
     de recibir el 403) con Code Owners obligatorio.
   - Si público: cambiar la visibilidad del repo, aplicar el mismo
     ruleset (sin el bloqueo de plan), y actualizar
     `docs/COMO-SOLICITAR-UNA-SUBIDA.md` a la variante de fork en vez
     de colaborador directo.
3. Publicar una primera página de prueba (de Thaliesin) por Pull
   Request, de principio a fin: comprobar que `validar.yml` comenta
   bien, que el ruleset exige la aprobación, y que al fusionar
   `deploy.yml` publica la página de verdad.
4. Invitar a los amigos colaboradores (si se quedó en repo privado) o
   anunciarles que pueden hacer fork (si pasó a público).
