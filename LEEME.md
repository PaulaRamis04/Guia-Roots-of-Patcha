# Guía Pacha — guía no oficial de Roots of Pacha

App Android (y web) con toda la información útil de *Roots of Pacha*, en español y sin conexión:

- **Hoy**: el día de tu partida, cumpleaños y festivales de hoy y de los próximos 7 días, qué cultivos aún llegan a tiempo si los plantas hoy y peces de temporada.
- **Calendario** de las 4 estaciones con cumpleaños, festivales y carreras.
- **Cultivos** (49): estación, días de crecimiento, rebrote, dónde encontrar la semilla, contribución por calidad, calculadora de siembra y a quién regalarlo.
- **Aldeanos** (58): cumpleaños, clan, romance, lo que les encanta, gusta y odian, buscador por regalo («¿a quién le gusta la calabaza?») y control de los 2 regalos semanales.
- **Imágenes de la wiki** de aldeanos, cultivos, objetos de regalo, peces, plantas y animales. Se descargan de rootsofpacha.wiki.gg la primera vez (necesita internet) y quedan en caché; sin conexión se ven iconos. Se pueden desactivar en Ajustes.
- **Pesca** (52) con lista de capturados, **animales**, **recolección**, **festivales**, **profecías** con lista de tareas, **primeros pasos**, favoritos, modo oscuro y buscador global.

## Estructura

```
pacha-guia/
├── www/            ← la app (HTML, CSS y JS). Aquí se cambian los datos y el diseño.
│   ├── js/data.js  ← todos los datos del juego
│   └── js/images.js← de qué archivo de la wiki sale cada imagen
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
- **Las imágenes de personajes, objetos y animales son del juego** y pertenecen a Soda Den. La app no las incluye: las carga de la wiki. Aun así, publicar en Play Store una app que las muestre sin permiso puede hacer que Google la retire por infringir propiedad intelectual. Opciones:
  1. **Pide permiso a Soda Den** (lo más seguro) y menciónalo en la descripción.
  2. O publica con las imágenes desactivadas por defecto: en `www/js/app.js`, cambia `images: true` por `images: false` en `defaults`. Cada persona podrá activarlas en Ajustes.
- Para tu uso personal no hay ningún problema.
- Deja siempre claro que es **no oficial** (ya aparece en la app, el icono de la ficha y «Acerca de»). Google Play rechaza apps que parezcan oficiales.
- Los datos vienen de la **Roots of Pacha Wiki**, con licencia **CC BY-SA 4.0**: hay que citar la fuente (ya está en «Acerca de») y el contenido derivado debe compartirse con la misma licencia. No pongas la app de pago ni añadas restricciones a esos datos.
- Si quieres ir sobre seguro, puedes escribir a Soda Den (el estudio) para pedir permiso antes de publicar.

## Actualizar datos

Todo está en `www/js/data.js`, en listas fáciles de leer. Por ejemplo, para cambiar un cultivo edita su línea en `CROPS_RAW`. Las traducciones de objetos están en `www/js/i18n.js`.

Si alguna imagen no aparece, es que en la wiki el archivo tiene otro nombre. Búscalo en la wiki (página del objeto → clic en la imagen → nombre del archivo) y añádelo en `www/js/images.js`.

## Créditos

Datos: Official Roots of Pacha Wiki (rootsofpacha.wiki.gg), CC BY-SA 4.0. *Roots of Pacha* es una marca de sus propietarios; esta app no está afiliada a Soda Den ni a Crytivo.
