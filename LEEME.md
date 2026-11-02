# Guía Pacha — guía no oficial de Roots of Pacha

App Android (y web) con toda la información útil de *Roots of Pacha*, en español y sin conexión:

- **Hoy**: el día de tu partida, cumpleaños y festivales de hoy y de los próximos 7 días, qué cultivos aún llegan a tiempo si los plantas hoy y peces de temporada.
- **Calendario** de las 4 estaciones con cumpleaños, festivales y carreras.
- **Cultivos** (49): estación, días de crecimiento, rebrote, dónde encontrar la semilla, contribución por calidad, calculadora de siembra y a quién regalarlo.
- **Aldeanos** (58): cumpleaños, clan, romance, lo que les encanta, gusta y odian, buscador por regalo («¿a quién le gusta la calabaza?») y control de los 2 regalos semanales.
- **Recetas** (111): ingredientes, utensilio, energía, contribución, mejora temporal, cómo se consigue la receta, a quién regalar cada plato y lista de recetas cocinadas.
- **Ideas** (39): qué aldeano la investiga, cuándo aparece, prosperidad, materiales y recompensa, con lista de completadas.
- **Minerales** (recursos, minerales y las 7 gemas), **herramientas** (todas las mejoras con materiales y coste) y **artesanía** (vallas, suelos, riego, trampas, medicinas, 18 procesadores y fertilizantes). Los bichos están en Recolección.
- **Imágenes reales de la wiki** (721) de aldeanos, cultivos, objetos, platos, peces, plantas, animales, herramientas, ideas, profecías y festivales. Van incluidas en `www/img/`, así que se ven sin conexión. Se pueden desactivar en Ajustes.
- **Pesca** (52) con lista de capturados, **animales**, **recolección**, **festivales**, **profecías** con lista de tareas, **primeros pasos**, favoritos, modo oscuro y buscador global.

## Estructura

```
pacha-guia/
├── www/            ← la app (HTML, CSS y JS). Aquí se cambian los datos y el diseño.
│   ├── js/data.js       ← datos del juego (cultivos, aldeanos, pesca…)
│   ├── js/data-extra.js ← recetas, ideas, minerales, herramientas, artesanía y bichos
│   ├── js/images.js     ← de qué archivo de la wiki sale cada imagen
│   ├── js/search.js     ← búsqueda tolerante a erratas y acentos
│   ├── css/theme.css    ← TODO el aspecto: colores, texturas, sombras, formas, fuentes
│   ├── css/app.css      ← componentes (tarjetas, botones, chips…) que usan esos tokens
│   ├── js/img-index.js  ← lista de imágenes incluidas en img/
│   └── img/             ← imágenes descargadas de la wiki
├── android/        ← proyecto Android Studio (contenedor nativo que carga www/)
└── play-store/     ← icono 512, gráfico destacado y capturas para la ficha
```

La carpeta `www/` se copia automáticamente dentro de la app cada vez que compilas.

## 1. Probarla en tu móvil

1. Instala **Android Studio** (gratis) desde developer.android.com/studio.
2. *File → Open* y elige la carpeta **`android`**. La primera vez descargará lo necesario (unos minutos).
3. En tu móvil Android activa las *Opciones de desarrollador* y la *Depuración USB*, conéctalo por cable.
4. Pulsa ▶ **Run**. La app se instala en el móvil.

> Para ver la app en el ordenador sin Android Studio, abre `www/index.html` en el navegador.

## 2. Antes de publicar

1. **Identificador de la app**: en `android/app/build.gradle` cambia `applicationId 'es.guiapacha.app'` por uno tuyo (p. ej. `es.paularamis.guiapacha`). No se puede cambiar después de publicar.
2. **Versión**: cada vez que subas una actualización, sube `versionCode` (1, 2, 3…) y `versionName`.

## 3. Generar el archivo para Play Store (.aab)

1. En Android Studio: *Build → Generate Signed App Bundle or APK → Android App Bundle*.
2. Crea una **clave de firma** nueva (*Create new…*). **Guarda el archivo .jks y las contraseñas en un sitio seguro**: sin ellos no podrás actualizar la app.
3. Elige *release* y termina. El archivo queda en `android/app/release/app-release.aab`.

## 4. Publicar en Google Play

1. Crea una cuenta de desarrollador en play.google.com/console (pago único de 25 $).
2. *Crear aplicación* → nombre «Guía Pacha – guía no oficial», idioma español, gratuita.
3. Rellena la ficha con los textos de `play-store/ficha.md` y sube las imágenes de `play-store/`.
4. **Política de privacidad**: Google exige una URL. Puedes publicar el texto de `play-store/politica-privacidad.md` (por ejemplo, en Google Sites o GitHub Pages) y pegar el enlace.
5. *Seguridad de los datos*: indica que la app **no recoge ni comparte datos**.
6. *Clasificación de contenido*: rellena el cuestionario (es una guía, sin contenido sensible).
7. Sube el `.aab` en una pista de prueba. Las cuentas personales nuevas suelen tener que hacer primero una **prueba cerrada con al menos 12 personas durante 14 días** antes de poder publicar en producción; revisa los requisitos actuales en la consola.

### Sobre derechos y marcas (importante)

- El icono de la app y el gráfico de la ficha son originales.
- **Las imágenes de personajes, objetos y animales son del juego** y pertenecen a Soda Den. Ahora van **incluidas dentro de la app** (carpeta `www/img/`), descargadas de la wiki. Publicar en Play Store una app que las incluya sin permiso puede hacer que Google la retire por infringir propiedad intelectual. Opciones:
  1. **Pide permiso a Soda Den** (lo más seguro) y menciónalo en la descripción.
  2. O, antes de publicar, borra la carpeta `www/img/` y vacía la lista de `www/js/img-index.js`: la app volverá a cargar las imágenes de la wiki solo cuando haya internet. También puedes poner `images: false` en `defaults` (`www/js/app.js`) para que salgan desactivadas por defecto.
- Para tu uso personal no hay ningún problema.
- Deja siempre claro que es **no oficial** (ya aparece en la app, el icono de la ficha y «Acerca de»). Google Play rechaza apps que parezcan oficiales.
- Los datos vienen de la **Roots of Pacha Wiki**, con licencia **CC BY-SA 4.0**: hay que citar la fuente (ya está en «Acerca de») y el contenido derivado debe compartirse con la misma licencia. No pongas la app de pago ni añadas restricciones a esos datos.
- Si quieres ir sobre seguro, puedes escribir a Soda Den (el estudio) para pedir permiso antes de publicar.

## Diseño: «hoguera del clan»

Estética cozy de la Edad de Piedra: arcilla, pieles, madera, pigmentos de ocre y luz de hoguera. Todo el aspecto sale de los tokens de `www/css/theme.css`; cambiando un valor ahí cambia en toda la app.

- **Tipografías** (licencia SIL OFL, incluidas en `www/fonts/` para que funcionen sin conexión): **Grandstander** para títulos y **Nunito** para texto y datos (sus cifras ya son tabulares).
- **Paleta**: fondo arcilla `#F3E6D0` / `#EAD7B7`, superficies `#E2C9A0` / `#CDAE80`, texto carbón `#3B2A20` (secundario `#5E4433`), ocre rojo `#B5583A` (botones `#A04B30`), ocre amarillo `#D9A441`, musgo `#7E8B55`, agua `#7A9A9A` (solo pesca). Modo oscuro: cueva a la luz de la hoguera `#2E241D` / `#3A2D24`, texto `#F3E6D0`.
- **Estaciones**: mezclas suaves de la paleta con la arcilla (primavera musgo, verano ocre amarillo, otoño ocre rojo, invierno agua helada).
- **Contraste**: todo el texto cumple WCAG AA (4,5:1) sobre su superficie, en claro y en oscuro; se comprueba con un script que recorre las pantallas.
- **Formas**: tarjetas como lajas con esquinas irregulares, botones como cantos rodados que se hunden al pulsar, chips como piedras pintadas, separadores de puntos y trazos de pigmento, sombras marrones cortas. Grano de arcilla muy sutil de fondo (SVG `feTurbulence`), siempre detrás de superficies lisas.
- **Iconos** propios en estilo pintura rupestre (hoguera, luna con marcas, brote, figuras, cesta) y la **mano estampada** como motivo (en «Hoy», en estados vacíos y en Acerca de). Las imágenes del juego se muestran tal cual, en pixel art.
- **Movimiento** lento y suave (asentamiento de tarjetas, hoguera que parpadea en la carga); se desactiva con «reducir movimiento».

## Actualizar datos

Todo está en `www/js/data.js`, en listas fáciles de leer. Por ejemplo, para cambiar un cultivo edita su línea en `CROPS_RAW`. Las traducciones de objetos están en `www/js/i18n.js`.

Recetas, ideas, minerales, herramientas, artesanía y bichos están en `www/js/data-extra.js` (con sus traducciones al principio del archivo).

Si alguna imagen no aparece, es que en la wiki el archivo tiene otro nombre. Búscalo en la wiki (página del objeto → clic en la imagen → nombre del archivo) y añádelo en `www/js/images.js`. Para que funcione sin conexión, descarga el archivo a `www/img/` (cambiando espacios y símbolos por `_`) y añade su nombre original a `www/js/img-index.js`.

## Créditos

Datos: Official Roots of Pacha Wiki (rootsofpacha.wiki.gg), CC BY-SA 4.0. *Roots of Pacha* es una marca de sus propietarios; esta app no está afiliada a Soda Den ni a Crytivo.
