# eltiburon.win

Una web colaborativa de ideas: cualquier amigo puede proponer una
página, pero **nada se publica sin que Thaliesin lo apruebe** — ni
siquiera un cambio en las propias reglas del sistema.

- 🌐 Web: <https://eltiburon.win/>
- 🗂️ Archivo de ideas anteriores: <https://eltiburon.win/archivo/>

## Cómo funciona, en una frase

**Solicitar → validar → aprobar → publicar → archivo.**

1. **Solicitar.** Alguien propone su página como una [Pull
   Request](https://docs.github.com/articles/about-pull-requests) —
   nunca puede subir cambios directamente.
2. **Validar.** Un robot comprueba automáticamente que la solicitud
   sigue las reglas (ficheros en su sitio, nada ajeno tocado, nada
   sospechoso) y lo dice en un comentario.
3. **Aprobar.** Solo Thaliesin puede aprobar y fusionar. Lo puede hacer
   desde el móvil con la app GitHub Mobile.
4. **Publicar.** En cuanto se fusiona, la web se reconstruye sola y la
   nueva página pasa a ser la portada.
5. **Archivo.** La portada anterior no desaparece: se conserva para
   siempre en `/archivo/`, con un enlace estable.

## Para colaboradores

¿Quieres proponer tu idea? Lee **[docs/COMO-SOLICITAR-UNA-SUBIDA.md](docs/COMO-SOLICITAR-UNA-SUBIDA.md)**
— no hace falta saber programar ni instalar nada.

## Para Thaliesin

- **[docs/APROBAR.md](docs/APROBAR.md)** — cómo revisar y aprobar una solicitud, incluido desde el móvil.
- **[CLAUDE.md](CLAUDE.md)** — estructura del proyecto: qué va en cada carpeta y quién puede tocar qué.
- **[docs/PUBLICACION.md](docs/PUBLICACION.md)** — estado del proyecto, decisiones tomadas, protecciones activas y próximo paso.

## Desarrollo local

```
npm run build          # genera dist/ a partir de paginas/
npm run nueva-pagina    # crea una página nueva + Pull Request
```

Sin dependencias de npm: todo corre con Node 20+ y sus módulos
nativos.
