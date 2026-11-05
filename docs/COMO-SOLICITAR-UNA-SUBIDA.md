# Cómo proponer tu idea para eltiburon.win

eltiburon.win es una web colaborativa: cualquiera puede proponer una
página con su idea, pero **nada se publica sin que Thaliesin lo revise
y lo apruebe**. Lo que tú haces se llama una **Pull Request** ("solicitud
de cambios"): un paquete con tu página que Thaliesin puede leer,
comentar y, si le parece bien, aprobar y publicar.

Este repositorio es **público**, así que no hace falta que nadie te
invite: cualquiera puede proponer una idea. Como no tienes permiso de
escritura directo sobre él, tu copia de trabajo es un **fork** (una
copia del repositorio en tu propia cuenta de GitHub) — es automático y
gratis, y GitHub te guía en el momento en que haga falta.

Hay dos caminos. Si no usas Git normalmente, ve directo a la **Vía 1**.

---

## Vía 1 — Sin instalar nada, desde la web de GitHub

### 1. Crea tu carpeta

1. Entra en el repositorio: `https://github.com/Thaliesin/eltiburon.win`
2. Abre la carpeta `paginas/`.
3. Pulsa **Add file → Create new file**.
4. En el nombre del fichero, escribe la ruta completa de tu página:
   ```
   paginas/2026-11-05-ana-garcia-mi-idea/index.html
   ```
   - `2026-11-05` — la fecha de hoy, en ese formato.
   - `ana-garcia` — tu nombre, en minúsculas, sin acentos ni espacios
     (usa guiones).
   - `mi-idea` — un título corto para tu idea, igual de formateado.
   - GitHub crea las carpetas solas al escribir las barras `/`.
5. Pega el contenido de tu `index.html` en el recuadro grande.
6. Baja hasta el final de la página y pulsa **"Propose changes"** (o
   "Commit changes"). Como no tienes permiso de escritura directo sobre
   este repositorio, GitHub te va a avisar: **"You need to fork this
   repository to propose changes"**, con un botón **"Fork this
   repository"** — púlsalo. Hace la copia a tu cuenta y guarda tu
   fichero ahí, en una rama nueva, en un solo paso.
7. Te lleva a una pantalla para abrir la Pull Request — de momento no
   la abras todavía (pulsa fuera o espera), vas a añadir el resto de
   ficheros primero en el siguiente paso.

### 2. Añade tu CSS, tu JS y tus imágenes (si los tienes)

Ahora estás trabajando en **tu fork** (arriba a la izquierda pone
`tu-usuario/eltiburon.win`, no `Thaliesin/eltiburon.win`), en la rama
que se acaba de crear. Sigue en tu fork para todo lo de abajo — no
hace falta volver al repositorio original:

1. Ve a la carpeta `css/paginas/` → **Add file → Upload files** → sube
   tu fichero `.css` y renómbralo exactamente igual que tu carpeta:
   `2026-11-05-ana-garcia-mi-idea.css`.
2. Igual en `js/paginas/` para tu `.js`, si lo tienes:
   `2026-11-05-ana-garcia-mi-idea.js`.
3. Para imágenes: entra en TU carpeta
   (`paginas/2026-11-05-ana-garcia-mi-idea/`) → **Add file → Upload
   files** → arrastra tus imágenes. Si quieres que estén en una
   subcarpeta `img/`, escribe `img/` en el nombre al subirlas o créala
   primero igual que en el paso 1 (`Create new file` con
   `paginas/2026-11-05-ana-garcia-mi-idea/img/foto.png` no funciona
   para binarios: usa siempre **Upload files**, no **Create new
   file**, para imágenes).
4. Cada vez, abajo del todo elige **"Commit directly to the
   `tu-rama`"** (ya no "a new branch": sigues añadiendo a la misma
   rama/solicitud que empezaste).

### 3. Enlaza tu CSS y tu JS con ruta absoluta

Dentro de tu `index.html`, en `<head>`, referencia tu CSS así (fíjate
en la barra `/` al principio):

```html
<link rel="stylesheet" href="/css/paginas/2026-11-05-ana-garcia-mi-idea.css">
```

Y tu JS, antes de `</body>`:

```html
<script src="/js/paginas/2026-11-05-ana-garcia-mi-idea.js"></script>
```

Si cambiaste algo después de crear el fichero, edítalo desde la web
(icono del lápiz) y guarda **en tu misma rama**.

### 4. Abre la Pull Request

1. Ve a la pestaña **Pull requests** de **tu fork** (`tu-usuario/eltiburon.win`)
   → debería aparecer un aviso amarillo para tu rama → **Compare & pull
   request**. Si no lo ves, ve a `https://github.com/Thaliesin/eltiburon.win`
   y pulsa **New pull request → compare across forks**; como "head
   repository" elige tu fork y tu rama.
2. Comprueba arriba que dice algo como
   `base: Thaliesin/eltiburon.win main ← compare: tu-usuario/eltiburon.win tu-rama`.
3. Rellena la plantilla que aparece: tu nombre, el título de tu idea y
   una descripción breve. No borres el checklist — repásalo.
4. Pulsa **Create pull request**.

Listo. En poco tiempo verás un comentario automático diciéndote si todo
está en regla. Si algo falla, te dice exactamente qué — corrígelo
repitiendo el paso 2 o 3 en la misma rama (no hace falta abrir otra
solicitud) y el comentario se actualiza solo.

Cuando Thaliesin la apruebe, tu página se publica sola — no tienes que
hacer nada más.

---

## Vía 2 — Con Git, o con el script `nueva-pagina`

Si tienes Git instalado:

1. Haz fork del repositorio desde `https://github.com/Thaliesin/eltiburon.win`
   (botón **Fork**, arriba a la derecha).
2. Clona **tu fork**, no el original:
   ```
   git clone https://github.com/tu-usuario/eltiburon.win.git
   cd eltiburon.win
   ```
3. Crea tu página y la Pull Request con el script:
   ```
   node scripts/nueva-pagina.mjs ruta/a/tu/carpeta --titulo "Mi idea" --autor "Tu nombre"
   ```

`ruta/a/tu/carpeta` puede ser una carpeta con tu `index.html` (y,
opcionalmente, un `.css`, un `.js` y una subcarpeta `img/` dentro), o
directamente la ruta a un `index.html` suelto.

El script:
- crea `paginas/AAAA-MM-DD-tu-nombre-tu-titulo/` con el nombre correcto,
- mueve tu CSS y tu JS a `css/paginas/` y `js/paginas/` con ese mismo
  nombre, y ajusta las rutas de tu `index.html` a absolutas,
- deja tus imágenes dentro de tu propia carpeta,
- crea la rama, hace el commit y la sube a **tu fork**,
- te da el enlace para abrir la Pull Request contra `Thaliesin/eltiburon.win`
  (o la abre sola, si tienes instalado `gh`, la herramienta de línea de
  comandos de GitHub).

Funciona igual en Windows, macOS y Linux (necesita Node 20 o más
reciente). Si en algún momento quieres traerte los cambios más
recientes del repositorio original a tu fork:
```
git remote add upstream https://github.com/Thaliesin/eltiburon.win.git
git fetch upstream
git merge upstream/main
```
(el script detecta solo si tienes este remoto `upstream` configurado y
lo usa como base en vez de tu fork, para no partir de una copia
desactualizada).

---

## Dónde va cada fichero — ejemplo completo

Supón que te llamas Ana García, hoy es 5 de noviembre de 2026, y tu
idea se titula "Mi idea". Tu solicitud debe quedar así:

```
paginas/2026-11-05-ana-garcia-mi-idea/
├── index.html
└── img/
    └── foto.png

css/paginas/2026-11-05-ana-garcia-mi-idea.css
js/paginas/2026-11-05-ana-garcia-mi-idea.js
```

Y tu `index.html`, así:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mi idea</title>
  <meta name="autor" content="Ana García">

  <!-- compartido de la web: absoluto -->
  <link rel="stylesheet" href="/css/base.css">
  <!-- el tuyo propio: mismo nombre que tu carpeta, absoluto -->
  <link rel="stylesheet" href="/css/paginas/2026-11-05-ana-garcia-mi-idea.css">
</head>
<body>
  <h1>Mi idea</h1>
  <p>Aquí tu contenido.</p>

  <!-- imagen propia: relativa, dentro de tu carpeta -->
  <img src="img/foto.png" alt="Descripción de la imagen">

  <!-- el tuyo propio: mismo nombre que tu carpeta, absoluto -->
  <script src="/js/paginas/2026-11-05-ana-garcia-mi-idea.js"></script>
</body>
</html>
```

## Lo que no puedes hacer (y por qué el robot te lo va a rechazar)

- **Tocar cualquier fichero que ya existiera**: otra página, `css/base.css`,
  `img/`, `scripts/`, `.github/`, `CLAUDE.md`, cualquier cosa de
  `docs/`. Tu solicitud solo puede **añadir** ficheros nuevos, dentro
  de tu propia carpeta.
- **Un CSS o JS que no se llame exactamente como tu carpeta.**
- **Cargar el CSS o el JS de otra página.**
- **Más de una carpeta nueva en `paginas/` en la misma solicitud** — una
  idea, una Pull Request.
- Ficheros muy pesados, o de un tipo que no sea HTML, CSS, JS, imagen o
  fuente.

Si tu página trae un formulario, pide una contraseña o carga un script
de fuera, no se rechaza automáticamente, pero Thaliesin lo va a mirar
con lupa antes de aprobar — así que mejor evítalo salvo que sea
necesario, y explícalo en la descripción de tu Pull Request.

## ¿Y si me equivoco?

No pasa nada. Puedes seguir subiendo cambios a tu misma rama tantas
veces como haga falta — el comentario de validación se actualiza solo
cada vez. Si quieres empezar de cero, cierra la Pull Request y abre
otra.
