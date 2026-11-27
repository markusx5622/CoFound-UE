# CoFound UE — Kit Maestro de Código, Tokens y Plantillas Visuales

> Archivo de referencia técnica para la Skill `cofound-ue-brand-studio` en Google Gemini.  
> Usa siempre estos tokens CSS, este motor de partículas `<canvas>`, estos iconos SVG vectoriales y estas 3 estructuras de lienzo (4:5, 16:9 y A4 300 DPI) al generar cualquier pieza gráfica de **CoFound UE**.

---

## 1. Fuentes Oficiales (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
  rel="stylesheet"
/>
```

- **Titulares, wordmark, badges y números:** `"Space Grotesk", sans-serif` (`letter-spacing: -0.03em`)
- **Cuerpo, subtítulos y tarjetas:** `"Inter", -apple-system, BlinkMacSystemFont, sans-serif`
- **Numeración técnica (`01 / 06`) y etiquetas técnicas:** `"JetBrains Mono", monospace`
- **Cartelería condensada de impacto (solo estilo póster oficial):** `"Anton", Impact, sans-serif`

---

## 2. Tokens CSS Oficiales y Fondo Atmosférico

```css
:root {
  --bg: #09090b;
  --bg-pure: #000000;
  --card: rgba(19, 19, 24, 0.92);
  --card-red: rgba(230, 0, 0, 0.09);
  --border: rgba(63, 63, 70, 0.8);
  --border-red: rgba(230, 0, 0, 0.48);
  --red: #e60000;
  --text-white: #ffffff;
  --text-main: #e4e4e7;
  --text-muted: #a1a1aa;
  --text-dim: #71717a;
  --live-bg: rgba(16, 185, 129, 0.14);
  --live-border: rgba(16, 185, 129, 0.45);
  --live-text: #6ee7b7;
  --live-dot: #10b981;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.028) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.028) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(ellipse at 50% 45%, rgba(0, 0, 0, 0.92) 25%, transparent 82%);
  pointer-events: none;
}

.top-accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;
  background: linear-gradient(90deg, transparent 0%, #e60000 50%, transparent 100%);
}

.glow-tr {
  position: absolute;
  top: -220px; right: -160px;
  width: 780px; height: 780px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(230, 0, 0, 0.24) 0%, rgba(230, 0, 0, 0.05) 48%, transparent 72%);
  pointer-events: none;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content; /* OBLIGATORIO dentro de flex column */
  padding: 9px 18px;
  border-radius: 9999px;
  background: rgba(24, 24, 27, 0.9);
  border: 1.5px solid var(--border);
  font-family: "Space Grotesk", sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #f4f4f5;
}
```

---

## 3. Motor Determinista de Partículas (`<canvas>` estilo Landing Page)

Usa siempre este script para generar el fondo de nodos rojos y blancos conectados sin aleatoriedad impredecible (cada slide usa un `data-seed` distinto):

```html
<canvas class="constellation-canvas" data-density="145" data-maxdist="135" data-seed="901"></canvas>
<script>
  function createRng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  document.querySelectorAll(".slide").forEach((slide) => {
    const canvas = slide.querySelector(".constellation-canvas");
    if (!canvas) return;
    const w = Number(slide.dataset.width || 1080);
    const h = Number(slide.dataset.height || 1350);
    const dpr = w >= 2400 ? 1 : 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rand = createRng(Number(canvas.dataset.seed || 701));
    const density = Number(canvas.dataset.density || 145);
    const maxDist = Number(canvas.dataset.maxdist || 135);
    const scaleFactor = w / 1080;
    const pts = [];

    for (let i = 0; i < density; i++) {
      const isRed = rand() > 0.24;
      pts.push({
        x: rand() * w,
        y: rand() * h,
        r: (rand() * 1.1 + 0.65) * scaleFactor,
        color: isRed
          ? `rgba(230, 0, 0, ${(0.24 + rand() * 0.28).toFixed(2)})`
          : `rgba(255, 255, 255, ${(0.14 + rand() * 0.18).toFixed(2)})`,
      });
    }

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < maxDist) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${((1 - d / maxDist) * 0.085).toFixed(3)})`;
          ctx.lineWidth = 0.65 * scaleFactor;
          ctx.stroke();
        }
      }
    }

    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
  });
</script>
```

---

## 4. Iconos SVG Vectoriales Oficiales (Redes Sociales y UI)

**Regla estricta:** NUNCA escribas `"IG:"` ni `"LinkedIn:"` como texto. Usa siempre estos SVGs exactos con separador `·`:

```html
<div class="footer-social" style="display:inline-flex; align-items:center; gap:20px;">
  <span style="display:inline-flex; align-items:center; gap:10px;">
    <!-- Instagram SVG -->
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
    <span>@cofoundue</span>
  </span>
  <span style="color:#71717a; font-weight:700;">·</span>
  <span style="display:inline-flex; align-items:center; gap:10px;">
    <!-- LinkedIn SVG -->
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
    <span>CoFound UE</span>
  </span>
</div>
```

---

## 4B. Código SVG Literal del QR Oficial de `https://www.cofoundue.es` (COPIAR LITERAL)

> **REGLA CRÍTICA DE INTEGRIDAD:** NUNCA inventes ni reconstruyas una matriz QR en JavaScript ni con IA. Siempre que una pieza incluya código QR, **copia y pega LITERALMENTE** este `<svg>` verificado de 3 líneas (apunta exactamente a `https://www.cofoundue.es` y es 100 % escaneable a cualquier tamaño):

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" shape-rendering="crispEdges" role="img" aria-label="QR oficial https://www.cofoundue.es" style="width:100%; height:100%; display:block;">
  <rect width="33" height="33" fill="#FFFFFF"/>
  <path fill="#000000" d="M4 4h7v1h-7zM13 4h3v1h-3zM17 4h1v1h-1zM22 4h7v1h-7zM4 5h1v1h-1zM10 5h1v1h-1zM13 5h2v1h-2zM16 5h5v1h-5zM22 5h1v1h-1zM28 5h1v1h-1zM4 6h1v1h-1zM6 6h3v1h-3zM10 6h1v1h-1zM12 6h1v1h-1zM16 6h1v1h-1zM19 6h2v1h-2zM22 6h1v1h-1zM24 6h3v1h-3zM28 6h1v1h-1zM4 7h1v1h-1zM6 7h3v1h-3zM10 7h1v1h-1zM12 7h1v1h-1zM14 7h2v1h-2zM17 7h3v1h-3zM22 7h1v1h-1zM24 7h3v1h-3zM28 7h1v1h-1zM4 8h1v1h-1zM6 8h3v1h-3zM10 8h1v1h-1zM12 8h1v1h-1zM14 8h2v1h-2zM20 8h1v1h-1zM22 8h1v1h-1zM24 8h3v1h-3zM28 8h1v1h-1zM4 9h1v1h-1zM10 9h1v1h-1zM12 9h2v1h-2zM16 9h1v1h-1zM18 9h3v1h-3zM22 9h1v1h-1zM28 9h1v1h-1zM4 10h7v1h-7zM12 10h1v1h-1zM14 10h1v1h-1zM16 10h1v1h-1zM18 10h1v1h-1zM20 10h1v1h-1zM22 10h7v1h-7zM12 11h2v1h-2zM15 11h1v1h-1zM18 11h3v1h-3zM4 12h1v1h-1zM6 12h5v1h-5zM13 12h2v1h-2zM16 12h5v1h-5zM22 12h5v1h-5zM5 13h3v1h-3zM9 13h1v1h-1zM14 13h1v1h-1zM16 13h1v1h-1zM18 13h1v1h-1zM20 13h1v1h-1zM23 13h1v1h-1zM27 13h1v1h-1zM5 14h2v1h-2zM8 14h6v1h-6zM15 14h1v1h-1zM17 14h1v1h-1zM19 14h1v1h-1zM21 14h1v1h-1zM23 14h3v1h-3zM27 14h2v1h-2zM5 15h1v1h-1zM9 15h1v1h-1zM12 15h1v1h-1zM14 15h2v1h-2zM18 15h4v1h-4zM28 15h1v1h-1zM6 16h2v1h-2zM9 16h3v1h-3zM13 16h1v1h-1zM15 16h1v1h-1zM19 16h1v1h-1zM21 16h2v1h-2zM24 16h1v1h-1zM26 16h3v1h-3zM4 17h1v1h-1zM6 17h1v1h-1zM9 17h1v1h-1zM13 17h1v1h-1zM16 17h2v1h-2zM20 17h1v1h-1zM23 17h1v1h-1zM25 17h1v1h-1zM27 17h1v1h-1zM4 18h1v1h-1zM7 18h5v1h-5zM13 18h1v1h-1zM17 18h3v1h-3zM21 18h5v1h-5zM27 18h2v1h-2zM4 19h1v1h-1zM7 19h3v1h-3zM13 19h1v1h-1zM16 19h2v1h-2zM20 19h1v1h-1zM23 19h2v1h-2zM28 19h1v1h-1zM4 20h1v1h-1zM9 20h3v1h-3zM13 20h1v1h-1zM16 20h1v1h-1zM18 20h1v1h-1zM20 20h5v1h-5zM26 20h1v1h-1zM12 21h1v1h-1zM19 21h2v1h-2zM24 21h2v1h-2zM4 22h7v1h-7zM14 22h3v1h-3zM20 22h1v1h-1zM22 22h1v1h-1zM24 22h1v1h-1zM26 22h3v1h-3zM4 23h1v1h-1zM10 23h1v1h-1zM12 23h1v1h-1zM15 23h1v1h-1zM18 23h1v1h-1zM20 23h1v1h-1zM24 23h2v1h-2zM28 23h1v1h-1zM4 24h1v1h-1zM6 24h3v1h-3zM10 24h1v1h-1zM12 24h4v1h-4zM19 24h6v1h-6zM26 24h3v1h-3zM4 25h1v1h-1zM6 25h3v1h-3zM10 25h1v1h-1zM12 25h2v1h-2zM16 25h3v1h-3zM21 25h2v1h-2zM24 25h5v1h-5zM4 26h1v1h-1zM6 26h3v1h-3zM10 26h1v1h-1zM12 26h2v1h-2zM17 26h2v1h-2zM25 26h2v1h-2zM28 26h1v1h-1zM4 27h1v1h-1zM10 27h1v1h-1zM13 27h2v1h-2zM16 27h2v1h-2zM20 27h2v1h-2zM23 27h3v1h-3zM28 27h1v1h-1zM4 28h7v1h-7zM12 28h3v1h-3zM16 28h1v1h-1zM18 28h1v1h-1zM21 28h1v1h-1zM23 28h6v1h-6z"/>
</svg>
```

---

## 4C. Logo Oficial Real de CoFound UE (PROHIBIDO redibujarlo en SVG)

> **REGLA CRÍTICA DE IDENTIDAD:** NUNCA intentes redibujar, aproximar ni reconstruir el logo de CoFound UE en `<svg>`. Usa **SIEMPRE** la imagen oficial servida en producción desde `https://www.cofoundue.es/CoFoundUE_logo.png` con recorte *squircle* (`border-radius: 22%`) y `object-fit: cover`:

```html
<!-- Tamaño grande (portadas / tarjetas hero) -->
<img
  src="https://www.cofoundue.es/CoFoundUE_logo.png"
  alt="CoFound UE"
  style="width: 108px; height: 108px; border-radius: 24px; object-fit: cover; box-shadow: 0 18px 44px rgba(230, 0, 0, 0.34); display: block;"
/>

<!-- Tamaño pequeño (pies de diapositiva / footer) -->
<img
  src="https://www.cofoundue.es/CoFoundUE_logo.png"
  alt="CoFound UE"
  style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; display: block;"
/>
```

---

## 5. Contratos de Formato y `@media print` para PDF Vectorial

### A. Carrusel LinkedIn / Instagram 4:5 (`1080×1350`)
- Padding interno: `78px 82px` (protege cuadrícula 3:4 y deja libre la esquina superior derecha `120×70px` en **TODAS** las slides — coloca `01 / 04`, `02 / 04`, etc. únicamente en el pie inferior derecho para no chocar con el indicador nativo `1/4` de Instagram).
- En Slide 1 (portada), centrar el titular y foco dentro de la banda central `1080×1080`.
- Regla `@media print` para PDF carrusel LinkedIn (0 márgenes):
```css
@media print {
  @page { size: 11.25in 14.0625in; margin: 0; }
  body { margin: 0; padding: 0; gap: 0; background: #09090b; }
  .slide { page-break-after: always; break-after: page; }
  .slide:last-child { page-break-after: auto; break-after: auto; }
}
```

### B. Presentación / Pitch Deck / Diapositiva de Aula 16:9 (`1920×1080`)
- Padding interno: `74px 96px 60px 96px`.
- Numeración de página únicamente en el pie inferior derecho (`01 / 06`), nunca duplicada arriba.
- Slide de cierre siempre con **QR gigante** (`490×490px` dentro de caja blanca `#FFFFFF`) para dejar proyectada durante preguntas del jurado o cierre de clase.
- Regla `@media print` para PDF 16:9:
```css
@media print {
  @page { size: 20in 11.25in; margin: 0; }
  body { margin: 0; padding: 0; gap: 0; background: #09090b; }
  .slide { page-break-after: always; break-after: page; }
  .slide:last-child { page-break-after: auto; break-after: auto; }
}
```

### C. Cartelería Impresa A4 300 DPI (`2480×3508`)
- Padding interno: `150px 156px 128px 156px` (márgenes de corte seguros `>= 120px`).
- QR en caja blanca `#FFFFFF` (`>= 600×600px` con `padding: 46px` de zona de silencio).
- Tarjetas rojas completas de titulaciones por campus:
  - **Turia:** `Ingeniería & Tech`, `Ciencia de Datos & Física`, `Arquitectura & Diseño`, `ADE & Finanzas`, `Marketing`, `Derecho & RR.II.`, `Criminología` + `+ Salud y Deporte (Alameda)`.
  - **Alameda:** `Fisioterapia`, `Enfermería`, `Psicología`, `Odontología`, `Biomedicina`, `Biotecnología`, `CAFYD`, `Nutrición` + `+ Tech, Diseño y Empresa (Turia)`.
- Disclaimer legal obligatorio al pie: `Iniciativa estudiantil independiente, sin afiliación oficial con la Universidad Europea · © 2026 Marc Cubero Cantavella`.
- Regla `@media print` exacta A4 sin márgenes:
```css
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  body { margin: 0; padding: 0; background: #000000; }
}
```
