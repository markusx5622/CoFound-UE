/**
 * Sincroniza EXCLUSIVAMENTE los 7 documentos oficiales del escaparate demostrativo
 * (`users/demo-cofound-ue` y los 6 `projects/*` de referencia) en Cloud Firestore.
 *
 * Seguridad:
 * - Solo escribe sobre los 7 IDs permitidos explícitamente (nunca borra ni toca datos reales).
 * - Por defecto se ejecuta en modo `--dry-run`. Para escribir en producción exige `--apply-prod`.
 * - Usa autenticación oficial mediante Service Account (`GOOGLE_APPLICATION_CREDENTIALS`).
 *
 * Uso:
 *   1) Simulación (sin escribir):
 *      node scripts/sync-demo-showcase.mjs
 *
 *   2) Aplicar en producción `cofound-ue`:
 *      $env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\a\cofound-ue-service-account.json"
 *      node scripts/sync-demo-showcase.mjs --apply-prod
 */

import crypto from "node:crypto";
import fs from "node:fs";
import { OFFICIAL_DEMO_USER, OFFICIAL_DEMO_PROJECTS } from "./demo-showcase-data.mjs";

const PROJECT_ID = "cofound-ue";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessTokenFromServiceAccount(saPath) {
  const raw = fs.readFileSync(saPath, "utf8");
  const sa = JSON.parse(raw);

  if (!sa.client_email || !sa.private_key) {
    throw new Error("El archivo JSON de cuenta de servicio no contiene client_email o private_key.");
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64UrlEncode(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: sa.token_uri || "https://oauth2.googleapis.com/token",
      iat: nowSec,
      exp: nowSec + 3600,
    })
  );

  const unsignedJwt = `${header}.${claim}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedJwt);
  const signature = base64UrlEncode(signer.sign(sa.private_key));
  const assertion = `${unsignedJwt}.${signature}`;

  const tokenRes = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Error obteniendo token OAuth2 (${tokenRes.status}): ${await tokenRes.text()}`);
  }

  const tokenJson = await tokenRes.json();
  return tokenJson.access_token;
}

async function patchDocument(token, docPath, fields, updateMaskFields) {
  const maskQuery = updateMaskFields
    .map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`)
    .join("&");
  const url = `${BASE_URL}/${docPath}?${maskQuery}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} actualizando ${docPath}: ${await res.text()}`);
  }
}

async function main() {
  const applyProd = process.argv.includes("--apply-prod");
  const now = new Date();

  const userFields = {
    name: toFirestoreString(OFFICIAL_DEMO_USER.name),
    degree: toFirestoreString(OFFICIAL_DEMO_USER.degree),
    campus: toFirestoreString(OFFICIAL_DEMO_USER.campus),
    bio: toFirestoreString(OFFICIAL_DEMO_USER.bio),
    skills: toFirestoreStringArray(OFFICIAL_DEMO_USER.skills),
    updatedAt: toFirestoreTimestamp(now),
  };

  if (!applyProd) {
    console.log("[DRY-RUN] Vista previa de los 7 documentos oficiales a actualizar en cofound-ue:\n");
    console.log(`- users/${OFFICIAL_DEMO_USER.id} -> "${OFFICIAL_DEMO_USER.name}" (${OFFICIAL_DEMO_USER.skills.length} skills, bio ${OFFICIAL_DEMO_USER.bio.length} chars)`);
    for (const proj of OFFICIAL_DEMO_PROJECTS) {
      console.log(`- projects/${proj.id} -> "${proj.title}" [${proj.category}] (${proj.description.length} chars, ${proj.profiles.length} perfiles)`);
    }
    console.log("\nPara aplicar en producción ejecuta:");
    console.log('  $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\ruta\\a\\tu-service-account.json"');
    console.log("  node scripts/sync-demo-showcase.mjs --apply-prod");
    return;
  }

  const saPath = (process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim();
  if (!saPath || !fs.existsSync(saPath)) {
    throw new Error(
      "Falta GOOGLE_APPLICATION_CREDENTIALS apuntando al JSON de cuenta de servicio de Firebase (Configuración del proyecto -> Cuentas de servicio -> Generar nueva clave privada)."
    );
  }

  const token = await getAccessTokenFromServiceAccount(saPath);

  await patchDocument(token, `users/${OFFICIAL_DEMO_USER.id}`, userFields, Object.keys(userFields));
  console.log(`OK actualizado: users/${OFFICIAL_DEMO_USER.id}`);

  for (const proj of OFFICIAL_DEMO_PROJECTS) {
    const projFields = {
      title: toFirestoreString(proj.title),
      description: toFirestoreString(proj.description),
      category: toFirestoreString(proj.category),
      profiles: toFirestoreStringArray(proj.profiles),
      creator_id: toFirestoreString(proj.creator_id),
      creatorName: toFirestoreString(proj.creatorName),
    };
    // Mantiene el createdAt existente en producción si el documento ya existe
    await patchDocument(token, `projects/${proj.id}`, projFields, Object.keys(projFields));
    console.log(`OK actualizado: projects/${proj.id}`);
  }

  console.log("\nSincronización completada: 1 perfil oficial + 6 proyectos de ejemplo actualizados en cofound-ue.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
