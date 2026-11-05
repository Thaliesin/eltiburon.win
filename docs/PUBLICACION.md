# Estado del proyecto — eltiburon.win

Documento vivo. Se actualiza después de cada paso. Para retomar el
trabajo en otra sesión: lee este fichero entero y ve directo a
**"Próximo paso"**, al final.

## Datos del proyecto

| Dato | Valor |
|---|---|
| Repositorio | `Thaliesin/eltiburon.win` — **confirmado** (la cuenta de GitHub del usuario usa el mismo email que el de esta sesión) |
| Visibilidad | **Privada** (según el usuario — pendiente de confirmar por API: falta acceso de GitHub, ver más abajo) |
| Carpeta local | `C:\desarrollo\eltiburon.win` (nueva, distinta de `C:\desarrollo\eltibuton.win`, que es otro proyecto sin relación) |
| Dominio | `https://eltiburon.win/` — **sin** `www` |
| Aprobador único | `Thaliesin` — **confirmado** |
| Proyecto Cloudflare Pages | `eltiburon-win` — **creado**, en `https://eltiburon-win.pages.dev` |
| Cloudflare Account ID | `1b58d65304c59a1739d0951c7851268e` |
| Aprobación de solicitudes de colaboradores | **Una sola**: la del Pull Request (ruleset). No hay "required reviewers" en el Environment — el despliegue sale automático al fusionar. |
| Nombre de la web | eltiburon.win (no se pidió un nombre de marca aparte) |
| Nombre de la sección de archivo | "Archivo", en `/archivo/` |

## Checklist

### Repositorio y GitHub
- ✅ Repo clonado en `C:\desarrollo\eltiburon.win`.
- ✅ Identidad de git configurada, **solo en este repo**: `Thaliesin <david.esquiu@gmail.com>`.
- ✅ **Primer commit hecho y subido** (`71598fe`): toda la estructura, docs, workflows y scripts de más abajo.
- ✅ Segundo commit subido (`0ee0f13`): `.gitignore` ignora `.wrangler/` (caché local del CLI de Cloudflare, apareció al desplegar a mano).
- ❌ `gh` (GitHub CLI) **no está instalado** en esta máquina, y todavía no se ha recibido un Personal Access Token. **Esto bloquea todo lo de más abajo** (ruleset, Code Owners, Environment + secrets, revisión de colaboradores).

### Estructura y ficheros — todo hecho y subido a `main`
- ✅ `CLAUDE.md`, `README.md`, `docs/PUBLICACION.md` (este fichero), `docs/APROBAR.md`, `docs/COMO-SOLICITAR-UNA-SUBIDA.md`.
- ✅ `.github/CODEOWNERS` (`* @Thaliesin`), `.github/PULL_REQUEST_TEMPLATE.md`.
- ✅ `.github/workflows/validar.yml` — sin `pull_request_target`, sin secrets. Ejecuta siempre la copia de `scripts/validar-pr.mjs` de `main` (una PR no puede manipular su propia validación).
- ✅ `scripts/validar-pr.mjs` — probado con `node --check`. Pendiente probarlo contra una Pull Request real (hace falta la primera PR de verdad).
- ✅ `.github/workflows/deploy.yml` — build + `cloudflare/wrangler-action`, job de deploy con `environment: produccion`. **Ya se disparó una vez** (al hacer push del primer commit) y **falló en el paso de Cloudflare**, como se esperaba: todavía no existían los secrets. Volverá a dispararse (y esta vez debería funcionar) en cuanto se guarden los secrets en el Environment — ver "Próximo paso".
- ✅ `scripts/build.mjs` — probado localmente varias veces, incluida la build real que se desplegó a mano hoy. Diseño: cada página vive siempre en `dist/archivo/<slug>/`; la portada es un `_redirects` que reescribe `/` → `/archivo/<la-más-reciente>/`. Detalle en `CLAUDE.md`.
- ✅ `scripts/nueva-pagina.mjs` — probado de punta a punta con `--no-pr`. No se ha probado todavía el camino que crea rama/commit/push de verdad.
- ✅ `package.json`, `.gitignore`, `paginas/_ejemplo/`, `css/base.css`.

### Cloudflare — hecho hoy
- ✅ Token de API recibido del usuario, **verificado activo** (`/user/tokens/verify`). Permiso: Account → Cloudflare Pages → Edit. **No tiene permiso de cuentas ni de DNS** (ver más abajo).
- ✅ Proyecto Pages `eltiburon-win` creado en modo **Direct Upload** (`wrangler pages project create ... --force`; sin integración Git de Cloudflare, tal y como se pidió).
- ✅ Primer despliegue manual hecho (`wrangler pages deploy dist`) para comprobar que todo funciona: `https://eltiburon-win.pages.dev` sirve correctamente la portada provisional ("todavía no hay ninguna idea publicada").
- ✅ Dominio `eltiburon.win` asociado al proyecto como *custom domain* (ya existía como zona en esa cuenta de Cloudflare: la API devolvió un `zone_tag`).
- ⚠️ **El dominio no está activo todavía**: Cloudflare informa `"CNAME record not set"`. El token no tiene permiso de DNS (solo se le pidió Pages:Edit), así que no se pudo crear el registro. **Acción pendiente del usuario** (1 minuto, ver "Próximo paso").
- ⏳ El `CLOUDFLARE_API_TOKEN` y el `CLOUDFLARE_ACCOUNT_ID` están verificados y funcionando, pero **todavía no están guardados como secrets en GitHub** (bloqueado por falta de acceso a GitHub — ver arriba). Mientras tanto no se han escrito en ningún fichero del repositorio; solo se han usado como variables de entorno de esta sesión.

### Pendiente — lado de GitHub (bloqueado sin `gh` o un token)
- ⏳ Confirmar visibilidad real del repo.
- ⏳ Ruleset de `main`: Pull Request obligatoria + aprobación de Thaliesin + check `validar.yml` en verde; prohibido push directo, force-push y borrado, salvo `Thaliesin` como *bypass actor*. Pendiente comprobar si el plan del repo lo permite.
- ⏳ Activar "Require review from Code Owners".
- ⏳ Crear el Environment `produccion` y guardar ahí (secrets del entorno, no del repositorio): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (ya verificados, listos para guardar en cuanto haya acceso).
- ⏳ Revisar colaboradores actuales y confirmar que nadie salvo Thaliesin tiene rol admin.
- ⏳ Invitar a los amigos colaboradores (rol write como máximo).

### Pendiente — del usuario, fuera de GitHub
- ⏳ **Añadir el registro DNS del dominio** en el panel de Cloudflare → `eltiburon.win` → DNS → Add record:
  - Tipo `CNAME`, nombre `@` (raíz), destino `eltiburon-win.pages.dev`, proxy activado (nube naranja).
  - En cuanto exista, Cloudflare valida solo y el dominio pasa a activo (puede tardar unos minutos).

### Pendiente — primera página real
- ⏳ Publicar una primera página (de bienvenida, de Thaliesin) por Pull Request, de principio a fin, antes de invitar a nadie.

## Decisiones tomadas

- **Carpeta local separada**: `C:\desarrollo\eltiburon.win`, distinta de `C:\desarrollo\eltibuton.win` (otro proyecto del usuario sin relación).
- **Usuario de GitHub = `Thaliesin`**: confirmado por el usuario (su cuenta de GitHub usa el mismo email que esta sesión, que a su vez coincide con el propietario del repositorio).
- **Aprobación única, no doble**: elegida explícitamente por el usuario. Sin "required reviewers" en el Environment `produccion`: la aprobación del Pull Request es el único gate.
- **Diseño de portada/archivo por `_redirects`**: cada página vive siempre en `dist/archivo/<slug>/`; la portada es una reescritura, no una copia. Detallado en `CLAUDE.md`.
- **Metadato `<meta name="autor">`**: convención añadida para poder mostrar el autor en el listado del archivo sin parsear el nombre de la carpeta de forma ambigua.
- **Límites de validación**: HTML/CSS/JS hasta 300 KB, imágenes/fuentes hasta 4 MB (ajustables en `scripts/validar-pr.mjs`).
- **Proyecto Pages creado con `--force`**: la versión más reciente de `wrangler` intenta delegar `pages project create` a "Workers con assets" y falla si no hay ya una carpeta de ficheros estáticos presente; `--force` usa la vía clásica de Cloudflare Pages directamente, que es la que corresponde a un proyecto *Direct Upload* sin integración Git. No hace falta volver a usar `--force` en despliegues futuros (`wrangler pages deploy`), solo se necesitó para la creación inicial del proyecto.

## Protecciones activas y las que no se pudieron aplicar

- ❌ Ninguna protección de GitHub está aplicada todavía (ni ruleset, ni Environment, ni Code Owners enforcement) — **motivo: sin acceso a `gh`/token de GitHub**. Es el único bloqueo real que queda.
- ✅ El despliegue a Cloudflare ya no depende de que Cloudflare tenga integración Git con este repo (Direct Upload, confirmado): la única vía de publicar seguirá siendo `deploy.yml` en cuanto tenga los secrets.
- ⚠️ El dominio personalizado no está activo todavía — motivo: falta el registro DNS (ver "Pendiente — del usuario, fuera de GitHub").

## Cambios de estructura realizados

- 2026-11-05 — estructura inicial: `css/`, `js/`, `img/`, `paginas/`, `scripts/`, `docs/`, `.github/` (ver `CLAUDE.md`). Commit `71598fe`.
- 2026-11-05 — `.gitignore` ahora ignora también `.wrangler/`. Commit `0ee0f13`.

## Próximo paso

**Lo único que falta para terminar es acceso a GitHub.** En cuanto el
usuario dé `gh auth login` hecho, o pegue un Personal Access Token
clásico (scope `repo`):

1. Confirmar visibilidad del repo y revisar colaboradores/roles.
2. Crear el ruleset de `main` (Pull Request + aprobación de Thaliesin +
   check en verde; bypass actor = Thaliesin; sin push directo, sin
   force-push, sin borrado).
3. Activar "Require review from Code Owners".
4. Crear el Environment `produccion` y guardar ahí
   `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` (ya verificados,
   solo hay que copiarlos).
5. Re-disparar `deploy.yml` (`workflow_dispatch` o un commit trivial) y
   comprobar que esta vez sí despliega solo.
6. Publicar una primera página de prueba por Pull Request, de
   principio a fin.
7. Invitar a los amigos colaboradores.

Aparte, y en paralelo, independiente de GitHub:

- El usuario tiene que añadir el registro CNAME del dominio (ver
  "Pendiente — del usuario, fuera de GitHub"). Sin esto,
  `eltiburon-win.pages.dev` funciona perfectamente pero
  `eltiburon.win` todavía no.
