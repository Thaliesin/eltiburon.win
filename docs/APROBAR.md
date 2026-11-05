# Cómo aprobar una solicitud (Thaliesin)

Solo tú puedes aprobar. Esto funciona igual desde el móvil (app **GitHub
Mobile**) que desde el ordenador.

## El camino corto: revisar y fusionar

1. Te llega una notificación: alguien ha abierto una Pull Request en
   `eltiburon.win` y te pide revisión (es automático, por `CODEOWNERS`).
2. Ábrela. Arriba verás un comentario del robot de validación
   (`validar.yml`) con:
   - **✅ Validación superada** — la estructura está bien; aun así,
     revisa el contenido tú mismo.
   - **❌ Validación con problemas** — lista lo que falla. No se puede
     fusionar hasta corregirlo (el check queda en rojo).
   - Puede haber **avisos** (⚠️) que no bloquean pero conviene mirar:
     formularios, scripts externos, campos de contraseña, rutas
     relativas.
3. Entra en la pestaña **"Files changed"** (en el móvil: el icono de
   archivos) y lee el `index.html` propuesto. Dos cosas a vigilar
   siempre, porque el robot no puede protegerte de ellas al 100%:
   - Que **no** aparezca nada fuera de `paginas/<su-carpeta>/`,
     `css/paginas/<su-carpeta>.css` o `js/paginas/<su-carpeta>.js`.
   - Que el propio `scripts/validar-pr.mjs` o cualquier fichero de
     `.github/` no aparezcan en el diff (si aparecen, **no apruebes**:
     avísame a mí o rechaza directamente — nadie salvo tú debería
     poder tocarlos, y si el check lo dejó pasar es una señal de que
     algo no cuadra).
4. Si todo está bien: pulsa **Review → Approve** (en GitHub Mobile:
   botón "Review changes" → "Approve" → "Submit").
5. Pulsa **Merge pull request** (puede hacerlo la propia app, o esperar
   a que tú lo hagas; con esta configuración, solo tú puedes fusionar
   sin que nadie más apruebe).
6. Al fusionar, el despliegue (`deploy.yml`) se dispara solo: construye
   el sitio y lo publica en Cloudflare Pages. Tarda uno o dos minutos.
   Puedes seguirlo en la pestaña **Actions**.

Eso es todo — con la aprobación del Pull Request (paso 4) ya está dado
el único visto bueno que hace falta; no hay un segundo paso de
aprobación de despliegue (ver `docs/PUBLICACION.md`, decisión de
aprobación única).

## Si algo falla

- **El check está en rojo y no te deja fusionar:** lee el comentario
  del robot, pide a la persona que corrija y vuelva a subir cambios a
  la misma rama (no hace falta que abra otra Pull Request).
- **Quieres rechazar sin más:** "Close pull request" (sin fusionar). No
  se publica nada.
- **Ya fusionaste y quieres deshacerlo:** el despliegue vuelve a
  publicar automáticamente con cada cambio a `main`. Para volver atrás,
  haz otra Pull Request (tuya) que revierta el cambio — por ejemplo con
  el botón "Revert" que GitHub ofrece en la propia Pull Request ya
  fusionada — y apruébala/fusiónala igual que cualquier otra.

## Publicar una página tuya

Sigues el mismo camino (Pull Request → check en verde → fusionar), pero
no necesitas que nadie te apruebe a ti: la protección de rama te deja
fusionar tus propias solicitudes. Aun así, espera a que el check de
`validar.yml` esté en verde antes de fusionar.
