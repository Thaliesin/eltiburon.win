# Estado del proyecto — eltiburon.win

Documento vivo. Se actualiza después de cada paso. Para retomar el
trabajo en otra sesión: lee este fichero entero y ve directo a
**"Próximo paso"**, al final.

## Datos del proyecto

| Dato | Valor |
|---|---|
| Repositorio | `Thaliesin/eltiburon.win` |
| Visibilidad | **Pública** — decisión del usuario (el plan Free no permite proteger `main` en repos privados; ver "Decisiones tomadas") |
| Carpeta local | `C:\desarrollo\eltiburon.win` |
| Dominio | `https://eltiburon.win/` — sin `www` — **activo**, responde 200 |
| Aprobador único | `Thaliesin` |
| Proyecto Cloudflare Pages | `eltiburon-win`, modo Direct Upload — publicando |
| Aprobación de solicitudes de colaboradores | Una sola: la del Pull Request (ruleset, con Code Owners obligatorio). Sin "required reviewers" en el Environment — el despliegue sale automático al fusionar. |
| Colaboración | Por **fork**: cualquiera puede proponer, nadie necesita invitación |

## Checklist — todo lo de la lista original está hecho

### Repositorio, estructura y workflows
- ✅ Estructura completa en `main`: `CLAUDE.md`, `README.md`, `docs/`, `.github/`, `scripts/`, `css/`, `js/`, `img/`, `paginas/_ejemplo/`.
- ✅ `scripts/build.mjs`, `scripts/validar-pr.mjs`, `scripts/nueva-pagina.mjs` — probados.
- ✅ `.github/workflows/deploy.yml` — probado de punta a punta, en verde.
- ✅ `.github/workflows/validar.yml` + `.github/workflows/comentar-validacion.yml` — **dos workflows**, no uno. Motivo: al pasar el repo a público, las Pull Requests llegan sobre todo desde **forks**, y GitHub le retira el permiso de escritura al token del workflow `pull_request` en ese caso (ocurre aunque se declare `permissions: pull-requests: write`; es una restricción de seguridad de GitHub, no un bug). Patrón aplicado (el recomendado por GitHub para este caso):
  - `validar.yml` corre con el código de la PR (de quien sea, no de confianza), sin ningún permiso de escritura ni secrets; deja el informe como artefacto.
  - `comentar-validacion.yml` se dispara después (`workflow_run`), corre siempre con el código de `main` (nunca con el de la PR), y solo lee ese artefacto de texto para comentar — por eso sí puede tener permiso de escritura con seguridad.
  - Pendiente de ver en marcha con una Pull Request real (ver "Próximo paso").
- ✅ `scripts/nueva-pagina.mjs` ajustado para fork: detecta el propietario real de `origin` y construye la URL de comparación entre repos cuando hace falta; usa `upstream/main` como base si ese remoto existe. De paso se corrigió un bug en la regex que no reconocía nombres de repositorio con punto (como `eltiburon.win`, el propio nombre de este repo).
- ✅ `docs/COMO-SOLICITAR-UNA-SUBIDA.md` reescrita para el flujo de fork (Vía 1 web y Vía 2 con Git), tanto la pantalla de GitHub que fuerza el fork al editar sin permiso de escritura, como el `git clone` del propio fork.

### GitHub — hecho
- ✅ Repositorio pasado a **público** (decisión del usuario, confirmada por API).
- ✅ Colaboradores revisados: solo `Thaliesin`, admin.
- ✅ **Ruleset de `main` creado y confirmado funcionando**: Pull Request obligatoria, 1 aprobación, **Code Owners obligatorio** (`require_code_owner_review: true`), check `validar` obligatorio, sin force-push ni borrado, bypass solo para el rol Admin (= Thaliesin, único admin del repo). Confirmado en vivo: el push de este mismo cambio mostró `Bypassed rule violations for refs/heads/main: Changes must be made through a pull request / Required status check "validar" is expected` — es decir, a Thaliesin le dejó pasar (bypass) y a cualquier otro lo habría bloqueado.
- ✅ Environment `produccion` con los dos secrets de Cloudflare (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), sin protection rules (coherente con la aprobación única elegida).

### Cloudflare — hecho
- ✅ Proyecto Pages `eltiburon-win`, Direct Upload, dominio `eltiburon.win` activo.

### Pendiente — lo único que queda
- ⏳ Publicar una primera página real (de bienvenida, de Thaliesin) por Pull Request, de principio a fin, para ver en marcha: `validar.yml` → `comentar-validacion.yml` comentando → ruleset exigiendo aprobación → `deploy.yml` publicando.
- ⏳ Decidir si además se quiere probar con una Pull Request de **otra cuenta** (fork de verdad, no de Thaliesin) antes de anunciarlo a los amigos — recomendable, para ver el caso real de principio a fin, pero no imprescindible: la lógica es la misma que la de cualquier PR, con la única diferencia de que el workflow de comentarios usa el artefacto en vez de comentar directamente.
- ⏳ Avisar a los amigos de que ya pueden proponer ideas (enlace a `docs/COMO-SOLICITAR-UNA-SUBIDA.md`).

## Decisiones tomadas

- **Repositorio público** (no GitHub Pro): elegido por el usuario tras comprobar por API que el plan Free no permite branch protection en repos privados, ni con Rulesets ni con la API clásica (dos pruebas reales, dos `403 Upgrade to GitHub Pro or make this repository public`). Consecuencia asumida: las Pull Requests sin aprobar y el historial son visibles desde fuera; el contenido ya publicado lo era de todas formas, al estar en `eltiburon.win`.
- **Workflow de validación en dos partes**: necesario específicamente por ser repo público con contribuciones por fork (ver checklist arriba). No era necesario cuando el plan era repo privado con colaboradores invitados (ahí el token sí mantiene permiso de escritura), pero se adoptó el patrón seguro igualmente para que valga sea cual sea el origen de la PR.
- **Bypass actor del ruleset = rol `Admin` (`RepositoryRole`, id 5), no el usuario `Thaliesin` directamente**: la API de Rulesets no ofrece "este usuario concreto" como tipo de bypass actor en un repositorio personal (no de organización); el rol Admin es el equivalente correcto, y ahora mismo Thaliesin es el único con ese rol.
- Las decisiones ya registradas en sesiones anteriores (carpeta local, usuario de GitHub, aprobación única, diseño de portada/archivo por `_redirects`, metadato `autor`, límites de validación, creación del proyecto Pages con `--force`, autenticación de `gh` vía `GH_TOKEN`) siguen vigentes sin cambios.

## Protecciones activas

- ✅ Ruleset de `main`: PR + aprobación + Code Owners + check `validar` obligatorios; sin force-push ni borrado; bypass solo rol Admin. **Confirmado funcionando**, no solo configurado.
- ✅ Cloudflare Pages en modo Direct Upload: única vía de publicar es `deploy.yml`.
- ✅ Secrets de Cloudflare solo en el Environment `produccion`.
- ✅ El token de validación nunca tiene escritura ni secrets, venga la PR de donde venga.

Todo lo pedido en el encargo original está aplicado. No queda ninguna
protección pendiente por falta de plan o de acceso.

### ⚠️ Pendiente de revisar — GitHub App de Cloudflare

Al abrir la primera PR real apareció un check `Workers Builds: eltiburon-win`,
posteado por la GitHub App **"Cloudflare Workers and Pages"** (no por
nuestros workflows). Investigado:

- El proyecto Pages **no tiene `source` (conexión Git) configurado** —
  confirmado por API (`GET .../pages/projects/eltiburon-win`, sin campo
  `source`).
- Los 6 despliegues existentes hasta ahora son todos `ad_hoc` en `main`
  — es decir, todos proceden de `wrangler pages deploy` (manual o vía
  `deploy.yml`), ninguno de otra vía.
- Ese check no bloquea el ruleset (el único status check exigido es
  `validar`).

**Actualización**: en la Pull Request #1 se confirmó que sí intenta
desplegar de verdad — comentario de `cloudflare-workers-and-pages[bot]`:
*"🚀 Deploying Preview to Cloudflare"*, con un build que terminó en
**`Build: Failed ❌`** (sin URL de despliegue, no llegó a publicar
nada). O sea: el intento es real y se dispara en cada push, pero ahora
mismo no consigue completarse. No es fiable asumir que seguirá
fallando para siempre.

El token usado (permiso Pages:Edit únicamente) no alcanza para ver ni
desconectar esa integración — haría falta que el usuario lo revise:
- **Más directo**: GitHub → tu perfil → Settings → Applications →
  Installed GitHub Apps → **Cloudflare Workers and Pages** → Configure
  → en "Repository access", quitar `eltiburon.win` (o restringir a
  "Only select repositories" sin incluirlo).
- Alternativa en Cloudflare: panel → proyecto `eltiburon-win` →
  Settings → busca una sección de Git/Builds y desconéctala ahí.

**Pendiente de que el usuario lo haga** — no bloquea el funcionamiento
actual (el build falla antes de publicar nada, y de todas formas no
afecta al ruleset ni a `deploy.yml`), pero mientras no se desconecte no
hay garantía total de que la única vía de publicar sea `deploy.yml`.

## Cambios de estructura realizados

- 2026-11-05 — estructura inicial (commit `71598fe`).
- 2026-11-05 — `.gitignore` ignora `.wrangler/` (commit `0ee0f13`).
- 2026-11-05 — repo pasado a público; ruleset de `main` creado; Environment `produccion` con los secrets de Cloudflare; `validar.yml` dividido en dos workflows por seguridad ante forks; `scripts/nueva-pagina.mjs` adaptado a fork; `docs/COMO-SOLICITAR-UNA-SUBIDA.md` reescrita (commit `92060c7` y anteriores de la misma sesión).

## Próximo paso

1. Publicar una primera página de prueba (de Thaliesin) por Pull
   Request, de principio a fin, y comprobar en la propia PR:
   - que `validar.yml` corre y sube el artefacto,
   - que `comentar-validacion.yml` pone el comentario con el resultado,
   - que el ruleset exige la aprobación antes de poder fusionar,
   - que al fusionar, `deploy.yml` publica la página de verdad en
     `eltiburon.win`.
2. Si algo de lo anterior no se comporta como se espera, corregirlo
   antes de avisar a nadie.
3. Avisar a los amigos: enlace a `docs/COMO-SOLICITAR-UNA-SUBIDA.md`.
