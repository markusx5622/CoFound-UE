# CoFound UE — Protocolo de Smoke Test Exhaustivo

**Versión:** 1.0 · **Fecha:** Septiembre 2026
**Tester:** Marc Cubero Cantavella (individual)
**Entorno bajo prueba:** Producción — https://cofoundue.es
**Estado del código:** commit `6103f38` (main), CI verde, 19/19 tests de reglas

---

## 0. Preparación previa (OBLIGATORIA antes de empezar)

### 0.1. Lo que necesitas

| Recurso | Detalle |
| --- | --- |
| **Cuenta A** | Tu cuenta real (@live.uem.es) — será la "creadora de proyectos" |
| **Cuenta B** | Una segunda cuenta institucional — será la "postulante". **Imprescindible para probar postulaciones y mensajería.** Opciones: un alias de tu correo si la UE admite sufijos `+` (ej. `tucorreo+test@live.uem.es`), o un compañero que te deje usar la suya 30 minutos |
| **Navegador 1** | Chrome normal (Cuenta A) |
| **Navegador 2** | Chrome incógnito o Firefox (Cuenta B) — así mantienes ambas sesiones abiertas a la vez |
| **Móvil** | El tuyo, con la PWA DESINSTALADA antes de empezar (para probar la instalación limpia) |
| **Papel/notas** | Esta checklist + la plantilla de reporte de bugs de la sección 14 |

### 0.2. Notas de contexto técnico (para interpretar resultados)

- La app NO permite subir avatar (funcionalidad eliminada deliberadamente). Si ves un icono genérico de usuario, es lo CORRECTO.
- Las tarjetas de proyectos antiguos (creados antes del campo `creatorName`) mostrarán "Usuario UE" como creador. Es el fallback esperado, NO un bug.
- La PWA solo registra el service worker en producción (no en localhost).
- Firebase tiene propagación casi instantánea; si algo "no aparece", espera 2-3 segundos antes de declararlo bug.

### 0.3. Cómo registrar resultados

Marca cada test: ✅ Pasa · ❌ Falla · ⚠️ Pasa con observaciones.
Todo ❌ o ⚠️ se documenta con la plantilla de la sección 14 y se clasifica con la severidad de la sección 15.

---

## 1. Pre-flight: despliegue y carga inicial

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 1.1 | Web accesible | Abrir https://cofound-ue.vercel.app | Carga sin errores, landing visible | ☐ |
| 1.2 | Velocidad de carga | Recargar con Ctrl+Shift+R (sin caché) y cronometrar | Primera carga < 4s en WiFi normal (los assets se optimizaron a <500 KB) | ☐ |
| 1.3 | Consola sin errores | F12 → Consola → recargar | Sin errores rojos (warnings amarillos menores son aceptables; anótalos) | ☐ |
| 1.4 | Manifest servido | Visitar https://cofound-ue.vercel.app/manifest.webmanifest | JSON del manifest visible con name "CoFound UE" | ☐ |
| 1.5 | Service worker | F12 → Application → Service Workers | `/sw.js` registrado y activado (tras unos segundos) | ☐ |


---

## 2. Landing page y metadatos

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 2.1 | Renderizado completo | Scroll por toda la landing | Hero, features, cómo funciona, visión, footer — todo renderiza sin secciones rotas | ☐ |
| 2.2 | Enlaces internos | Click en cada enlace del menú/footer de la landing | Navegan a su sección/página correcta | ☐ |
| 2.3 | Footer legal | Leer el pie de página | "© 2026 Marc Cubero Cantavella · CoFound UE. Todos los derechos reservados." y "Diseñado y desarrollado por Marc Cubero Cantavella" | ☐ |
| 2.4 | Email de contacto | Leer el email del footer | `cofoundue@gmail.com` (NO contacto@cofoundue.com) | ☐ |
| 2.5 | Compartir (OG) | Pegar la URL en un chat de WhatsApp | Tarjeta con imagen og-image (icono rojo + CoFound UE), título y descripción. Sin recortes feos | ☐ |
| 2.6 | Favicon | Mirar la pestaña del navegador | Icono de CoFound UE visible | ☐ |

---

## 3. Autenticación y control de acceso

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 3.1 | Registro con email NO institucional | Intentar registrarse con @gmail.com | Rechazado con mensaje claro en español | ☐ |
| 3.2 | Registro con email institucional | Registrar Cuenta B con @live.uem.es | Registro exitoso, redirige al interior | ☐ |
| 3.3 | Contraseña débil | Intentar registrar con contraseña "123" | Error de Firebase traducido al español (no texto técnico en inglés) | ☐ |
| 3.4 | Login incorrecto | Login con contraseña errónea | Mensaje de error amigable en español | ☐ |
| 3.5 | Login correcto | Login con Cuenta A | Acceso al dashboard | ☐ |
| 3.6 | Rutas protegidas sin sesión | En incógnito SIN login, abrir directamente: /dashboard, /perfil, /dashboard/nuevo, /dashboard/mensajes | Todas redirigen a la landing | ☐ |
| 3.7 | Cierre de sesión | Click "Cerrar Sesión" | Vuelve a landing; al intentar volver a /dashboard, redirige | ☐ |
| 3.8 | Persistencia de sesión | Login → cerrar pestaña → reabrir la URL | Sesión conservada (no pide login de nuevo) | ☐ |

---

## 4. Perfil de usuario

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 4.1 | Avatar NO subible | Ir a /perfil | NO existe ningún control para subir foto (solo visualización estática). Sin texto "JPG, PNG, máx 2MB" | ☐ |
| 4.2 | Completar perfil | Rellenar nombre, titulación, campus (Valencia), bio, 3-4 skills → Guardar | Toast de éxito; recargar la página y los datos persisten | ☐ |
| 4.3 | Skills duplicadas | Intentar añadir la misma skill dos veces | No se duplica | ☐ |
| 4.4 | Eliminar skill | Click en la X de una skill → guardar | Desaparece y persiste tras recargar | ☐ |
| 4.5 | Perfil público | Abrir /perfil/[tu-uid] (enlace desde un proyecto o chat) | Vista pública del perfil con tus datos | ☐ |
| 4.6 | Repetir con Cuenta B | Completar el perfil de B con nombre DISTINTO | B tiene su propio perfil independiente | ☐ |

---

## 5. Publicación de proyectos (Cuenta A)

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 5.1 | Publicación válida | /dashboard/nuevo → título, descripción (>20 chars), categoría, 2 perfiles → Publicar | Toast de éxito, redirige al dashboard, el proyecto aparece el primero | ☐ |
| 5.2 | Nombre del creador | Ver la tarjeta del proyecto en el dashboard | Muestra tu NOMBRE real (no "Creador ID", no "Anónimo") | ☐ |
| 5.3 | Detalle muestra creador | Abrir el detalle del proyecto | "Creado por [tu nombre]" con enlace a tu perfil público | ☐ |
| 5.4 | Límite de título | Intentar escribir >100 chars en el título | El campo no lo permite; contador "X/100" visible | ☐ |
| 5.5 | Límite de descripción | Intentar escribir >1500 chars | Bloqueado; contador "X/1500" visible | ☐ |
| 5.6 | Mínimos | Título de 2 chars + descripción de 10 chars → Publicar | Toast de error explicativo, NO se publica | ☐ |
| 5.7 | Sin perfiles | Rellenar todo pero no añadir perfiles → Publicar | Error: se exige al menos 1 perfil | ☐ |
| 5.8 | Máximo de perfiles | Intentar añadir 11 perfiles | El 11.º se rechaza con toast "Máximo 10 perfiles" | ☐ |
| 5.9 | Perfil duplicado | Añadir "Developer" dos veces | No se duplica | ☐ |
| 5.10 | Proyecto sin nombre en perfil | (Opcional, con una cuenta C sin perfil completado) Intentar publicar | Redirige a /perfil con toast "Completa tu perfil antes de publicar" | ☐ |

---

## 6. Dashboard y exploración

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 6.1 | Listado | Abrir /dashboard | Proyectos en grid, más recientes primero | ☐ |
| 6.2 | Búsqueda | Buscar una palabra del título de tu proyecto | Filtra correctamente; búsqueda sin resultados muestra estado vacío adecuado | ☐ |
| 6.3 | Filtro por categoría | Filtrar por "TFG" / "Startup Real" | Solo proyectos de esa categoría | ☐ |
| 6.4 | Combinación | Búsqueda + categoría a la vez | Ambos filtros se aplican conjuntamente | ☐ |
| 6.5 | Estado vacío | Buscar texto absurdo ("xyzqqq") | Mensaje de "no se encontraron proyectos" correcto, sin errores | ☐ |
| 6.6 | Paginación | (Si hay >12 proyectos) "Cargar más" | Carga la siguiente página sin duplicados | ☐ |
| 6.7 | Skeleton loaders | Recargar el dashboard | Skeletons visibles durante la carga, luego contenido | ☐ |

---

## 7. Postulaciones (interacción A ↔ B)

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 7.1 | Postularse (B) | Con Cuenta B, abrir el proyecto de A → "Postularme" | Toast de éxito; botón cambia a "Ya postulado" (verde) | ☐ |
| 7.2 | Anti-duplicado | B recarga la página e intenta postularse de nuevo | Botón deshabilitado "Ya postulado"; imposible duplicar | ☐ |
| 7.3 | Anti-autopostulación | Con Cuenta A, abrir su PROPIO proyecto | Botón deshabilitado; no puede postularse a sí misma | ☐ |
| 7.4 | Badge en Navbar (A) | A mira su Navbar | Badge rojo con "1" sobre "Mis Proyectos" | ☐ |
| 7.5 | Mis Postulaciones (B) | B abre /dashboard/mis-postulaciones | Su postulación aparece con estado "pending" y título del proyecto | ☐ |
| 7.6 | Candidatos (A) | A abre Mis Proyectos → modal/página de candidatos del proyecto | Ve a B con su nombre (no ID crudo) | ☐ |
| 7.7 | Cambio de estado (A) | A acepta/rechaza a B (si la UI lo permite) | El estado se actualiza y B lo ve reflejado en Mis Postulaciones | ☐ |

---

## 8. Mensajería en tiempo real (A ↔ B, ambas sesiones abiertas)

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 8.1 | Acceso al chat | B abre /dashboard/mensajes | Ve la conversación con A (nombre de A + título del proyecto) | ☐ |
| 8.2 | Envío B→A | B escribe "Hola, me interesa el proyecto" → enviar | Mensaje aparece al instante en su chat (burbuja derecha, roja) | ☐ |
| 8.3 | Recepción en tiempo real | SIN recargar, A mira su Navbar | Badge rojo en "Mensajes" con contador | ☐ |
| 8.4 | Punto rojo en conversación | A abre /dashboard/mensajes | Punto rojo junto a la conversación de B | ☐ |
| 8.5 | Lectura limpia indicadores | A abre la conversación | Badge del Navbar y punto rojo DESAPARECEN | ☐ |
| 8.6 | Respuesta A→B | A responde → B recibe badge/punto sin recargar | Funciona en sentido contrario | ☐ |
| 8.7 | Sin auto-notificación | A envía mensaje y mira su propio Navbar | A NO ve badge por sus propios mensajes | ☐ |
| 8.8 | Límite de mensaje | Intentar enviar >1000 caracteres | El campo no lo permite | ☐ |
| 8.9 | Mensaje vacío | Intentar enviar vacío o solo espacios | Botón deshabilitado / no se envía | ☐ |
| 8.10 | Orden y scroll | Intercambiar 10+ mensajes | Orden cronológico correcto, scroll automático al último | ☐ |
| 8.11 | Enlace "Ver Perfil" | Desde el chat, click en "Ver Perfil" | Abre el perfil público del otro usuario | ☐ |
| 8.12 | Persistencia | Cerrar y reabrir el navegador | El historial de mensajes sigue ahí | ☐ |

---

## 9. Gestión de proyectos propios (Cuenta A)

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 9.1 | Editar proyecto | Mis Proyectos → editar → cambiar título → guardar | Cambio reflejado en dashboard y detalle | ☐ |
| 9.2 | Edición respeta límites | Intentar guardar título de 2 chars | Validación lo impide | ☐ |
| 9.3 | Borrado en cascada | Borrar el proyecto que tiene la postulación y mensajes de B | Proyecto eliminado del dashboard; las postulaciones asociadas también desaparecen (B ya no la ve en Mis Postulaciones); la conversación deja de ser accesible | ☐ |
| 9.4 | Confirmación de borrado | Al borrar | Pide confirmación (no borra con un solo click accidental) | ☐ |

---

## 10. PWA en móvil

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 10.1 | Instalación | Chrome móvil → menú ⋮ → "Añadir a pantalla de inicio" | Se instala como "CoFound UE" | ☐ |
| 10.2 | Icono SIN reborde | Mirar el icono instalado | Icono rojo limpio, SIN reborde/marco negro alrededor | ☐ |
| 10.3 | Modo standalone | Abrir desde el icono | Se abre a pantalla completa, SIN barra del navegador | ☐ |
| 10.4 | Start URL | Al abrir la PWA | Arranca en /dashboard (si hay sesión) o landing | ☐ |
| 10.5 | Sesión en PWA | Login dentro de la PWA | Funciona y persiste al cerrar/abrir | ☐ |
| 10.6 | Navegación completa en PWA | Recorrer: dashboard, detalle, mensajes, perfil, nuevo | Todo usable en formato app | ☐ |
| 10.7 | Comportamiento offline | Activar modo avión → abrir la PWA | Degrada con elegancia (logo/estáticos en caché; datos no, es esperado — pero no pantalla en blanco rota) | ☐ |

---

## 11. Responsive (móvil + desktop)

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 11.1 | Landing móvil | Recorrer toda la landing en el móvil | Ninguna caja desbordada, texto legible, sin scroll horizontal | ☐ |
| 11.2 | Dashboard móvil | Ver tarjetas de proyectos | 1 columna, tarjetas completas, botones accesibles | ☐ |
| 11.3 | Navbar móvil | Abrir menú hamburguesa | Todos los enlaces + badges visibles; cierra al navegar | ☐ |
| 11.4 | Chat móvil | Usar mensajes en el móvil | Vista lista ↔ chat con botón "← Volver"; teclado no rompe el layout | ☐ |
| 11.5 | Formularios móvil | /dashboard/nuevo y /perfil en móvil | Campos apilados, contadores visibles, botón de envío accesible | ☐ |
| 11.6 | Detalle proyecto móvil | Abrir un proyecto | Título, descripción y botón "Postularme" sin solapamientos | ☐ |
| 11.7 | Desktop ancho | En pantalla grande (>1440px) recorrer las mismas vistas | Contenido centrado con max-width, sin estiramientos raros | ☐ |

---

## 12. Páginas legales

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 12.1 | Aviso Legal | /legal/aviso-legal | Titular: Marc Cubero Cantavella; email cofoundue@gmail.com; nota de independencia de la UE; fecha actualizada | ☐ |
| 12.2 | Privacidad | /legal/privacidad | Responsable identificado; menciona mensajería privada, Firebase/Vercel, derechos ARCO con email real | ☐ |
| 12.3 | Cookies | /legal/cookies | Menciona Firebase Auth y Vercel Analytics (NO Google Analytics 4) | ☐ |
| 12.4 | Navegación legal | Enlaces del footer a las 3 páginas y botón "Volver" | Todos funcionan | ☐ |
| 12.5 | Email funcional | Enviar un email de prueba a cofoundue@gmail.com desde tu correo | Llega al buzón (que controlas tú) | ☐ |

---

## 13. Seguridad práctica (intentos de "tramposo")

| # | Test | Pasos | Resultado esperado | ☐ |
| --- | --- | --- | --- | --- |
| 13.1 | ID de proyecto ajeno en URL | Con Cuenta B, pegar la URL de edición del proyecto de A (/dashboard/proyecto/[id]/editar) | No puede editar (reglas lo rechazan o la UI lo impide) | ☐ |
| 13.2 | Postulación ajena | B intenta acceder a datos de postulaciones de otros (si conoces alguna URL/ID) | Permission denied, sin datos expuestos | ☐ |
| 13.3 | Consola limpia de datos sensibles | F12 → Consola en varias páginas | No se imprimen emails/tokens/datos de otros usuarios en logs | ☐ |
| 13.4 | Spam de creación | Crear 3 proyectos seguidos rápidamente | Funciona con normalidad (no hay límite — es deuda conocida y aceptada, anótalo como observación) | ☐ |

---

## 14. Plantilla de reporte de bug

Copia esta plantilla por cada ❌ o ⚠️:

```javascript
BUG-XX
Severidad: [P0 bloqueante / P1 importante / P2 menor / P3 cosmético]
Test ID: [ej. 8.3]
Dispositivo/Navegador: [ej. Pixel 7, Chrome 129 / Windows, Chrome]
Pasos para reproducir:
  1. ...
  2. ...
Resultado esperado: ...
Resultado obtenido: ...
Captura: [sí/no]
Mensaje de consola (si lo hay): [pegar error rojo de F12]
```

## 15. Clasificación de severidad y criterio de salida

| Severidad | Definición | Acción |
| --- | --- | --- |
| **P0** | Impide una función core (registro, publicar, postularse, mensajes) o expone datos | BLOQUEA el lanzamiento. Prompt correctivo inmediato |
| **P1** | Función secundaria rota o error visible para el usuario | Corregir antes del lanzamiento si es posible |
| **P2** | Comportamiento incorrecto con workaround razonable | Backlog pre-lanzamiento, corregir en la semana siguiente |
| **P3** | Cosmético | Backlog general |

**Criterio de salida del smoke test:** 0 bugs P0 y 0 bugs P1 abiertos → la app está APTA para el lanzamiento en campus.

---

## 16. Resumen de ejecución (rellenar al terminar)

- Fecha de ejecución: ____
- Tests ejecutados: ____ / 78
- ✅ Pasan: ____ · ❌ Fallan: ____ · ⚠️ Observaciones: ____
- Bugs P0: ____ · P1: ____ · P2: ____ · P3: ____
- **Veredicto: [ ] APTA para lanzamiento · [ ] NO APTA (corregir y repetir)**