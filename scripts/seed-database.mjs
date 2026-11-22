/**
 * Script de sembrado de datos de ejemplo para el emulador local de Firestore.
 * Contiene únicamente perfiles demostrativos y proyectos de ejemplo sin datos personales.
 * Bloquea estrictamente cualquier ejecución contra entornos de producción.
 */

const ALLOWED_EMULATOR_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);
const RECOMMENDED_CMD =
  'npx firebase emulators:exec --only firestore --project demo-cofound-ue "node scripts/seed-database.mjs"';

/**
 * Valida que la ejecución apunte exclusivamente al emulador local de Firestore
 * y nunca a la base de datos de producción.
 */
function assertEmulatorEnvironment() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
    throw new Error(
      "BLOQUEADO: No se permite ejecutar este script con NODE_ENV=production o VERCEL=1."
    );
  }

  const emulatorHost = (process.env.FIRESTORE_EMULATOR_HOST || "").trim();
  if (!emulatorHost) {
    throw new Error(
      `BLOQUEADO: Ejecución contra producción prohibida. FIRESTORE_EMULATOR_HOST no está definido.\n` +
        `Usa el emulador local con:\n  ${RECOMMENDED_CMD}`
    );
  }

  if (emulatorHost.includes("://") || emulatorHost.includes("/")) {
    throw new Error(
      `BLOQUEADO: FIRESTORE_EMULATOR_HOST inválido ("${emulatorHost}"). Debe tener formato host:puerto.`
    );
  }

  const parsedHostPort = parseHostAndPort(emulatorHost);
  if (!parsedHostPort) {
    throw new Error(
      `BLOQUEADO: No se pudo interpretar host y puerto en FIRESTORE_EMULATOR_HOST ("${emulatorHost}").`
    );
  }

  const { host, port } = parsedHostPort;
  if (!ALLOWED_EMULATOR_HOSTS.has(host.toLowerCase())) {
    throw new Error(
      `BLOQUEADO: El host "${host}" no es un entorno loopback permitido (solo 127.0.0.1, localhost o [::1]).`
    );
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `BLOQUEADO: Puerto inválido en FIRESTORE_EMULATOR_HOST ("${emulatorHost}").`
    );
  }

  const projectId = (
    process.env.GCLOUD_PROJECT ||
    process.env.FIREBASE_PROJECT_ID ||
    "demo-cofound-ue"
  ).trim();

  if (projectId.toLowerCase() === "cofound-ue") {
    throw new Error(
      'BLOQUEADO: El projectId "cofound-ue" corresponde a producción y está prohibido.'
    );
  }

  if (!projectId.startsWith("demo-") && !projectId.endsWith("-test")) {
    throw new Error(
      `BLOQUEADO: El projectId "${projectId}" debe comenzar por "demo-" o terminar en "-test".`
    );
  }

  return { emulatorHost: `${host}:${port}`, projectId };
}

/**
 * Extrae host y puerto soportando IPv4, localhost e IPv6 entre corchetes ([::1]:8080).
 */
function parseHostAndPort(hostPort) {
  if (hostPort.startsWith("[")) {
    const closeBracketIndex = hostPort.indexOf("]");
    if (closeBracketIndex === -1 || hostPort[closeBracketIndex + 1] !== ":") {
      return null;
    }
    const host = hostPort.slice(0, closeBracketIndex + 1);
    const portStr = hostPort.slice(closeBracketIndex + 2);
    if (!/^\d+$/.test(portStr)) return null;
    return { host, port: Number(portStr) };
  }

  const lastColon = hostPort.lastIndexOf(":");
  if (lastColon <= 0) return null;
  const host = hostPort.slice(0, lastColon);
  const portStr = hostPort.slice(lastColon + 1);
  if (host.includes(":") || !/^\d+$/.test(portStr)) return null;
  return { host, port: Number(portStr) };
}

function toFirestoreString(value) {
  return { stringValue: value };
}

function toFirestoreStringArray(values) {
  return {
    arrayValue: {
      values: values.map((v) => ({ stringValue: v })),
    },
  };
}

function toFirestoreTimestamp(date) {
  return { timestampValue: date.toISOString() };
}

async function emulatorRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: "Bearer owner",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} en ${options.method || "GET"} ${url}: ${body}`);
  }
  return res;
}

async function listDocuments(baseUrl, collectionPath) {
  const res = await emulatorRequest(`${baseUrl}/${collectionPath}`);
  const data = await res.json();
  return data.documents || [];
}

async function clearCollection(baseUrl, collectionName, isDryRun) {
  if (isDryRun) {
    console.log(`[DRY-RUN] Se limpiarían todos los documentos de "${collectionName}".`);
    return;
  }

  const docs = await listDocuments(baseUrl, collectionName);
  for (const doc of docs) {
    const docId = doc.name.split("/").pop();
    if (collectionName === "applications") {
      const msgs = await listDocuments(baseUrl, `applications/${docId}/messages`);
      for (const msg of msgs) {
        const msgId = msg.name.split("/").pop();
        await emulatorRequest(`${baseUrl}/applications/${docId}/messages/${msgId}`, {
          method: "DELETE",
        });
      }
    }
    await emulatorRequest(`${baseUrl}/${collectionName}/${docId}`, {
      method: "DELETE",
    });
    console.log(`Eliminado: ${collectionName}/${docId}`);
  }
}

async function upsertDocument(baseUrl, collectionName, docId, fields, isDryRun) {
  if (isDryRun) {
    const summary = fields.title?.stringValue || fields.name?.stringValue || fields.projectTitle?.stringValue || docId;
    console.log(`[DRY-RUN] Se escribiría ${collectionName}/${docId} (${summary})`);
    return;
  }

  await emulatorRequest(`${baseUrl}/${collectionName}/${docId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields }),
  });
  console.log(`Guardado: ${collectionName}/${docId}`);
}

function buildSeedData() {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const users = [
    {
      id: "demo-user-ioi",
      fields: {
        name: toFirestoreString("Perfil Ejemplo · Organización Industrial"),
        degree: toFirestoreString("Grado en Ingeniería en Organización Industrial"),
        campus: toFirestoreString("Valencia"),
        bio: toFirestoreString(
          "Perfil demostrativo de ejemplo para ilustrar la colaboración entre grados en CoFound UE."
        ),
        skills: toFirestoreStringArray([
          "Organización Industrial",
          "Gestión de Proyectos",
          "Operaciones",
        ]),
        updatedAt: toFirestoreTimestamp(new Date(now)),
      },
    },
    {
      id: "demo-user-biotech",
      fields: {
        name: toFirestoreString("Perfil Ejemplo · Biotecnología"),
        degree: toFirestoreString("Grado en Biotecnología"),
        campus: toFirestoreString("Valencia"),
        bio: toFirestoreString(
          "Perfil demostrativo de ejemplo para ilustrar proyectos interdisciplinares entre salud y tecnología."
        ),
        skills: toFirestoreStringArray([
          "Biotecnología",
          "Bioinformática",
          "Análisis de Datos",
        ]),
        updatedAt: toFirestoreTimestamp(new Date(now)),
      },
    },
    {
      id: "demo-user-tech",
      fields: {
        name: toFirestoreString("Perfil Ejemplo · Ingeniería Informática"),
        degree: toFirestoreString("Grado en Ingeniería Informática"),
        campus: toFirestoreString("Alameda"),
        bio: toFirestoreString(
          "Perfil demostrativo de ejemplo enfocado en desarrollo de software y prototipado rápido."
        ),
        skills: toFirestoreStringArray([
          "Desarrollo Web",
          "TypeScript",
          "Bases de Datos",
        ]),
        updatedAt: toFirestoreTimestamp(new Date(now)),
      },
    },
    {
      id: "demo-user-marketing",
      fields: {
        name: toFirestoreString("Perfil Ejemplo · Marketing"),
        degree: toFirestoreString("Grado en Marketing"),
        campus: toFirestoreString("Alameda"),
        bio: toFirestoreString(
          "Perfil demostrativo de ejemplo centrado en comunicación, marca y estrategia de lanzamiento."
        ),
        skills: toFirestoreStringArray([
          "Marketing Digital",
          "Estrategia de Marca",
          "Comunicación",
        ]),
        updatedAt: toFirestoreTimestamp(new Date(now)),
      },
    },
    {
      id: "demo-user-ade",
      fields: {
        name: toFirestoreString("Perfil Ejemplo · ADE"),
        degree: toFirestoreString("Grado en ADE"),
        campus: toFirestoreString("Valencia"),
        bio: toFirestoreString(
          "Perfil demostrativo de ejemplo centrado en modelos de negocio y análisis de viabilidad."
        ),
        skills: toFirestoreStringArray([
          "Finanzas",
          "Modelos de Negocio",
          "Estrategia",
        ]),
        updatedAt: toFirestoreTimestamp(new Date(now)),
      },
    },
  ];

  const projects = [
    {
      id: "campusbite-uev",
      fields: {
        title: toFirestoreString(
          "[Proyecto de ejemplo] CampusBite — Gestión de menús y excedentes en cafeterías"
        ),
        description: toFirestoreString(
          "Proyecto de ejemplo para ilustrar cómo conectar perfiles de distintos grados. La idea plantea una plataforma para organizar reservas de menú y aprovechar excedentes diarios en cafeterías universitarias. Se buscan perfiles de desarrollo web/móvil, diseño de interfaz y marketing para explorar el concepto y definir un primer prototipo."
        ),
        category: toFirestoreString("Startup Real"),
        creator_id: toFirestoreString("demo-user-ioi"),
        creatorName: toFirestoreString("Perfil Ejemplo · Organización Industrial"),
        profiles: toFirestoreStringArray([
          "Ingeniería Informática",
          "Diseño UI/UX",
          "Marketing Digital",
        ]),
        createdAt: toFirestoreTimestamp(new Date(now - 1 * dayMs)),
      },
    },
    {
      id: "biotrack-sensor-deporte",
      fields: {
        title: toFirestoreString(
          "[Proyecto de ejemplo] BioTrack — Monitorización de fatiga muscular en deporte"
        ),
        description: toFirestoreString(
          "Proyecto de ejemplo orientado a combinar ciencias de la salud, tecnología y negocio. Propone diseñar un prototipo wearable para medir indicadores de fatiga muscular en deportistas. Se buscan perfiles técnicos para hardware y app, junto con un perfil de ADE para plantear un modelo de negocio viable."
        ),
        category: toFirestoreString("Startup Real"),
        creator_id: toFirestoreString("demo-user-biotech"),
        creatorName: toFirestoreString("Perfil Ejemplo · Biotecnología"),
        profiles: toFirestoreStringArray([
          "Ingeniería Biomédica / Electrónica",
          "Desarrollo Móvil",
          "ADE / Plan de Negocio",
        ]),
        createdAt: toFirestoreTimestamp(new Date(now - 2 * dayMs)),
      },
    },
    {
      id: "tfg-gemelo-digital-industria",
      fields: {
        title: toFirestoreString(
          "[Proyecto de ejemplo] TFG: Gemelo digital y eficiencia energética industrial"
        ),
        description: toFirestoreString(
          "Proyecto de ejemplo de TFG interdisciplinar. Propone modelar el consumo energético de una línea de producción mediante IoT y un gemelo digital, combinando el enfoque técnico con un estudio de costes y viabilidad económica. Se buscan perfiles interesados en análisis de datos, dashboards y finanzas."
        ),
        category: toFirestoreString("TFG"),
        creator_id: toFirestoreString("demo-user-ioi"),
        creatorName: toFirestoreString("Perfil Ejemplo · Organización Industrial"),
        profiles: toFirestoreStringArray([
          "Ingeniería en Organización Industrial",
          "Ingeniería Informática / Datos",
          "Finanzas",
        ]),
        createdAt: toFirestoreTimestamp(new Date(now - 3 * dayMs)),
      },
    },
    {
      id: "skillswap-uev-mentorias",
      fields: {
        title: toFirestoreString(
          "[Proyecto de ejemplo] SkillSwap — Micro-mentorías entre estudiantes de distintos grados"
        ),
        description: toFirestoreString(
          "Proyecto de ejemplo para mostrar una iniciativa de comunidad universitaria. Plantea una plataforma de intercambio de sesiones de apoyo entre grados (por ejemplo, programación o matemáticas a cambio de oratoria o marketing). Se buscan perfiles técnicos para construir un MVP sencillo y perfiles de ADE o comunicación para definir su lanzamiento."
        ),
        category: toFirestoreString("Startup Real"),
        creator_id: toFirestoreString("demo-user-tech"),
        creatorName: toFirestoreString("Perfil Ejemplo · Ingeniería Informática"),
        profiles: toFirestoreStringArray([
          "Ingeniería Informática",
          "ADE / Estrategia",
          "Creación de Contenido",
        ]),
        createdAt: toFirestoreTimestamp(new Date(now - 4 * dayMs)),
      },
    },
    {
      id: "rebranding-comercio-valencia",
      fields: {
        title: toFirestoreString(
          "[Proyecto de ejemplo] Digitalización y marca para comercios locales de Valencia"
        ),
        description: toFirestoreString(
          "Proyecto de ejemplo de reto académico con impacto local en Valencia. Plantea colaborar con pequeños comercios de barrio para renovar su identidad visual, digitalizar su catálogo y trabajar su presencia en redes sociales. Se buscan perfiles de diseño visual, marketing y desarrollo web."
        ),
        category: toFirestoreString("Reto Académico"),
        creator_id: toFirestoreString("demo-user-marketing"),
        creatorName: toFirestoreString("Perfil Ejemplo · Marketing"),
        profiles: toFirestoreStringArray([
          "Diseño Gráfico / Multimedia",
          "Marketing Digital",
          "Desarrollo Web",
        ]),
        createdAt: toFirestoreTimestamp(new Date(now - 5 * dayMs)),
      },
    },
    {
      id: "hackathon-sostenibilidad-2026",
      fields: {
        title: toFirestoreString(
          "[Proyecto de ejemplo] Equipo multidisciplinar para Hackathon de Sostenibilidad"
        ),
        description: toFirestoreString(
          "Proyecto de ejemplo para formar equipo de cara a un hackathon universitario sobre ciudades inteligentes y sostenibilidad. Se buscan perfiles complementarios que cubran desarrollo de un prototipo rápido, diseño de interfaz y preparación del pitch."
        ),
        category: toFirestoreString("Reto Académico"),
        creator_id: toFirestoreString("demo-user-ade"),
        creatorName: toFirestoreString("Perfil Ejemplo · ADE"),
        profiles: toFirestoreStringArray([
          "Full Stack Developer",
          "UX/UI Designer",
          "Pitch & Business Model",
        ]),
        createdAt: toFirestoreTimestamp(new Date(now - 6 * dayMs)),
      },
    },
  ];

  const applications = [
    {
      id: "campusbite-uev_demo-user-tech",
      fields: {
        projectId: toFirestoreString("campusbite-uev"),
        projectTitle: toFirestoreString(
          "[Proyecto de ejemplo] CampusBite — Gestión de menús y excedentes en cafeterías"
        ),
        applicantId: toFirestoreString("demo-user-tech"),
        creatorId: toFirestoreString("demo-user-ioi"),
        status: toFirestoreString("pending"),
        createdAt: toFirestoreTimestamp(new Date(now - 12 * 60 * 60 * 1000)),
      },
    },
  ];

  return { users, projects, applications };
}

async function runSeed() {
  const isDryRun = process.argv.includes("--dry-run");
  const { emulatorHost, projectId } = assertEmulatorEnvironment();
  const baseUrl = `http://${emulatorHost}/v1/projects/${projectId}/databases/(default)/documents`;

  console.log(
    `Entorno emulador verificado: ${emulatorHost} (proyecto: ${projectId})${
      isDryRun ? " [MODO DRY-RUN]" : ""
    }`
  );

  await clearCollection(baseUrl, "applications", isDryRun);
  await clearCollection(baseUrl, "projects", isDryRun);
  await clearCollection(baseUrl, "users", isDryRun);

  const { users, projects, applications } = buildSeedData();

  for (const user of users) {
    await upsertDocument(baseUrl, "users", user.id, user.fields, isDryRun);
  }
  for (const project of projects) {
    await upsertDocument(baseUrl, "projects", project.id, project.fields, isDryRun);
  }
  for (const application of applications) {
    await upsertDocument(baseUrl, "applications", application.id, application.fields, isDryRun);
  }

  console.log(
    `\nCompletado${isDryRun ? " (dry-run, sin cambios escritos)" : ""}: ` +
      `${users.length} perfiles de ejemplo, ${projects.length} proyectos de ejemplo y ${applications.length} postulación demostrativa.`
  );
}

runSeed().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
