# CoFound UE — Protocolo Maestro de Smoke Test End-to-End (Edición Lanzamiento Día 11)

**Versión:** 2.1 (Definitiva Pre-Lanzamiento Día 11 — Post `CF` + `SEC-01..14` + Fase 3 + QoL + i18n)  
**Responsable QA:** Marc Cubero Cantavella (y apoyo opcional de Juan)  
**Entorno bajo prueba:** Producción real — `https://www.cofoundue.es` (`cofound-ue`)  
**Objetivo:** Certificar con garantías reales, pruebas empíricas y cobertura del **100% de rutas, estados, roles y reglas de seguridad** que CoFound UE está lista para recibir tráfico simultáneo real en el evento oficial de lanzamiento del **Día 11**.

---

## Parte I · Certificación Automatizada Previa (62/62 Pruebas Superadas ✅)

Antes de iniciar el recorrido manual autenticado con multicuentas, se han ejecutado **62 verificaciones técnicas automatizadas** contra producción (`https://www.cofoundue.es`), Google Cloud / Firebase (`cofound-ue`) y el emulador oficial de reglas:

| Suite Automatizada | Alcance Verificado | Resultado | Evidencia Técnica Real |
| --- | --- | --- | --- |
| **1. Infraestructura, Dominios y Assets (`13/13`)** | Redirección `308` desde `cofound-ue.vercel.app` y `cofoundue.es` → `https://www.cofoundue.es/`; TTFB `< 300 ms`; `/sw.js` `v3` con `Cache-Control: no-cache`; `/manifest.webmanifest` válido; `/robots.txt`, `/sitemap.xml`, 3 páginas legales y los 9 iconos/imágenes `< 400 KB`. | ✅ **13 / 13 PASS** | `PRE-01..03`, `PWA-01..02`, `ASSET-01` |
| **2. Cabeceras HTTP y Fase 3 API Key en Vivo** | Las 7 cabeceras activas (`CSP` sin `'unsafe-eval'`, `HSTS` preload, `COOP`, `nosniff`, `XFO: DENY`, `Referrer-Policy`, `Permissions-Policy`). Clave de API acepta `www.cofoundue.es`, mantiene activa la **Protección contra enumeración de correos** (`INVALID_LOGIN_CREDENTIALS`), y devuelve **`403 ACCESS_DENIED`** ante orígenes externos (`evil-attacker.example.com`), dominios *lookalike* (`evilcofoundue.es`) y APIs fuera de las 4 autorizadas; Firestore rechaza lectura anónima con **`403 PERMISSION_DENIED`**. | ✅ **Verificado en vivo** | `SEC-HDR-01..02`, `FASE3-01..05` |
| **3. Navegador Real Chrome Headless CDP (`8/8`)** | Renderizado y ausencia total de scroll horizontal en **Escritorio (`1440×900`)** y **Móvil (`375×812`)**; Service Worker `/sw.js` activado; selector bilingüe `ES ↔ EN` en caliente; validaciones en cliente (`@gmail.com` bloqueado, `<8` chars bloqueado, casilla RGPD obligatoria); 7 rutas protegidas redirigiendo a `/` sin sesión; **`0` errores de consola, `0` excepciones JS y `0` violaciones CSP**. | ✅ **8 / 8 PASS** | `CDP-01..08` |
| **4. Reglas Firestore + Ciclo E2E Multicuentas (`41/41`)** | Validación exhaustiva de esquemas, límites, privacidad RGPD (`users` sin listado ni email expuesto), postulaciones deterministas `projectId_uid`, bloqueo de postulaciones a proyectos demo (`demo-*`), nota de presentación inicial al postularse y retirada de postulación pendiente, chat atómico `writeBatch`, bloqueo de chat rechazado y simulación completa E2E con 4 cuentas (`+smokea`, `+smokeb`, `+smokec`, y cuenta no verificada). | ✅ **41 / 41 PASS** | `tests/rules.test.ts` (`vitest`) |

> **Conclusión de la Parte I:** La capa de red, cabeceras, PWA estática, reglas de base de datos y restricciones de Google Cloud ya están certificadas. La **Parte II** valida en producción real la experiencia humana completa con **3 cuentas institucionales simultáneas** y un móvil físico.

---

## Parte II · Preparación de la Matriz Multicuentas (3 Cuentas Simultáneas)

Para probar **todos** los estados posibles de la aplicación sin dejarnos ángulos muertos (candidato aceptado vs. candidato rechazado, usuario sin perfil completado, contadores múltiples y limpieza final con reautenticación), utilizaremos **3 cuentas institucionales** en **3 sesiones de navegador aisladas**.

### 0.1. Cómo obtener 3 cuentas institucionales sin depender de nadie (Truco de Alias `+`)

Tanto el validador de la web (`endsWith("@live.uem.es")`) como las reglas de producción de Firestore (`^[^@]+@(live\.uem\.es|universidadeuropea\.es)$`) admiten **subdirecciones RFC 5233 (`+alias`)** sobre tu propio correo de Microsoft 365 de la universidad:

| Rol en el Smoke Test | Correo sugerido | Navegador / Dispositivo asignado | Propósito específico |
| --- | --- | --- | --- |
| **Cuenta A · Fundadora** | Tu cuenta principal (`tucorreo@live.uem.es`) | **PC · Chrome ventana normal** (`1440px+`) | Crea, edita y borra proyectos; recibe postulaciones; acepta a B y rechaza a C; chatea en tiempo real. |
| **Cuenta B · Candidata Aceptada + PWA Móvil** | `tucorreo+smokeb@live.uem.es` *(Plan B si UEV filtra `+`: cuenta de Juan)* | **PC · Chrome ventana Incógnito** **+** **Tu Móvil físico (PWA)** | Se registra desde cero, verifica email, se postula, es **aceptada**, chatea en vivo desde PC y PWA móvil, y al final prueba el **borrado de cuenta**. |
| **Cuenta C · Candidata Rechazada / Sin Perfil / Saboteadora** | `tucorreo+smokec@live.uem.es` *(o segunda cuenta de apoyo)* | **PC · Microsoft Edge** (o Firefox / 2.º perfil de Chrome) | Prueba el bloqueo de publicar sin perfil (`4.1`), se postula (subiendo el badge de A a `2`), es **rechazada**, verifica el **bloqueo de chat rechazado** y prueba intentos de acceso no autorizado (IDOR). |

> **Nota sobre recepción de correos `@live.uem.es`:** Los emails enviados por Firebase Auth a `tucorreo+smokeb@live.uem.es` y `tucorreo+smokec@live.uem.es` llegan directamente a la bandeja de entrada (o carpeta *Correo no deseado / Otros*) de `tucorreo@live.uem.es`. Antes de empezar, desinstala cualquier versión previa de la PWA de CoFound UE en tu móvil.

### 0.2. Leyenda de registro
Marca cada punto al ejecutarlo: `✅ Pasa` · `❌ Falla` · `⚠️ Observación menor`.  
El orden de los **13 Bloques** está diseñado de forma **estrictamente secuencial**: cada paso prepara los datos necesarios para el siguiente y el **Bloque 13** limpia automáticamente todos los datos de prueba en producción.

---

## Bloque 1 · Pre-Flight Visual y Compartición Social (WhatsApp / Redes)

*(Tiempo estimado: 2 min — el resto del pre-flight técnico ya está certificado en la Parte I).*

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **1.1** | Vista previa Open Graph real (WhatsApp / Instagram DM) | Pega `https://www.cofoundue.es` en un chat contigo mismo en WhatsApp (espera 2 s a que cargue la tarjeta antes de enviar). | Aparece miniatura limpia con `og-image.jpg` (Logo CoFound UE sobre fondo oscuro, sin cortes raros), título oficial y descripción en español. | ☐ |
| **1.2** | Consola limpia en tu navegador habitual | En **Chrome normal (PC)** abre `https://www.cofoundue.es` con `F12 → Console` abierto y haz `Ctrl+Shift+R`. | `0` errores rojos en consola, Logo 2.0 nítido con resplandor rojo sutil, partículas de fondo fluidas y favicon visible en la pestaña. | ☐ |

---

## Bloque 2 · Landing Page, Conmutación Bilingüe (`ES ↔ EN`) y Textos Legales

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **2.1** | Selector de idioma `ES ↔ EN` en Landing | Pulsa el botón superior derecho `🌐 ES` → elige `🇬🇧 English`. Recorre la landing de arriba abajo y vuelve a `🇪🇸 Español`. | Todos los textos (Hero con *Salud, Deporte, Ingeniería, Diseño y ADE*, tarjeta de registro, Cómo funciona, Ecuaciones `2×2`, FAQ y Footer) cambian al instante sin recargar ni dejar claves crudas (`landing.xxx`). | ☐ |
| **2.2** | Interacción de tarjetas `2×2` (Turia × Alameda) y CTAs hacia «Crear Cuenta» | Baja a *Cruza facultades, crea proyectos reales*, verifica representación de Alameda (Fisioterapia/CAFD, Biotecnología/Salud) y Turia, y pulsa **«Publicar algo así»**. Repite en móvil comprobando que tanto el subtítulo del Hero como las 4 tarjetas y partículas ligeras se ven sin líneas divisorias grises. | Hace scroll suave arriba, **cambia automáticamente la pestaña a «Crear Cuenta»** y enfoca el campo de correo electrónico. | ☐ |
| **2.3** | Acordeón de FAQ estudiantil y botón mostrar/ocultar contraseña | Abre y cierra las 4 preguntas frecuentes, pulsa **«Crear mi perfil ahora»** (debe abrir *Crear Cuenta*) y prueba el botón del ojito (`👁️`) en el campo de contraseña. | Animación limpia, textos claros, la contraseña se muestra/oculta correctamente y se oculta al cambiar de pestaña. | ☐ |
| **2.4** | Páginas Legales y botón Volver | Desde el footer abre **Aviso Legal**, **Política de Privacidad** y **Política de Cookies** (prueba también cambiar a `EN` dentro de una de ellas). | Titular *Marc Cubero Cantavella*, contacto `cofoundue@gmail.com`, nota de independencia respecto a la UE, mención a *Vercel Web Analytics* (nunca GA4) y retención de `30 días` para errores técnicos. | ☐ |

---

## Bloque 3 · Autenticación, Verificación de Correo, Recuperación y Enumeración

*(Ejecutar con las ventanas de **Edge (Cuenta C)** y **Chrome Incógnito (Cuenta B)**).*

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **3.1** | Rechazo de correo externo | En pestaña **Crear Cuenta**, escribe `prueba@gmail.com`, contraseña ` SmokeTest2026!`, marca casilla legal y pulsa crear. | Bloqueado al instante: *«Acceso restringido. Por favor, utiliza tu correo institucional de la Universidad Europea.»* | ☐ |
| **3.2** | Rechazo de contraseña `< 8` caracteres | Escribe `tucorreo+smokeb@live.uem.es` y contraseña de 7 caracteres (`1234567`). Intenta enviar. | Bloqueado por validación (`Mínimo 8 caracteres` / mensaje en español sin errores técnicos en inglés). | ☐ |
| **3.3** | Casilla RGPD obligatoria en registro | Pon contraseña válida (`SmokeTest2026!`) pero **deja desmarcada** la casilla de Privacidad y Aviso Legal → pulsa crear. | Bloqueado con aviso: *«Debes aceptar la Política de Privacidad y el Aviso Legal para crear tu cuenta.»* | ☐ |
| **3.4** | Alta real de **Cuenta B** y **Cuenta C** + Gate de verificación | Marca la casilla legal y registra **Cuenta B** en Incógnito (`tucorreo+smokeb@live.uem.es`) y **Cuenta C** en Edge (`tucorreo+smokec@live.uem.es`). | Toast de cuenta creada y aparición inmediata de la pantalla **«Verifica tu correo»**. Si escribes manualmente `/dashboard` en la barra de direcciones, `ProtectedRoute` **te bloquea** en la pantalla de verificación (no entra al tablón). | ☐ |
| **3.5** | Botón «Ya lo he verificado» ANTES de verificar | Sin haber pulsado aún el enlace del email, haz clic en **«Ya lo he verificado»** en Cuenta B. | Muestra toast de aviso indicando que el correo aún no figura como verificado y **no deja pasar**. | ☐ |
| **3.6** | Cooldown de 60s en reenvío de verificación | En `/dashboard` (pantalla de bloqueo de Cuenta C), pulsa **«Reenviar correo de verificación»**. | Envía el correo, muestra toast de éxito y el botón queda deshabilitado con cuenta atrás `60s, 59s...` | ☐ |
| **3.7** | Verificación real y auto-entrada por foco | Abre tu correo `@live.uem.es` (revisa *Spam / Otros*), haz clic en los enlaces de verificación de **Cuenta B** y **Cuenta C**, y vuelve a sus pestañas de CoFound UE. | Al recuperar el foco la ventana (o al pulsar **«Ya lo he verificado»**), refresca el token JWT (`email_verified: true`) y entra automáticamente a `/dashboard`. | ☐ |
| **3.8** | Protección contra enumeración de correos en Login | En una pestaña cerrada la sesión, intenta **Iniciar Sesión** con: 1) `noexiste.jamas.999@live.uem.es` + `ClaveFalsa123` y 2) tu correo real + `ClaveFalsa123`. | **Ambos casos muestran exactamente el mismo mensaje genérico** (*«Credenciales incorrectas o caducadas...»*), sin revelar jamás qué correos existen en la base de datos. | ☐ |
| **3.9** | Flujo «¿Olvidaste tu contraseña?» | En **Iniciar Sesión**, pulsa *«¿Olvidaste tu contraseña?»*, prueba primero con `@gmail.com` (debe rechazarlo) y luego con `tucorreo+smokec@live.uem.es`. | Muestra confirmación en español y llega el email de restablecimiento al buzón institucional (no hace falta cambiarla si no quieres, o cámbiala a `SmokeTest2026B!` para validar el enlace completo). | ☐ |
| **3.10** | Login y persistencia de **Cuenta A** | En **Chrome normal**, inicia sesión con **Cuenta A**, cierra la pestaña, abre una pestaña nueva en `https://www.cofoundue.es`. | Detecta sesión iniciada y verificada (*«¡Sesión Iniciada! → Entrar al Dashboard de Proyectos»*) sin volver a pedir credenciales. | ☐ |

---

## Bloque 4 · Guardián de Perfil Inicial y Perfiles Públicos (`Cuenta A`, `B` y `C`)

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **4.1** | Banner de onboarding y bloqueo sin perfil completado (`Cuenta C` virgen) | Con **Cuenta C** recién verificada (antes de tocar `/perfil`): 1) Comprueba el banner superior en `/dashboard` (*«Completa tu perfil en 20 segundos»*); 2) Intenta publicar en `/dashboard/nuevo`; 3) Intenta pulsar **«Postularme»** en el proyecto de `Cuenta A`. | En `/dashboard` se muestra el banner de onboarding; tanto al publicar como al postularse sin nombre **bloquea con toast claro y redirige a `/perfil`**. | ☐ |
| **4.2** | Avatar de iniciales determinista, chips rápidos y enlace público | En `/perfil`, escribe nombres con y sin paréntesis, añade habilidades usando los **chips de sugerencias rápidas** y pulsa **«Ver mi perfil público»** arriba a la derecha. | `InitialsAvatar` ignora signos de puntuación (nunca `E(`), los chips rápidos añaden skills en 1 toque y el enlace abre `/perfil/[tu-uid]`. | ☐ |
| **4.3** | Guardado completo y persistencia en los 3 perfiles | Rellena y guarda los 3 perfiles con datos diferenciados:<br>• **Cuenta A:** tu perfil real (Campus `Turia / Valencia`).<br>• **Cuenta B:** *Lucía Prueba Smoke*, *Grado en Diseño Digital*, Campus `Alameda`, bio y 3 skills (`Figma`, `UI/UX`, `Branding`).<br>• **Cuenta C:** *Carlos Prueba Smoke*, *Grado en Marketing*, Campus `Turia / Valencia`, bio y 2 skills (`SEO`, `Growth`). | Toast *«Perfil guardado correctamente»* en los 3; al recargar con `F5` todos los campos y el selector de campus (`Valencia` vs `Alameda`) se mantienen intactos. | ☐ |
| **4.4** | Habilidades duplicadas y borrado de tags | En **Cuenta B** (`/perfil`), intenta añadir `Figma` por segunda vez (con botón *Añadir* y con tecla `Enter`), luego borra una skill con la `X` y guarda. | Impide duplicar `Figma` y conserva exactamente la lista editada tras recargar. | ☐ |
| **4.5** | Privacidad RGPD en Perfil Público (`/perfil/[uid]`) | Abre `F12 → Network` (o inspecciona la página) cuando visites el perfil público de otro usuario en el Bloque 5/7. | Se ven nombre, grado, campus, biografía, skills y proyectos, pero **en ningún lugar del DOM ni del documento `users/{uid}` aparece su email institucional**. | ☐ |

---

## Bloque 5 · Creación de Proyectos y Límites de Validación (`Cuenta A`)

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **5.1** | Validaciones de mínimos y sin perfiles | En **Cuenta A** → `/dashboard/nuevo`:<br>1) Título `AB` (2 chars) → *Publicar*.<br>2) Título válido + Descripción de 10 chars → *Publicar*.<br>3) Título y Descripción válidos pero **0 perfiles añadidos** → *Publicar*. | Los 3 intentos se bloquean con su respectivo toast explicativo en español sin escribir nada en Firestore. | ☐ |
| **5.2** | Límites superiores (`100` / `1500` / `10 perfiles` / `40 chars`) | Comprueba que el contador de título frena en `100/100`, descripción en `1500/1500`, tag de perfil en `40` caracteres, no duplica tags repetidos y al intentar meter un **11.º perfil** lanza toast *«Máximo 10 perfiles por proyecto»*. | Todos los topes de interfaz coinciden exactamente con las reglas de seguridad de `firestore.rules`. | ☐ |
| **5.3** | Plantilla guiada, chips rápidos y publicación real del Proyecto | En **Cuenta A** → `/dashboard/nuevo`, prueba **«Usar estructura recomendada»** y añade perfiles con los chips sugeridos. Publica:<br>• **Título:** `[SMOKE TEST] Plataforma UEV Lanzamiento Día 11`<br>• **Categoría:** `Startup Real`<br>• **Perfiles:** `Diseño UI/UX`, `Marketing Digital`<br>• **Descripción:** texto realista de `> 60` caracteres. | La plantilla inserta los 4 bloques limpios (sin sobrescribir texto si ya había algo escrito). Tras publicar, aparece el primero en `/dashboard` con fecha relativa (*Ahora mismo*) y tu nombre real. | ☐ |
| **5.4** | Vista de detalle, botón Compartir y enlace al perfil del fundador | Abre el detalle (`/dashboard/proyecto/[id]`), pulsa **«Compartir»** y pulsa sobre tu nombre en *«Creado por [Nombre]»*. | Muestra fecha de publicación relativa, copia enlace (o abre menú nativo móvil) con toast de confirmación y el enlace abre `/perfil/[uid-de-A]`. | ☐ |

---

## Bloque 6 · Exploración, Filtros Rápidos, Bilingüismo y Traducción de Proyectos

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **6.1** | Búsqueda, botón limpiar (`✕`), contador y toggle «Ocultar ejemplos» | Con **Cuenta B** en `/dashboard`: 1) Busca `SMOKE TEST`, `UI/UX` y el nombre de `Cuenta A`; 2) Pulsa la **`✕`** del buscador; 3) Activa **«Ocultar ejemplos»** y comprueba el contador dinámico de proyectos mostrados. | Filtra en tiempo real, la `✕` limpia en 1 clic, **«Ocultar ejemplos»** deja visibles solo los proyectos reales (ocultando los 6 `demo-*`) y el contador se actualiza al instante. | ☐ |
| **6.2** | Filtro combinado, «Limpiar filtros» y cambio a Inglés (`Capa 1`) | Combina `TFG` + `SMOKE TEST` (0 resultados → pulsa **«Limpiar filtros»**). Cambia el idioma del Navbar a **`EN`** y busca `fatigue` o `Flutter`. | **«Limpiar filtros»** resetea todo; en `EN` las categorías y los **6 proyectos de ejemplo** pasan a inglés natural al instante y el buscador encuentra términos en inglés. | ☐ |
| **6.3** | Traducción bajo demanda en proyectos reales (`Capa 2`) | Con **Cuenta B** en modo **`EN`** (o **`ES`**), abre el proyecto real `[SMOKE TEST]` de `Cuenta A` y pulsa el botón **«Translate / Traducir»** junto a *About the Project / Acerca del Proyecto*. | Abre Google Translate en una pestaña nueva (`sl=auto`, destino `en` o `es` según idioma activo) con el título y descripción precargados. Verifica que los proyectos de ejemplo **NO** muestran este botón (se traducen nativamente). | ☐ |
| **6.4** | Skeletons de carga | Recarga `/dashboard` con `F5`. | Se muestran brevemente las tarjetas `ProjectSkeleton` grises pulsantes sin saltos bruscos de maquetación (*CLS*). | ☐ |

---

## Bloque 7 · Flujo Cruzado de Postulaciones a 3 Bandas (`A ↔ B ↔ C`)

*(Mantén visibles a la vez las ventanas de **Cuenta A**, **Cuenta B** y **Cuenta C**).*

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **7.1** | Vista del propio creador (`Cuenta A` — sin botones muertos) | Con **Cuenta A**, entra al detalle de tu propio proyecto `[SMOKE TEST]`. | En lugar de un botón bloqueado, muestra el botón directo **«Editar proyecto»** hacia `/dashboard/proyecto/[id]/editar`. | ☐ |
| **7.2** | Postulación con modal de presentación (`Cuenta B`) + Badge `1` en `Cuenta A` | Con **Cuenta B**, abre `[SMOKE TEST]` → pulsa **«Postularme»** → en el modal elige el perfil `Diseño UI/UX`, escribe una nota breve de presentación y envía. Mira el Navbar de **Cuenta A** (sin recargar A). | En **B**: toast de éxito, aparece insignia verde **«Ya postulado»** junto al botón directo **«Abrir chat»** y la nota se envía automáticamente como primer mensaje del chat. En **A**: aparecen badges en tiempo real en *Mis Proyectos* (`1`) y *Mensajes* (`1`). | ☐ |
| **7.3** | Anti-duplicado tras recarga (`Cuenta B`) | Con **Cuenta B**, recarga con `F5` la página del proyecto. | Sigue apareciendo **«Ya postulado»** + **«Abrir chat»** (imposible duplicar por ID determinista `projectId_uidB`). | ☐ |
| **7.4** | Segunda postulación (`Cuenta C`) + Subida de Badge a `2` en `Cuenta A` | Con **Cuenta C** (Edge), abre `[SMOKE TEST]` y postúlate sin nota (o con nota breve). Mira el Navbar de **Cuenta A**. | El badge rojo sobre *Mis Proyectos* en **Cuenta A** sube en tiempo real de **`1` a `2`**. | ☐ |
| **7.5** | Vista del candidato en *Mis Postulaciones* y botón **«Retirar»** (`Cuenta B` y `C`) | En **Cuenta B** y **Cuenta C**, entra a `/dashboard/mis-postulaciones`. Pulsa **«Retirar»** en una candidatura pendiente para comprobar el modal oscuro de confirmación y pulsa **Cancelar** (o retira y vuelve a postularte si quieres validar el borrado completo). | Ambas ven fecha formateada, botón **«Chat»**, etiqueta amarilla **«Pendiente»** y botón **«Retirar»** con modal propio de confirmación (sin `window.confirm`). | ☐ |
| **7.6** | Panel de *Postulaciones Recibidas* y Modal de Perfil (`Cuenta A`) | En **Cuenta A**, entra a `/dashboard/mis-proyectos` → tabla inferior *Postulaciones Recibidas* → pulsa el icono de usuario (`Ver Perfil Detallado`) de *Lucía Prueba Smoke (B)*. | Se abre el modal con avatar de iniciales, grado, campus `Alameda`, biografía y sus tags (`Figma`, `UI/UX`, `Branding`). Cierra el modal. | ☐ |
| **7.7** | Aceptar a `B` y Rechazar a `C` *(¡espera primero al paso 8.2 antes de rechazar a C!)* | **Nota táctica:** antes de pulsar Rechazar sobre `C`, intercambia 1 mensaje en el Bloque 8.2 para probar también el historial en chats rechazados; después vuelve aquí, **Acepta (`✓`) a `Cuenta B`** y **Rechaza (`✕`) a `Cuenta C`**. | Al aceptar a B y rechazar a C:<br>• El badge rojo de *Mis Proyectos* en **Cuenta A** desaparece (`0` pendientes).<br>• En **Cuenta B** (*Mis Postulaciones*) cambia a verde **«Aceptada»**.<br>• En **Cuenta C** (*Mis Postulaciones*) cambia a rojo **«Rechazada»**. | ☐ |

---

## Bloque 8 · Mensajería en Tiempo Real, Deep-Links, No Leídos y Bloqueo por Rechazo

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **8.1** | Apertura directa con Deep-Link (`?chat=...`) | En **Cuenta B**, ve a *Mis Postulaciones* y pulsa el botón **«Chat»**. | Navega a `/dashboard/mensajes?chat=<projectId>_<uidB>` y **selecciona automáticamente** la conversación con `Cuenta A` sin tener que buscarla en la lista lateral. | ☐ |
| **8.2** | Mensaje inicial de `Cuenta C → A` (antes de ser rechazada) | En **Cuenta C**, abre *Mensajes*, selecciona el chat con `A` y envía: *«Hola, soy Carlos de Marketing, ¿seguís buscando perfil de Growth?»*. | Se envía con éxito; en **Cuenta A** aparece el **badge `1`** sobre *Mensajes* en el Navbar. | ☐ |
| **8.3** | Mensaje de `Cuenta B → A` y contador acumulado `2` | Sin que `A` haya abierto aún *Mensajes*, envía desde **Cuenta B**: *«¡Hola! Soy Lucía de Diseño en Alameda, me encantaría unirme.»* | El badge rojo de *Mensajes* en el Navbar de **Cuenta A** sube en tiempo real a **`2`** conversaciones con mensajes sin leer. | ☐ |
| **8.4** | Punto rojo por conversación y limpieza automática al leer | En **Cuenta A**, entra a `/dashboard/mensajes`. Observa los puntos rojos junto a *Lucía* y *Carlos*. Haz clic primero en *Lucía* y luego en *Carlos*. | Al abrir el chat de *Lucía*, su punto rojo desaparece y el badge del Navbar baja de **`2` a `1`**. Al abrir el de *Carlos*, baja de **`1` a `0`** (desaparece). | ☐ |
| **8.5** | Respuesta `A → B` y ausencia de auto-notificación | Con **Cuenta A**, responde a *Lucía (`B`)*: *«¡Bienvenida al equipo Lucía! Te acepto ahora mismo.»* | **Cuenta A NO ve badge** por su propio mensaje. **Cuenta B SÍ recibe al instante** el mensaje y el badge si estaba en otra pestaña. | ☐ |
| **8.6** | **Prueba Crítica:** Cierre de chat al rechazar a `Cuenta C` | En **Cuenta A** → *Mis Proyectos*: **Acepta (`✓`) a `B`** y **Rechaza (`✕`) a `C`** (completando el punto `7.7`). Ahora abre el chat de `A ↔ C` tanto en **Cuenta C** como en **Cuenta A**. | En **ambas cuentas** el historial previo sigue siendo legible, pero la barra de escritura ha sido sustituida por el aviso: *«Esta candidatura fue rechazada. El chat permanece en modo de solo lectura.»* (y Firestore bloquea cualquier escritura por debajo). Mientras tanto, el chat `A ↔ B` sigue 100% activo. | ☐ |
| **8.7** | Marcas de hora, estado en cabecera, enlace al proyecto y *Ver Perfil* | En el chat activo `A ↔ B`:<br>1) Comprueba la hora (`HH:mm`) en cada burbuja y la píldora de estado (`Aceptada`) en cabecera y lista lateral.<br>2) Haz clic sobre el **título del proyecto** en la cabecera del chat.<br>3) Intenta enviar solo espacios en blanco y verifica `maxLength=1000`.<br>4) Pulsa **«Ver Perfil»** arriba a la derecha. | Horas visibles en burbujas, píldora de estado sincronizada en vivo, el título abre `/dashboard/proyecto/[id]`, botón enviar deshabilitado con espacios y *Ver Perfil* abre `/perfil/[uid]`. | ☐ |

---

## Bloque 9 · Edición de Proyectos Propios y Defensa Anti-Sabotaje (`IDOR`)

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **9.1** | Intento de edición ajena por URL directa (`IDOR`) | Copia la URL de edición del proyecto de `A` (`/dashboard/proyecto/[id]/editar`), pégala en el navegador de **Cuenta B** o **Cuenta C** y pulsa `Enter`. | Muestra toast *«No tienes permiso para editar este proyecto»* y expulsa inmediatamente a `/dashboard`. | ☐ |
| **9.2** | Edición legítima por `Cuenta A` | En **Cuenta A** → *Mis Proyectos* → icono lápiz (`Editar proyecto`): añade un 3.er perfil (`Full Stack`) y añade `(Editado OK)` al final del título → **Guardar Cambios**. | Toast *«Proyecto actualizado correctamente»*, redirige al detalle del proyecto con los cambios aplicados y mantiene su posición original en `/dashboard` (`createdAt` intacto). | ☐ |

---

## Bloque 10 · Experiencia PWA Real en Móvil + Modo Offline (`sw.js v3`)

*(Ejecutar en tu **teléfono móvil real** — iPhone con Safari o Android con Chrome).*

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **10.1** | Popup inteligente de instalación a los `3.5s` | Abre `https://www.cofoundue.es` en el móvil, inicia sesión con **Cuenta B** y entra en `/dashboard`. Espera `4` segundos sin tocar nada. | Se despliega automáticamente la tarjeta compacta **«Instala CoFound UE en tu móvil»** con la pestaña de tu sistema operativo (`iPhone Safari` o `Android Chrome`) preseleccionada. | ☐ |
| **10.2** | Apertura manual desde el Navbar móvil | Cierra el popup con *«Ahora no»*, abre el menú hamburguesa (`☰`) y pulsa **«Instalar App en tu móvil»**. | El modal vuelve a abrirse bajo demanda aunque se hubiera pospuesto el aviso automático. | ☐ |
| **10.3** | Instalación en pantalla de inicio e Icono Logo 2.0 | Sigue los pasos del modal para instalar la app en la pantalla de inicio de tu móvil. Mira el icono junto al resto de tus apps. | Se llama **«CoFound UE»** y el icono rojo/oscuro luce nítido, centrado y **sin marcos blancos ni bordes cortados**. | ☐ |
| **10.4** | Ejecución Standalone y ocultación del botón Instalar | Abre **CoFound UE** desde el icono de tu pantalla de inicio. Abre el menú `☰`. | Se ejecuta a **pantalla completa** (sin barra de URL del navegador), arranca directamente en `/dashboard` con tu sesión iniciada, y el botón *«Instalar App»* ya **no aparece** porque detecta modo standalone. | ☐ |
| **10.5** | Navegación móvil completa + Chat móvil | Dentro de la PWA instalada, entra en *Mensajes*, abre el chat con `Cuenta A`, escribe con el teclado del móvil abierto y pulsa `← Volver`. | En móvil la vista alterna limpiamente entre lista de chats y conversación activa; el teclado virtual no rompe ni tapa la caja de texto, y no hay scroll horizontal en ninguna vista. | ☐ |
| **10.6** | Degradación elegante sin conexión (**Modo Avión**) | Activa el **Modo Avión** en tu móvil, cierra del todo la PWA y vuelve a abrirla (o recarga). Después desactiva Modo Avión y pulsa **«Reintentar conexión»**. | En vez del dinosaurio/error crudo del navegador, muestra la tarjeta oscura de marca **«Sin conexión a Internet · CoFound UE»** con el logo en caché y el botón rojo **«Reintentar conexión»**, que recupera la app en cuanto vuelve la red. | ☐ |

---

## Bloque 11 · Telemetría Interna y Limpieza de Consola en Sesión Autenticada

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **11.1** | Consola limpia tras todo el flujo autenticado | Revisa la pestaña `F12 → Console` en **Cuenta A** tras haber creado, editado, aceptado/rechazado y chateado. | `0` errores rojos no controlados ni advertencias de índices faltantes de Firestore (`The query requires an index`). | ☐ |
| **11.2** | Colección `client_errors` a cero en Firebase Console | Abre [Firebase Console → Firestore Database](https://console.firebase.google.com/project/cofound-ue/firestore) y revisa si se ha creado algún documento en `client_errors`. | **No debe haberse registrado ningún error inesperado** durante el uso normal de la plataforma. | ☐ |

---

## Bloque 12 · Borrado con Reautenticación (`SEC-02`) y Limpieza Total Pre-Evento

> **Doble función de este último bloque:** verifica la protección crítica `SEC-02` (reautenticación obligatoria antes de destruir datos y borrado completo en cascada RGPD) **y deja la base de datos de producción 100% limpia** de cuentas y proyectos de prueba.

| ID | Prueba | Pasos exactos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| **12.1** | Intento de borrar cuenta con contraseña **INCORRECTA** (`Cuenta C`) | En **Cuenta C** → `/perfil` → baja del todo → pulsa **«Eliminar mi cuenta»** → escribe una contraseña **errónea** (`ClaveIncorrecta999`) → **«Sí, eliminar cuenta»**. | Muestra toast *«La contraseña introducida no es correcta. No se ha eliminado ningún dato.»* Cancela el modal y recarga: **el perfil y la postulación de `C` siguen intactos** (no borra Firestore antes de validar Auth). | ☐ |
| **12.2** | Borrado real en cascada de **Cuenta C** | Vuelve a abrir **«Eliminar mi cuenta»** en **Cuenta C**, introduce su contraseña **correcta** y confirma. | Toast *«Tu cuenta ha sido eliminada correctamente»*, redirige a la landing y elimina en cascada sus postulaciones, mensajes, documento `users/{uidC}` y usuario en Firebase Auth. | ☐ |
| **12.3** | Borrado real en cascada de **Cuenta B** | En **Cuenta B** (en el PC; luego cierra la PWA del móvil), ve a `/perfil` → **«Eliminar mi cuenta»** → introduce su contraseña **correcta** y confirma. | Elimina en cascada sus mensajes con `A`, su postulación aceptada, su documento `users/{uidB}` y su cuenta en Firebase Auth. En **Cuenta A** la conversación y postulación de `B` desaparecen limpiamente. | ☐ |
| **12.4** | Modal oscuro propio y borrado del Proyecto `[SMOKE TEST]` (`Cuenta A`) | En **Cuenta A** → `/dashboard/mis-proyectos` → pulsa la papelera (`🗑️`) sobre `[SMOKE TEST] Plataforma UEV Lanzamiento Día 11`: verifica que se abre el **modal oscuro propio** (no `window.confirm`), pulsa **Cancelar** primero (NO se borra), vuelve a pulsar `🗑️` y confirma **«Sí, eliminar proyecto»**. | Toast *«Proyecto y postulaciones eliminadas correctamente»*. El proyecto desaparece de *Mis Proyectos* y de `/dashboard`. | ☐ |
| **12.5** | Verificación final de limpieza en Firebase Console | Entra en [Firebase Authentication → Users](https://console.firebase.google.com/project/cofound-ue/authentication/users) y en [Firestore → Datos](https://console.firebase.google.com/project/cofound-ue/firestore). | Las cuentas `+smokeb` y `+smokec` **ya no existen** en Authentication ni en `users`, `applications` no tiene documentos basura de prueba y el proyecto `[SMOKE TEST]` ha desaparecido. | ☐ |

---

## Parte III · Verificación del Escaparate Oficial (`demo-cofound-ue`)

Antes del Día 11, los 6 proyectos demostrativos y la cuenta oficial `Equipo CoFound UE` (`users/demo-cofound-ue`) han sido blindados y profesionalizados:
- **Insignia visual `Ejemplo`:** Las 6 tarjetas muestran el badge `Ejemplo` y el botón *«Ver Proyecto de Ejemplo»* sin ensuciar el título con `[Proyecto de ejemplo]`.
- **Sin postulaciones fantasma:** Al abrir cualquiera de los 6 proyectos de ejemplo, el botón *«Postularme»* ha sido sustituido por el CTA **«Publicar mi propia idea →»** (`/dashboard/nuevo`) junto al aviso informativo, y `firestore.rules` bloquea además cualquier escritura en `applications` con `creatorId` tipo `demo-*`.
- **Perfil oficial `/perfil/demo-cofound-ue`:** Muestra el **logo oficial de CoFound UE**, la insignia **«Cuenta Oficial · Ejemplos»**, bio curada, habilidades limpias y el encabezado *«Proyectos de ejemplo publicados»*.

| ID | Prueba rápida del Escaparate Oficial | Resultado esperado | Estado |
| --- | --- | --- | --- |
| **D.1** | Abrir cualquier proyecto de ejemplo desde `/dashboard` | Muestra badge `Ejemplo`, descripción estructurada en 4 bloques, aviso informativo y botón **«Publicar mi propia idea →»** (sin botón *Postularme* ni botón *Traducir* externo). | ☐ |
| **D.2** | Pulsar en *Equipo CoFound UE* (`/perfil/demo-cofound-ue`) | Muestra el **logo oficial de CoFound UE** (nunca `E(`), badge **«Cuenta Oficial · Ejemplos»**, bio y habilidades limpias, y los 6 proyectos abajo. | ☐ |
| **D.3** | Cambiar idioma a `EN` sobre el Escaparate Oficial (`Capa 1`) | En modo **`EN`**, tanto `/perfil/demo-cofound-ue` (`CoFound UE Team`, bio y skills) como los **6 proyectos de ejemplo** en `/dashboard` y su detalle se muestran en inglés natural al instante. | ☐ |

---

## Parte IV · Plantilla de Registro de Bugs y Acta de Salida

### Clasificación de Severidad
| Nivel | Definición | Criterio para el Día 11 |
| --- | --- | --- |
| **P0 · Bloqueante** | Impide registrarse, verificar correo, publicar, postularse, chatear o expone datos privados. | **BLOQUEA lanzamiento.** Corrección inmediata obligatoria. |
| **P1 · Mayor** | Funcionalidad secundaria rota, fallo visual grave en móvil o mensaje de error confuso. | Corregir antes del Día 11. |
| **P2 · Menor** | Detalle funcional menor con alternativa clara. | Corregir si lleva `< 30 min` o pasar a V1.1 post-evento. |
| **P3 · Cosmético** | Micro-ajuste estético sin impacto en uso. | Backlog general. |

### Plantilla rápida por incidencia (si aparece algún `❌` o `⚠️`)
```text
ID Bug: BUG-01
Bloque / Test ID: [ej. 10.5]
Severidad: [P0 / P1 / P2 / P3]
Dispositivo y Navegador: [ej. iPhone 15 · Safari PWA / Windows 11 · Chrome]
Cuenta utilizada: [Cuenta A / Cuenta B / Cuenta C]
Qué hice: ...
Qué esperaba: ...
Qué ocurrió (y texto de consola si aplica): ...
```

### Acta Final de Certificación Pre-Lanzamiento (Día 11)
- **Fecha de ejecución:** `____ / ____ / 2026`
- **Pruebas automáticas (Parte I):** `62 / 62 PASS` ✅
- **Pruebas manuales E2E multicuentas + PWA móvil + Escaparate (Partes II y III):** `____ / 50`
- **Incidencias abiertas:** `P0: ___` · `P1: ___` · `P2: ___` · `P3: ___`
- **Limpieza post-test verificada en Firebase Console (`12.5`):** `[ ] SÍ`
- **7 documentos oficiales del escaparate sincronizados en producción (`D.1–D.3`):** `[ ] SÍ`
- **VEREDICTO OFICIAL DÍA 11:** `[ ] APTA PARA LANZAMIENTO EN CAMPUS` · `[ ] PENDIENTE DE AJUSTES`
