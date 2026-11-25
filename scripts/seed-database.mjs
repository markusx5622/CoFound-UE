/**
 * Script de sembrado de datos de ejemplo para el emulador local de Firestore.
 * Contiene únicamente perfiles demostrativos y proyectos de ejemplo sin datos personales.
 * Bloquea estrictamente cualquier ejecución contra entornos de producción.
 */

import { OFFICIAL_DEMO_USER, OFFICIAL_DEMO_PROJECTS } from "./demo-showcase-data.mjs";

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
      id: OFFICIAL_DEMO_USER.id,
      fields: {
        name: toFirestoreString(OFFICIAL_DEMO_USER.name),
        degree: toFirestoreString(OFFICIAL_DEMO_USER.degree),
        campus: toFirestoreString(OFFICIAL_DEMO_USER.campus),
        bio: toFirestoreString(OFFICIAL_DEMO_USER.bio),
        skills: toFirestoreStringArray(OFFICIAL_DEMO_USER.skills),
        updatedAt: toFirestoreTimestamp(new Date(now)),
      },
    },
  ];

  const projects = OFFICIAL_DEMO_PROJECTS.map((proj) => ({
    id: proj.id,
    fields: {
      title: toFirestoreString(proj.title),
      description: toFirestoreString(proj.description),
      category: toFirestoreString(proj.category),
      creator_id: toFirestoreString(proj.creator_id),
      creatorName: toFirestoreString(proj.creatorName),
      profiles: toFirestoreStringArray(proj.profiles),
      createdAt: toFirestoreTimestamp(new Date(now - proj.daysAgo * dayMs)),
    },
  }));

  const applications = [];

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
