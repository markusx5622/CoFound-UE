---
name: cofound-visual-export
description: >-
  Exporta maquetas HTML/CSS/SVG de CoFound UE (`design.html`) a imágenes PNG de alta
  resolución (2x) y captura pantallas reales de la app usando Chrome local vía Chrome
  DevTools Protocol (CDP) nativo en Node.js, sin dependencias npm externas. Usar siempre
  que el agente de marketing necesite renderizar carruseles, stories, slides 16:9,
  carteles o capturas reales de `www.cofoundue.es`.
---

# CoFound Visual Export (CDP Nativo)

Esta skill estandariza el contrato HTML y el renderizado a PNG de alta resolución para las piezas visuales de **CoFound UE**, usando el navegador Google Chrome / Microsoft Edge ya instalado en el equipo y el soporte nativo de `WebSocket` de Node.js (sin añadir paquetes a `package.json`).

---

## 1. Contrato obligatorio para `design.html`

Para que el exportador recorte cada lámina con precisión milimétrica, todo archivo `design.html` debe seguir esta convención:

1. **Cada lámina es un bloque `.slide`** con dimensiones explícitas (`data-width`, `data-height`) y nombre de salida (`data-name`):
   ```html
   <section class="slide" data-name="slide-01-portada" data-width="1080" data-height="1350">
     ...
   </section>
   ```
2. **Estilos base del lienzo:**
   - Fijar `width: 1080px; height: 1350px; position: relative; overflow: hidden; box-sizing: border-box;` en cada `.slide` (o `1080x1920` para Stories/Reels, `1920x1080` para aula 16:9, `2480x3508` para A4 a 300 DPI con `--scale 1`).
   - En modo previsualización normal (al abrir `design.html` en navegador), puedes centrar las slides en columna con `gap` y fondo oscuro neutro; el exportador aísla automáticamente cada `.slide` a `margin: 0; padding: 0` durante la captura.
3. **Rutas de activos:**
   - El script levanta un servidor HTTP local en la raíz del repositorio. Usa rutas absolutas desde la raíz del repo:
     - Logo 2.0: `/marketing/assets/logo-2.0.png`
     - OpenGraph: `/marketing/assets/opengraph-1200x630.png`
     - QR vectorizado (preferido): `/marketing/assets/qr-cofoundue.svg`
     - Capturas de la app: `/marketing/assets/screenshots/<archivo>.png`
   - Si una pieza incluye un fondo generado localmente en la misma carpeta (ej. `bg-registro-b.png`), enlázalo con ruta relativa `./bg-registro-b.png`.
4. **Fuentes oficiales (Google Fonts):**
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link
     href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
     rel="stylesheet"
   />
   ```
   El exportador espera automáticamente a `document.fonts.ready` y a la decodificación completa de todas las etiquetas `<img>` antes de disparar la captura.

---

## 2. Exportar un `design.html` a PNG 2x

Ejecuta el script desde la raíz del repositorio:

```powershell
# Carruseles Instagram (1080x1350 -> 2160x2700 a escala 2x), Stories (1080x1920 -> 2160x3840) o 16:9 (1920x1080 -> 3840x2160)
node .agents/skills/cofound-visual-export/scripts/export-slides.mjs marketing/instagram/2026-11-23-mi-pieza/design.html

# Guardar en subcarpeta específica o usar escala 1x (para carteles A4 2480x3508 / A3 3508x4961 a 300 DPI)
node .agents/skills/cofound-visual-export/scripts/export-slides.mjs marketing/print/2026-11-23-cartel-a4/design.html --scale 1
```

### Flags disponibles
- `--out <ruta>`: Carpeta de salida para modo slides (por defecto, la misma carpeta que `design.html`) o ruta del archivo `.png` en modo `--url`.
- `--scale <num>`: Factor de densidad de píxeles (`deviceScaleFactor`). Por defecto `2`. Usa `1` cuando el lienzo ya esté definido a resolución final de imprenta (300 DPI).
- `--wait <ms>`: Espera extra tras `fonts.ready` + `img.decode()` (por defecto `250` ms; útil para animaciones CSS o páginas remotas).
- `--only <indice|nombre>`: Exporta únicamente una lámina concreta (por ejemplo `--only 1` o `--only slide-01-portada`) al iterar correcciones rápidas.

---

## 3. Capturar una pantalla real de la web (`--url`)

Para refrescar capturas reales de `https://www.cofoundue.es` en `marketing/assets/screenshots/`:

```powershell
node .agents/skills/cofound-visual-export/scripts/export-slides.mjs `
  --url https://www.cofoundue.es `
  --out marketing/assets/screenshots/landing-hero-mobile.png `
  --width 390 --height 844 --scale 2 --wait 1500
```

Flags opcionales en modo `--url`:
- `--scroll <px>`: Desplaza la ventana verticalmente antes de capturar.
- `--click <selectorCSS>`: Hace clic en un elemento antes de esperar y capturar (ej. expandir secciones móviles).
- `--mobile`: Activa emulación táctil/móvil (`mobile: true`).

---

## 4. Verificación visual obligatoria (QA)

Tras ejecutar el exportador:
1. Comprueba en la salida de consola que cada PNG tiene exactamente las dimensiones esperadas (`2160x2700`, `2160x3840`, `3840x2160`, etc.).
2. **Inspecciona visualmente cada PNG generado con `read_file`** antes de dar la tarea por terminada: verifica que no haya texto cortado, solapamientos, contraste pobre, fuentes fallback, bordes defectuosos en el Logo 2.0 ni elementos invadiendo las zonas seguras de Instagram.
3. Si detectas cualquier defecto visual, corrige `design.html` y vuelve a exportar solo la lámina afectada con `--only`.
