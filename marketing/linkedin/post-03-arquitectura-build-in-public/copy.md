# Post 03 — Detrás del Código: Arquitectura, Seguridad y RGPD (LinkedIn)

- **Momento:** Pre-lanzamiento (+6 / +7 días · posicionamiento de solvencia técnica antes del Día 11).
- **Formato LinkedIn:** **Carrusel de Documento PDF** (`carrusel-linkedin.pdf`, 5 páginas `1080×1350`, también disponible en PNG `2x` `2160×2700`).
- **Título para el documento en LinkedIn:** `CoFound UE — Arquitectura, Seguridad y RGPD en Producción`

---

## Versión A — Página de Empresa (`CoFound UE`)

Cuando construyes una plataforma exclusiva para estudiantes universitarios, el diseño importa, pero la confianza lo es todo.

Desde la primera línea de código de **CoFound UE** decidimos tratar el piloto universitario con los mismos estándares de seguridad, privacidad y calidad que una aplicación comercial en producción:

• **Exclusividad real en backend:** los dominios `@live.uem.es` y `@universidadeuropea.es` junto con el email verificado no se comprueban solo en pantalla; se validan en `firestore.rules` ante cualquier petición directa.
• **41 tests automatizados en CI:** cada cambio pasa por Vitest + emulador local de Firestore antes de llegar a producción.
• **Privacidad RGPD por diseño:** nunca exponemos emails en perfiles públicos, pedimos consentimiento explícito y el derecho al olvido elimina en cascada perfil, proyectos, postulaciones y mensajes previa reautenticación.
• **Pensada para el móvil (95 % del uso):** PWA instalable, modo oscuro coherente y traducción bilingüe ES/EN en 2 capas.

En el documento te contamos la arquitectura completa. El código fuente está abierto como portafolio técnico en GitHub (enlace en el primer comentario 👇).

#CoFoundUE #IngenieriaDeSoftware #NextJS #Firebase #Ciberseguridad

### Primer comentario sugerido (`CoFound UE`)
> Repositorio abierto en GitHub: https://github.com/markusx5622/CoFound-UE  
> Plataforma en producción: https://www.cofoundue.es

---

## Versión B — Perfil Personal (`Marc Cubero Cantavella`)
*(Publicar 30–60 minutos después con el mismo `carrusel-linkedin.pdf` — ideal para conectar con comunidad dev de Valencia, VDS, docentes e industria).*

Construir un MVP universitario que «funcione en local» lleva un fin de semana.
Dejarlo listo para que entren cientos de compañeros desde el móvil con seguridad real, privacidad y cero fricción lleva mucho más trabajo invisible.

A pocos días de abrir **@CoFound UE** al público el día 11, comparto en este documento las decisiones técnicas que hay debajo de la aplicación:

1. **Stack full-stack ligero y rápido:** Next.js 14 (App Router), TypeScript estricto, Tailwind CSS, Firebase Auth y Cloud Firestore.
2. **Defensa en profundidad:** validación de correo institucional y `email_verified` en reglas de Firestore, API Key restringida por orígenes y APIs en Google Cloud, protección contra enumeración de usuarios, 7 cabeceras HTTP de seguridad y CSP estricta.
3. **Testing continuo:** 41 tests automatizados de reglas de seguridad y ciclo completo (Vitest + emulador de Firestore en GitHub Actions).
4. **RGPD de verdad, no solo un texto legal:** cero emails en documentos públicos, telemetría sin PII con TTL de 30 días y borrado completo en cascada previa reautenticación.
5. **Bilingüe ES/EN sin inflar costes:** localización nativa para el escaparate oficial y traducción bajo demanda sin dependencias externas para proyectos de alumnos internacionales.

He dejado el repositorio público en GitHub para cualquiera que quiera revisar cómo está montada la arquitectura o proponer mejoras.

Si te interesa ver cómo evoluciona el lanzamiento real en campus, sigue a **@CoFound UE** y desliza las 5 láminas 👇

#BuildInPublic #NextJS #TypeScript #Firebase #IngenieriaDeSoftware #CoFoundUE

### Primer comentario sugerido (`Marc Cubero Cantavella`)
> Código fuente y documentación en GitHub: https://github.com/markusx5622/CoFound-UE  
> Página oficial del proyecto: https://www.linkedin.com/company/cofound-ue  
> App en vivo: https://www.cofoundue.es

---

## Texto alternativo (ALT) de referencia por lámina
1. `slide-01-portada.png`: Portada técnica de CoFound UE titulada «Arquitectura y seguridad detrás de CoFound UE», con el stack Next.js 14, TypeScript, Firebase y la insignia «41/41 Firestore Tests · CI Passing».
2. `slide-02-stack.png`: Esquema del stack full-stack y mobile-first: Next.js 14 App Router, TypeScript estricto, Tailwind CSS, Firebase Auth, Cloud Firestore en tiempo real y PWA instalable.
3. `slide-03-seguridad.png`: Cuatro capas de seguridad en producción: validación institucional en `firestore.rules`, API Key restringida en Google Cloud, CSP estricta + 7 cabeceras HTTP y 41 tests automatizados en GitHub Actions.
4. `slide-04-rgpd-i18n.png`: Privacidad RGPD por diseño (sin emails públicos, borrado en cascada con reautenticación y TTL de 30 días) junto a la traducción bilingüe ES/EN en 2 capas.
5. `slide-05-cierre.png`: Lámina de cierre técnico con enlace al repositorio `github.com/markusx5622/CoFound-UE`, web `www.cofoundue.es` y código QR oficial.
