# CoFound UE — Documento de Traspaso de Contexto

> **Instrucciones de uso:** sube este documento al primer mensaje del nuevo chat junto con el "mensaje de arranque" del final (sección 7). Sustituye antes los huecos marcados con `[COMPLETAR]`.

---

## 1. Quién soy y qué es CoFound UE

- **Autor:** Marc Cubero Cantavella (GitHub: `markusx5622`), estudiante de IOI en la Universidad Europea de Valencia.
- **Proyecto:** CoFound UE — `[COMPLETAR: descripción en 2-3 frases de qué hace la app, qué problema resuelve y para quién]`.
- **Público objetivo:** ya definido — comunidad UEV. `[COMPLETAR: segmento concreto si hay más detalle]`.
- **Estado estratégico:** es el proyecto prioritario. Match UEV queda congelado hasta septiembre; desde entonces el foco completo es CoFound UE. La confianza de adopción es alta porque el público está definido y es accesible (campus).
- **Repo:** `[COMPLETAR: URL del repo GitHub de CoFound UE y si es público o privado]`.
- **Stack:** `[COMPLETAR: tecnologías usadas — p. ej. Next.js, Firebase, Vercel, etc.]`.
- **Estado actual del código:** `[COMPLETAR: qué funciona hoy, qué está a medias, URL de producción si existe]`.

## 2. Trabajo ya realizado (de sesiones anteriores)

- **Landing page** de CoFound UE: existe y está trabajada. `[COMPLETAR: URL / estado / stack de la landing]`.
- **Pendiente en la landing** (identificado, no implementado):
  - Sección de visión **"Hacia dónde voy"**.
  - Sustituir/añadir iconos **Lucide** donde corresponda.
- **Licencias del repo:** hay correcciones de licencia pendientes (tarea identificada, sin hacer). `[COMPLETAR: qué archivos/licencias concretas si lo recuerdas]`.
- **Auditoría preventiva:** se ofreció preparar un prompt de auditoría preventiva para CoFound UE (equivalente a la que destapó los agujeros de seguridad de Match UEV). No llegó a pedirse. **Es tarea candidata prioritaria para el nuevo chat** — ver sección 5.

## 3. Lecciones aprendidas en Match UEV (aplicables desde el día 1)

Estas son las lecciones caras del rescate de Match UEV. CoFound UE debe nacer con ellas incorporadas:

1. **Seguridad desde el primer commit, no al final.** Firestore/Storage rules estrictas escritas el día 1, con tests de reglas (`@firebase/rules-unit-testing` v5.x, que es la versión compatible con `firebase@^12`) corriendo en CI contra el emulador. En Match UEV, añadirlas al final costó semanas.
2. **CI desde el primer push:** `npm ci` + tests + build bloqueantes; lint como deuda documentada no bloqueante si hace falta, pero tests y build jamás.
3. **Feature flags para hibernar, no borrar.** `lib/features.ts` con flags por funcionalidad: desarrollar con el flag apagado cuesta cero y reactivar es girar un booleano (documentado en RESCATE.md de Match UEV).
4. **API routes con validación estricta (zod)** y escritas sensibles solo vía Admin SDK; el cliente nunca escribe campos protegidos (regla del `diff(resource.data).affectedKeys()`).
5. **Plan Firebase:** ojo con Storage — desde 2026 exige plan Blaze sí o sí. Si CoFound UE necesita imágenes, decidir Blaze (con alerta de presupuesto) al principio, no descubrirlo al final.
6. **Documento de estado vivo** (el equivalente a RESCATE.md): qué está activo, qué hibernado, constantes de negocio y su justificación, y deuda técnica conocida.

## 4. Reglas de trabajo acordadas (mantener en el nuevo chat)

Estas reglas salieron de errores reales del proceso. Copiarlas tal cual al nuevo chat:

1. **Nada se da por hecho sin evidencia.** Todo cambio en el repo se verifica contra el repo real (raw.githubusercontent / API de GitHub), no contra lo que diga el agente que lo hizo.
2. **Un pipeline verde es la única prueba válida.** Nadie reporta "debería funcionar": se reporta con la URL del run en verde.
3. **Los logs de error van primero a Kimi, no al agente que programó.** Kimi diagnostica y escribe el arreglo exacto; el agente ejecuta. El agente que edita a ciegas (sin entorno local) no interpreta sus propios errores.
4. **Un agente que no puede ejecutar código no adivina:** se le dan instrucciones quirúrgicas (archivo, línea, cambio exacto), nunca "arréglalo".
5. **Prohibido `npm audit fix --force`** y prohibido tocar `package.json` sin regenerar el lockfile con `npm install` (el desajuste package.json/lockfile rompe `npm ci` en 1 segundo).
6. **Nada de scripts masivos de "arreglo"** sobre el código (el `fix-any.js` de Match UEV corrompió archivos con mojibake y borró props de interfaces).
7. **Entorno de trabajo:** el PC de la oficina tiene bloqueada la instalación de Node por política de grupo. Alternativa validada: **GitHub Codespaces** desde el navegador para cualquier tarea que requiera npm.

## 5. Prioridades propuestas para el nuevo chat

1. **Auditoría preventiva de seguridad/arquitectura** de CoFound UE (antes de seguir construyendo, aplicando las lecciones de la sección 3).
2. Terminar la landing: sección "Hacia dónde voy" + iconos Lucide.
3. Resolver las licencias del repo.
4. `[COMPLETAR: siguiente gran funcionalidad o milestone]`.

## 6. Contexto técnico útil heredado

- **Firebase Auth + Firestore + Vercel** es el stack validado que ya domina el autor.
- **Patrón de verificación de email institucional** ya implementado en Match UEV (reutilizable).
- **CI de referencia:** el `ci.yml` de Match UEV (repo `markusx5622/Match-UEV`, público) ya tiene el pipeline completo funcionando: npm ci → lint no bloqueante → Java 21 + emulador Firestore → Vitest (unitarios + reglas) → build. Es plantilla directa para CoFound UE.
- **Tests de reglas de referencia:** `tests/rules.test.ts` del mismo repo, con `assertFails`/`assertSucceeds` (no comparar mensajes de error: en SDK v12 los `get()` denegados no incluyen "PERMISSION_DENIED" en el mensaje).

## 7. Mensaje de arranque para el nuevo chat (copiar y pegar)

```
Te adjunto el documento "Contexto CoFound UE — Handoff.md" con todo el contexto
de mi proyecto. Léelo entero antes de responder. A partir de ahora trabajamos
única y exclusivamente en CoFound UE, siguiendo las reglas de trabajo de la
sección 4 (verificación con evidencia, logs primero a ti, instrucciones
quirúrgicas para agentes que editan a ciegas).

Mi repo es: [URL]. Quiero empezar por la prioridad 1 de la sección 5: la
auditoría preventiva de seguridad y arquitectura, aplicando las lecciones del
rescate de Match UEV (sección 3). Dime qué necesitas que te pase del repo para
empezar.
```
