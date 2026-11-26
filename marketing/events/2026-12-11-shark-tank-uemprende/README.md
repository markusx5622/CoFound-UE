# CoFound UE — Pack Oficial Shark Tank UEmprende (11 de Diciembre)

Material oficial de preparación y defensa de **CoFound UE** para la sesión de pitches estilo *Shark Tank* (3 minutos) en la jornada del **Club UEmprende** de la Universidad Europea de Valencia (11 de diciembre).

---

## Contenido del Pack

| Archivo | Descripción | Formato |
|---|---|---|
| [`pitch-deck-shark-tank-11d.pdf`](./pitch-deck-shark-tank-11d.pdf) | Deck de proyección oficial (6 diapositivas) | PDF 16:9 (4K, sin márgenes) |
| [`guion-y-qa-jurado.md`](./guion-y-qa-jurado.md) | Guión cronometrado a 3:00 min, defensa ante jurado (8 preguntas) y checklist del evento | Markdown |
| [`email-respuesta-mauro.md`](./email-respuesta-mauro.md) | Respuesta de confirmación y propuesta de roles al presidente del Club UEmprende | Markdown |
| [`design.html`](./design.html) | Maqueta de diseño responsive 16:9 con fondos de partículas deterministas y estilos oficiales | HTML / CSS |

---

## Estructura del Pitch Deck (6 Slides · 3:00 min)

1. **`0:00 – 0:20` · Slide 1 (Portada & Gancho):** *«El talento está en el campus. Los equipos, no.»* Presentación de Marc Cubero y CoFound UE.
2. **`0:20 – 0:50` · Slide 2 (El Problema Real):** Fricción entre Campus Turia (Tech, Diseño, Negocio) y Campus Alameda (Salud, Deporte, Biotecnología).
3. **`0:50 – 1:30` · Slide 3 (El Producto en Vivo):** Demostración del flujo en 3 pasos con captura real de la app en móvil.
4. **`1:30 – 2:05` · Slide 4 (Diferencial e Ingeniería):** Acceso cerrado `@live.uem.es` / `@universidadeuropea.es`, bilingüe ES/EN, PWA, RGPD y 41 tests en CI.
5. **`2:05 – 2:35` · Slide 5 (Piloto y Escalado):** Fase 1 piloto gratuito en Valencia (WAU, Conversión, Time-to-Match) y Fase 2 B2B (*white-label* e inserción empresarial).
6. **`2:35 – 3:00 + Q&A` · Slide 6 (Cierre & QR en Directo):** QR gigante de alta legibilidad para dejarlo fijo durante las preguntas del jurado y captar registros en directo.

---

## Cómo Re-exportar las Diapositivas a PNG 4K y PDF

```bash
# 1. Exportar diapositivas a 4K PNG (escala 2x sobre 1920x1080)
node .agents/skills/cofound-visual-export/scripts/export-slides.mjs marketing/events/2026-12-11-shark-tank-uemprende/design.html --scale 2

# 2. Generar el PDF 16:9 sin márgenes
node scratch/build-shark-tank-pdf.mjs
```
