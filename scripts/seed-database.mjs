import fs from 'fs';
import path from 'path';

// Cargar token de firebase-tools
const configPath = path.join(process.env.USERPROFILE, '.config', 'configstore', 'firebase-tools.json');
if (!fs.existsSync(configPath)) {
  console.error('No se encontró firebase-tools.json en:', configPath);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
let accessToken = config.tokens?.access_token;
const refreshToken = config.tokens?.refresh_token;

async function refreshAccessToken() {
  if (!refreshToken) return accessToken;
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho859e1.apps.googleusercontent.com',
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });
    const data = await res.json();
    if (data.access_token) {
      accessToken = data.access_token;
    }
  } catch (e) {
    console.warn('Error refreshing token, using existing token:', e);
  }
  return accessToken;
}

const BASE_URL = 'https://firestore.googleapis.com/v1/projects/cofound-ue/databases/(default)/documents';

async function fetchWithAuth(url, options = {}) {
  const token = await refreshAccessToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

async function deleteDocument(docPath) {
  const res = await fetchWithAuth(`${BASE_URL}/${docPath}`, { method: 'DELETE' });
  return res.ok;
}

async function getDocuments(collectionName) {
  const res = await fetchWithAuth(`${BASE_URL}/${collectionName}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.documents || [];
}

async function setDocument(collectionName, docId, fields) {
  const url = `${BASE_URL}/${collectionName}/${docId}`;
  const res = await fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify({ fields })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Error guardando ${collectionName}/${docId}:`, err);
  } else {
    console.log(`✓ Documento ${collectionName}/${docId} guardado con éxito.`);
  }
}

async function runSeed() {
  console.log('--- 1. LIMPIEZA DE APLICACIONES Y MENSAJES ---');
  const applications = await getDocuments('applications');
  for (const app of applications) {
    const appId = app.name.split('/').pop();
    // Subcolección messages
    const msgsRes = await fetchWithAuth(`${BASE_URL}/applications/${appId}/messages`);
    if (msgsRes.ok) {
      const msgsData = await msgsRes.json();
      for (const msg of msgsData.documents || []) {
        const msgId = msg.name.split('/').pop();
        await deleteDocument(`applications/${appId}/messages/${msgId}`);
      }
    }
    await deleteDocument(`applications/${appId}`);
    console.log(`Eliminada postulación: ${appId}`);
  }

  console.log('\n--- 2. LIMPIEZA DE PROYECTOS ANTIGUOS ---');
  const projects = await getDocuments('projects');
  for (const proj of projects) {
    const projId = proj.name.split('/').pop();
    await deleteDocument(`projects/${projId}`);
    console.log(`Eliminado proyecto antiguo: ${projId} (${proj.fields?.title?.stringValue || 'sin título'})`);
  }

  console.log('\n--- 3. ACTUALIZACIÓN Y SANEAMIENTO DE PERFILES DE USUARIO ---');
  const usersToUpdate = {
    // Marc Cubero (Cuenta Real)
    'NqVxPE3Qz2cYQzkG8NACfzl5Yq62': {
      name: { stringValue: 'Marc Cubero Cantavella' },
      degree: { stringValue: 'Grado en Organización Industrial (IOI)' },
      campus: { stringValue: 'Valencia' },
      bio: { stringValue: 'Estudiante de Ingeniería en Organización Industrial en la Universidad Europea de Valencia. Cofundador de CoFound UE. Apasionado por la tecnología, startups y la optimización de procesos.' },
      skills: {
        arrayValue: {
          values: [
            { stringValue: 'Organización Industrial' },
            { stringValue: 'Desarrollo Web' },
            { stringValue: 'Gestión de Proyectos' },
            { stringValue: 'Product Management' },
            { stringValue: 'Lean Startup' }
          ]
        }
      },
      photoURL: { stringValue: 'https://ui-avatars.com/api/?name=Marc+Cubero+Cantavella&background=18181b&color=E60000&size=256&font-size=0.4' },
      email: { stringValue: '225f8625@live.uem.es' },
      updatedAt: { timestampValue: new Date().toISOString() }
    },
    // Juan Marqués (Cuenta Real)
    'eYS3oebpy6fDhnxbPyT85xUdIi93': {
      name: { stringValue: 'Juan Marqués' },
      degree: { stringValue: 'Grado en Organización Industrial (IOI)' },
      campus: { stringValue: 'Valencia' },
      bio: { stringValue: 'Estudiante de IOI en la UEV. Interesado en finanzas de startups, modelos de negocio escalables y operaciones industriales.' },
      skills: {
        arrayValue: {
          values: [
            { stringValue: 'Organización Industrial' },
            { stringValue: 'Estrategia B2B' },
            { stringValue: 'Modelos de Negocio' },
            { stringValue: 'Finanzas' }
          ]
        }
      },
      photoURL: { stringValue: 'https://ui-avatars.com/api/?name=Juan+Marques&background=18181b&color=E60000&size=256&font-size=0.4' },
      email: { stringValue: '22561017@live.uem.es' },
      updatedAt: { timestampValue: new Date().toISOString() }
    },
    // Rebecca Jiménez (Cuenta Real)
    'oMiTe6rGaXND96ngiOVxaqKgMHC3': {
      name: { stringValue: 'Rebecca Jiménez' },
      degree: { stringValue: 'Grado en Marketing Global' },
      campus: { stringValue: 'Valencia' },
      bio: { stringValue: 'Estudiante de Marketing en la UEV. Especializada en estrategia de comunicación, captación en campus y branding para nuevos proyectos.' },
      skills: {
        arrayValue: {
          values: [
            { stringValue: 'Marketing Digital' },
            { stringValue: 'Estrategia de Marca' },
            { stringValue: 'Growth' },
            { stringValue: 'Comunicación' },
            { stringValue: 'Eventos' }
          ]
        }
      },
      photoURL: { stringValue: 'https://ui-avatars.com/api/?name=Rebecca+Jimenez&background=18181b&color=E60000&size=256&font-size=0.4' },
      updatedAt: { timestampValue: new Date().toISOString() }
    },
    // Usuario saneado: Javier Valero (Biotecnología)
    '11bicYbPZidBwCioF0SvCVUtd892': {
      name: { stringValue: 'Javier Valero' },
      degree: { stringValue: 'Grado en Biotecnología' },
      campus: { stringValue: 'Valencia' },
      bio: { stringValue: 'Estudiante de 4º curso de Biotecnología en la UEV. Apasionado por la bioinformática y el desarrollo de tecnologías de monitorización aplicadas a la salud.' },
      skills: {
        arrayValue: {
          values: [
            { stringValue: 'Biotecnología' },
            { stringValue: 'Bioinformática' },
            { stringValue: 'Análisis de Laboratorio' },
            { stringValue: 'Investigación Biomédica' }
          ]
        }
      },
      photoURL: { stringValue: 'https://ui-avatars.com/api/?name=Javier+Valero&background=18181b&color=E60000&size=256&font-size=0.4' },
      updatedAt: { timestampValue: new Date().toISOString() }
    },
    // Usuario saneado: Alejandro Soriano (ADE)
    'CqzVJYrd3ZPNv3iZsAsD0XUk1LY2': {
      name: { stringValue: 'Alejandro Soriano' },
      degree: { stringValue: 'Grado en ADE & International Business' },
      campus: { stringValue: 'Valencia' },
      bio: { stringValue: 'Estudiante de ADE en la UEV. Enfocado en análisis financiero, validación de modelos de negocio y preparación de rondas de inversión para startups.' },
      skills: {
        arrayValue: {
          values: [
            { stringValue: 'Finanzas' },
            { stringValue: 'Modelos de Negocio' },
            { stringValue: 'Estrategia Comercial' },
            { stringValue: 'Pitch Decks' }
          ]
        }
      },
      photoURL: { stringValue: 'https://ui-avatars.com/api/?name=Alejandro+Soriano&background=18181b&color=E60000&size=256&font-size=0.4' },
      updatedAt: { timestampValue: new Date().toISOString() }
    },
    // Usuario saneado: Lucía Navarro (Ing. Informática)
    'nrBiwMtr65RNMFf2Iip7UrBPuwg1': {
      name: { stringValue: 'Lucía Navarro' },
      degree: { stringValue: 'Grado en Ingeniería Informática' },
      campus: { stringValue: 'Valencia' },
      bio: { stringValue: 'Estudiante de Ingeniería Informática en la UEV. Desarrolladora Full-Stack con pasión por React, Node.js y soluciones de Inteligencia Artificial.' },
      skills: {
        arrayValue: {
          values: [
            { stringValue: 'Ingeniería Informática' },
            { stringValue: 'React / Next.js' },
            { stringValue: 'Node.js' },
            { stringValue: 'Python & IA' }
          ]
        }
      },
      photoURL: { stringValue: 'https://ui-avatars.com/api/?name=Lucia+Navarro&background=18181b&color=E60000&size=256&font-size=0.4' },
      updatedAt: { timestampValue: new Date().toISOString() }
    },
    // Usuario saneado: Marta Vidal (Diseño)
    'DdkCuMmpwUgZkb5lHV5p7s7jJIy1': {
      name: { stringValue: 'Marta Vidal' },
      degree: { stringValue: 'Grado en Diseño Multimedia y Gráfico' },
      campus: { stringValue: 'Valencia' },
      bio: { stringValue: 'Diseñadora visual e interactiva en la UEV. Especializada en interfaces digitales en Figma, sistemas de diseño y branding para aplicaciones móviles y web.' },
      skills: {
        arrayValue: {
          values: [
            { stringValue: 'Diseño UI/UX' },
            { stringValue: 'Figma' },
            { stringValue: 'Branding' },
            { stringValue: 'Diseño Gráfico' },
            { stringValue: 'Prototipado' }
          ]
        }
      },
      photoURL: { stringValue: 'https://ui-avatars.com/api/?name=Marta+Vidal&background=18181b&color=E60000&size=256&font-size=0.4' },
      updatedAt: { timestampValue: new Date().toISOString() }
    }
  };

  for (const [uid, fields] of Object.entries(usersToUpdate)) {
    await setDocument('users', uid, fields);
  }

  console.log('\n--- 4. CREACIÓN DE PROYECTOS SEMILLA PROFESIONALES ---');
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const projectsToCreate = [
    {
      id: 'campusbite-uev',
      fields: {
        title: { stringValue: 'CampusBite — Optimización de menús y excedentes de cafeterías del campus' },
        description: { stringValue: 'Plataforma para conectar las cafeterías universitarias de Valencia con los estudiantes en horas punta, permitiendo reservas anticipadas de menú y venta con descuento de excedentes diarios para combatir el desperdicio alimentario en el campus. Contamos con estudio de demanda inicial con más de 80 respuestas en la UEV. Buscamos un perfil de desarrollo web/móvil para cerrar el MVP y alguien de marketing para la campaña de lanzamiento en el campus.' },
        category: { stringValue: 'Startup Real' },
        creator_id: { stringValue: 'NqVxPE3Qz2cYQzkG8NACfzl5Yq62' }, // Marc Cubero
        creatorName: { stringValue: 'Marc Cubero Cantavella' },
        profiles: {
          arrayValue: {
            values: [
              { stringValue: 'Ingeniería Informática' },
              { stringValue: 'Diseño UI/UX' },
              { stringValue: 'Marketing Digital' }
            ]
          }
        },
        createdAt: { timestampValue: new Date(now - 1 * dayMs).toISOString() }
      }
    },
    {
      id: 'biotrack-sensor-deporte',
      fields: {
        title: { stringValue: 'BioTrack UEV — Sensor portátil para monitorización de fatiga muscular en deportistas' },
        description: { stringValue: 'Desarrollo de un dispositivo wearable de bajo coste para monitorizar biomarcadores y ácido láctico en tiempo real en deportistas de alto rendimiento y semiprofesionales. La parte de sensorística bioquímica está validada en laboratorio universitario. Buscamos compañeros de ingeniería para el firmware/app y un estudiante de ADE para presentarnos al programa de aceleración universitaria y definir modelo de negocio B2B.' },
        category: { stringValue: 'Startup Real' },
        creator_id: { stringValue: '11bicYbPZidBwCioF0SvCVUtd892' }, // Javier Valero
        creatorName: { stringValue: 'Javier Valero' },
        profiles: {
          arrayValue: {
            values: [
              { stringValue: 'Ingeniería Biomédica / Electrónica' },
              { stringValue: 'Desarrollo Móvil' },
              { stringValue: 'ADE / Plan de Negocio' }
            ]
          }
        },
        createdAt: { timestampValue: new Date(now - 2 * dayMs).toISOString() }
      }
    },
    {
      id: 'tfg-gemelo-digital-industria',
      fields: {
        title: { stringValue: 'TFG Interdisciplinar: Gemelo Digital y Eficiencia Energética en Plantas Industriales' },
        description: { stringValue: 'Propuesta de TFG conjunto tutorizado para modelar el consumo energético de una línea de producción mediante IoT y gemelo digital (Digital Twin). El objetivo es entregar un proyecto técnico completo con caso real y análisis de rentabilidad (VAN, TIR y amortización de inversión). Buscamos un perfil con foco en análisis de datos o desarrollo de dashboard y alguien orientado a costes y viabilidad financiera.' },
        category: { stringValue: 'TFG' },
        creator_id: { stringValue: 'eYS3oebpy6fDhnxbPyT85xUdIi93' }, // Juan Marqués
        creatorName: { stringValue: 'Juan Marqués' },
        profiles: {
          arrayValue: {
            values: [
              { stringValue: 'Ingeniería en Organización Industrial' },
              { stringValue: 'Ingeniería Informática / Datos' },
              { stringValue: 'Finanzas' }
            ]
          }
        },
        createdAt: { timestampValue: new Date(now - 3 * dayMs).toISOString() }
      }
    },
    {
      id: 'skillswap-uev-mentorias',
      fields: {
        title: { stringValue: 'SkillSwap Campus — Plataforma peer-to-peer de micro-mentorías entre estudiantes' },
        description: { stringValue: 'Comunidad interna para intercambiar horas de formación entre grados (ej: clases de Python o Matemáticas a cambio de clases de oratoria o marketing, o por créditos de campus). Tenemos el prototipo interactivo en Figma y la arquitectura del backend definida. Buscamos un co-founder técnico para el despliegue del MVP y un estudiante de ADE/Marketing para liderar la estrategia de Go-To-Market en el campus de Valencia.' },
        category: { stringValue: 'Startup Real' },
        creator_id: { stringValue: 'nrBiwMtr65RNMFf2Iip7UrBPuwg1' }, // Lucía Navarro
        creatorName: { stringValue: 'Lucía Navarro' },
        profiles: {
          arrayValue: {
            values: [
              { stringValue: 'Ingeniería Informática' },
              { stringValue: 'ADE / Estrategia' },
              { stringValue: 'Creación de Contenido' }
            ]
          }
        },
        createdAt: { timestampValue: new Date(now - 4 * dayMs).toISOString() }
      }
    },
    {
      id: 'rebranding-comercio-valencia',
      fields: {
        title: { stringValue: 'Rebranding y Experiencia Digital para Comercios Tradicionales de Valencia' },
        description: { stringValue: 'Iniciativa interdisciplinar de impacto local en Valencia. Seleccionamos tres comercios emblemáticos de la zona centro para modernizar su identidad visual, digitalizar su carta/catálogo y lanzar una campaña de visibilidad en TikTok e Instagram para conectar con el público joven. Buscamos creadores visuales y un perfil que nos ayude con una web showcase sencilla.' },
        category: { stringValue: 'Reto Académico' },
        creator_id: { stringValue: 'oMiTe6rGaXND96ngiOVxaqKgMHC3' }, // Rebecca Jiménez
        creatorName: { stringValue: 'Rebecca Jiménez' },
        profiles: {
          arrayValue: {
            values: [
              { stringValue: 'Diseño Gráfico / Multimedia' },
              { stringValue: 'Marketing Digital' },
              { stringValue: 'Desarrollo Web' }
            ]
          }
        },
        createdAt: { timestampValue: new Date(now - 5 * dayMs).toISOString() }
      }
    },
    {
      id: 'hackathon-sostenibilidad-2026',
      fields: {
        title: { stringValue: 'Equipo Hackathon Valencia Tech & Sustainability 2026' },
        description: { stringValue: 'Formación de equipo multidisciplinar de 4 personas para participar en el próximo hackathon universitario de Valencia sobre Ciudades Inteligentes y Sostenibilidad. Buscamos perfiles complementarios para cubrir la parte técnica (MVP rápido en 48h), diseño de interfaces atractivas y defensa del pitch ante el jurado.' },
        category: { stringValue: 'Reto Académico' },
        creator_id: { stringValue: 'CqzVJYrd3ZPNv3iZsAsD0XUk1LY2' }, // Alejandro Soriano
        creatorName: { stringValue: 'Alejandro Soriano' },
        profiles: {
          arrayValue: {
            values: [
              { stringValue: 'Full Stack Developer' },
              { stringValue: 'UX/UI Designer' },
              { stringValue: 'Pitch & Business Model' }
            ]
          }
        },
        createdAt: { timestampValue: new Date(now - 6 * dayMs).toISOString() }
      }
    }
  ];

  for (const proj of projectsToCreate) {
    await setDocument('projects', proj.id, proj.fields);
  }

  console.log('\n--- 5. CREACIÓN DE POSTULACIÓN DE PRUEBA REALISTA PARA MARC ---');
  // Una postulación pendiente de Lucía Navarro hacia CampusBite (Marc)
  const demoAppId = 'demo-app-lucia-campusbite';
  await setDocument('applications', demoAppId, {
    projectId: { stringValue: 'campusbite-uev' },
    projectTitle: { stringValue: 'CampusBite — Optimización de menús y excedentes de cafeterías del campus' },
    applicantId: { stringValue: 'nrBiwMtr65RNMFf2Iip7UrBPuwg1' }, // Lucía Navarro
    creatorId: { stringValue: 'NqVxPE3Qz2cYQzkG8NACfzl5Yq62' }, // Marc Cubero
    status: { stringValue: 'pending' },
    createdAt: { timestampValue: new Date(now - 12 * 60 * 60 * 1000).toISOString() }
  });

  console.log('\n✅ PROCESO COMPLETADO CON ÉXITO:');
  console.log('1. Proyectos basura y mensajes inaceptables eliminados.');
  console.log('2. Perfiles de usuario saneados con datos realistas y profesionales de la UEV.');
  console.log('3. 6 proyectos representativos e interdisciplinares creados.');
  console.log('4. 1 postulación de demostración activa en "Mis Proyectos" para Marc.');
}

runSeed().catch(console.error);

