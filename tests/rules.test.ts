// @vitest-environment node
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

let testEnv: RulesTestEnvironment;

// Desactivar warnings del emulador y forzar puerto local
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

describe("CoFound-UE Firestore Rules", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "cofound-ue-test",
      firestore: {
        rules: readFileSync(resolve(__dirname, "../firestore.rules"), "utf8"),
        host: "127.0.0.1",
        port: 8080,
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  const getAuthContext = (uid: string, email: string) => {
    return testEnv.authenticatedContext(uid, { email, email_verified: true });
  };

  const getUnverifiedAuthContext = (uid: string, email: string) => {
    return testEnv.authenticatedContext(uid, { email, email_verified: false });
  };

  describe("Users Collection", () => {
    it("lectura requiere auth", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(unauthedDb.collection("users").doc("user1").get());
      
      const authedDb = getAuthContext("user1", "test@live.uem.es").firestore();
      await assertSucceeds(authedDb.collection("users").doc("user1").get());
    });

    it("escritura solo del propio uid", async () => {
      const db = getAuthContext("user1", "test@live.uem.es").firestore();
      
      // Escritura propia
      await assertSucceeds(db.collection("users").doc("user1").set({ name: "User 1" }));
      // Escritura en doc ajeno
      await assertFails(db.collection("users").doc("user2").set({ name: "User 2" }));
    });

    it("bloquea inyectar o modificar email pero permite actualizar y migrar documentos con email heredado", async () => {
      const db = getAuthContext("user1", "user1@live.uem.es").firestore();

      // 1. Crear documento nuevo con campo email falla (RGPD)
      await assertFails(
        db.collection("users").doc("user1").set({
          name: "User 1",
          email: "user1@live.uem.es",
        })
      );

      // 2. Sembrar documento heredado con email previo a la regla RGPD
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user1").set({
          name: "User 1",
          degree: "Grado en IOI",
          campus: "Valencia",
          email: "user1@live.uem.es",
        });
      });

      // 3. Actualizar perfil heredado con merge: true sin alterar email funciona
      await assertSucceeds(
        db.collection("users").doc("user1").set(
          { name: "User 1 Actualizado", bio: "Nueva bio" },
          { merge: true }
        )
      );

      // 4. Intentar modificar el valor del email heredado falla
      await assertFails(
        db.collection("users").doc("user1").set(
          { email: "otro@live.uem.es" },
          { merge: true }
        )
      );

      // 5. Migrar el documento eliminando el campo email funciona
      await assertSucceeds(
        db.collection("users").doc("user1").set({
          name: "User 1 Migrado",
          degree: "Grado en IOI",
          campus: "Valencia",
        })
      );

      // 6. Una vez eliminado, volver a inyectar email con merge: true falla
      await assertFails(
        db.collection("users").doc("user1").set(
          { email: "user1@live.uem.es" },
          { merge: true }
        )
      );
    });

    it("bloquea perfiles que superen los límites de tamaño en name, bio o skills o campos extra no permitidos", async () => {
      const db = getAuthContext("user1", "user1@live.uem.es").firestore();

      await assertFails(db.collection("users").doc("user1").set({ name: "a".repeat(101) }));
      await assertFails(db.collection("users").doc("user1").set({ name: "User 1", bio: "a".repeat(1001) }));
      await assertFails(db.collection("users").doc("user1").set({ name: "User 1", skills: Array(21).fill("React") }));
      await assertFails(db.collection("users").doc("user1").set({ name: "User 1", role: "superadmin" }));

      await assertSucceeds(db.collection("users").doc("user1").set({
        name: "User 1",
        degree: "Grado en IOI",
        campus: "Valencia",
        bio: "Bio válida",
        skills: ["React", "Next.js"],
      }));
    });

    it("bloquea listado masivo (list) de users y rechaza elementos inválidos en skills o photoURL (SEC-01, SEC-03, SEC-14)", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection("users").doc("uList1").set({ name: "User 1" });
        await adminDb.collection("users").doc("uList2").set({ name: "User 2" });
      });

      const db = getAuthContext("uList1", "ulist1@live.uem.es").firestore();

      // Lectura puntual permitida, pero volcado completo de la colección users denegado
      await assertSucceeds(db.collection("users").doc("uList2").get());
      await assertFails(db.collection("users").get());

      // Poison-pill: objetos, números o etiquetas > 40 chars en skills fallan
      await assertFails(db.collection("users").doc("uList1").set({ name: "User 1", skills: [{ bad: 1 }] }));
      await assertFails(db.collection("users").doc("uList1").set({ name: "User 1", skills: [12345] }));
      await assertFails(db.collection("users").doc("uList1").set({ name: "User 1", skills: ["a".repeat(41)] }));
      // Campo photoURL retirado del esquema falla
      await assertFails(db.collection("users").doc("uList1").set({ name: "User 1", photoURL: "https://evil.test/x" }));
    });
  });

  describe("Projects Collection", () => {
    it("create sin auth falla", async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(db.collection("projects").doc("proj1").set({
        creator_id: "user1",
        creatorName: "User",
        title: "Valid title",
        description: "Valid description with enough length",
        profiles: ["Developer"],
      }));
    });

    it("create con creator_id distinto del uid falla", async () => {
      const db = getAuthContext("user1", "test@live.uem.es").firestore();
      await assertFails(db.collection("projects").doc("proj1").set({
        creator_id: "user2",
        creatorName: "User",
        title: "Valid title",
        description: "Valid description with enough length",
        profiles: ["Developer"],
      }));
    });

    it("create SIN creatorName o con creatorName vacío falla", async () => {
      const db = getAuthContext("user1", "test@live.uem.es").firestore();
      
      await assertFails(db.collection("projects").doc("proj1").set({
        creator_id: "user1",
        title: "Valid title",
        description: "Valid description with enough length",
        profiles: ["Developer"],
      }));

      await assertFails(db.collection("projects").doc("proj2").set({
        creator_id: "user1",
        creatorName: "",
        title: "Valid title",
        description: "Valid description with enough length",
        profiles: ["Developer"],
      }));
    });

    it("create con title < 3 o > 100 chars falla", async () => {
      const db = getAuthContext("user1", "test@live.uem.es").firestore();
      
      await assertFails(db.collection("projects").doc("proj1").set({
        creator_id: "user1",
        creatorName: "User",
        title: "ab",
        description: "Valid description with enough length",
        profiles: ["Developer"],
      }));

      await assertFails(db.collection("projects").doc("proj2").set({
        creator_id: "user1",
        creatorName: "User",
        title: "a".repeat(101),
        description: "Valid description with enough length",
        profiles: ["Developer"],
      }));
    });

    it("create con description < 20 o > 1500 chars falla", async () => {
      const db = getAuthContext("user1", "test@live.uem.es").firestore();
      
      await assertFails(db.collection("projects").doc("proj1").set({
        creator_id: "user1",
        creatorName: "User",
        title: "Valid title",
        description: "Short",
        profiles: ["Developer"],
      }));

      await assertFails(db.collection("projects").doc("proj2").set({
        creator_id: "user1",
        creatorName: "User",
        title: "Valid title",
        description: "a".repeat(1501),
        profiles: ["Developer"],
      }));
    });

    it("create con profiles vacío o > 10 falla", async () => {
      const db = getAuthContext("user1", "test@live.uem.es").firestore();
      
      await assertFails(db.collection("projects").doc("proj1").set({
        creator_id: "user1",
        creatorName: "User",
        title: "Valid title",
        description: "Valid description with enough length",
        profiles: [],
      }));

      await assertFails(db.collection("projects").doc("proj2").set({
        creator_id: "user1",
        creatorName: "User",
        title: "Valid title",
        description: "Valid description with enough length",
        profiles: Array(11).fill("Dev"),
      }));
    });

    it("create válido succeed", async () => {
      const db = getAuthContext("user1", "test@live.uem.es").firestore();
      await assertSucceeds(db.collection("projects").doc("proj1").set({
        creator_id: "user1",
        creatorName: "User",
        title: "Valid title",
        description: "Valid description with enough length",
        category: "Startup Real",
        profiles: ["Developer"],
        createdAt: new Date(),
      }));
    });

    it("update/delete por no-creador falla; por el creador succeed", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("projects").doc("proj1").set({
          creator_id: "user1",
          creatorName: "User 1",
          title: "Valid title",
          description: "Valid description with enough length",
          profiles: ["Developer"],
        });
      });

      const user1Db = getAuthContext("user1", "test1@live.uem.es").firestore();
      const user2Db = getAuthContext("user2", "test2@live.uem.es").firestore();

      // Update por no creador
      await assertFails(user2Db.collection("projects").doc("proj1").update({ title: "Hack" }));
      // Delete por no creador
      await assertFails(user2Db.collection("projects").doc("proj1").delete());

      // Update por creador
      await assertSucceeds(user1Db.collection("projects").doc("proj1").update({ title: "New Valid Title" }));
      // Delete por creador
      await assertSucceeds(user1Db.collection("projects").doc("proj1").delete());
    });

    it("update intentando reasignar creator_id a otro usuario falla", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("projects").doc("proj1").set({
          creator_id: "user1",
          creatorName: "User 1",
          title: "Valid title",
          description: "Valid description with enough length",
          profiles: ["Developer"],
        });
      });

      const user1Db = getAuthContext("user1", "test1@live.uem.es").firestore();
      await assertFails(user1Db.collection("projects").doc("proj1").update({ creator_id: "user2" }));
    });

    it("bloquea poison-pill en profiles, categoría inválida y borrado de campos obligatorios en update (SEC-01)", async () => {
      const db = getAuthContext("user1", "user1@live.uem.es").firestore();
      const baseProject = {
        creator_id: "user1",
        creatorName: "User 1",
        title: "Valid title",
        description: "Valid description with enough length",
        category: "TFG",
        profiles: ["Developer"],
        createdAt: new Date(),
      };

      // Objetos, números, string vacío o >40 chars en profiles fallan
      await assertFails(db.collection("projects").doc("p1").set({ ...baseProject, profiles: [{ evil: true }] }));
      await assertFails(db.collection("projects").doc("p2").set({ ...baseProject, profiles: [999] }));
      await assertFails(db.collection("projects").doc("p3").set({ ...baseProject, profiles: [""] }));
      await assertFails(db.collection("projects").doc("p4").set({ ...baseProject, profiles: ["x".repeat(41)] }));

      // Categorías fuera del enum canónico o tipo objeto fallan
      await assertFails(db.collection("projects").doc("p5").set({ ...baseProject, category: "Categoría Falsa" }));
      await assertFails(db.collection("projects").doc("p6").set({ ...baseProject, category: { nested: 1 } }));

      // Crear proyecto válido y comprobar que en update NO se pueden borrar campos obligatorios
      await assertSucceeds(db.collection("projects").doc("projOk").set(baseProject));
      await assertFails(db.collection("projects").doc("projOk").set({ creator_id: "user1" }));
    });

    it("bloquea manipulación de ranking con createdAt futuro/pasado/ausente o mutación en update (SEC-04)", async () => {
      const db = getAuthContext("user1", "user1@live.uem.es").firestore();
      const base = {
        creator_id: "user1",
        creatorName: "User 1",
        title: "Valid title",
        description: "Valid description with enough length",
        profiles: ["Developer"],
      };

      // Sin createdAt, tipo string, fecha futura (2099) o pasada lejana (1970) fallan
      await assertFails(db.collection("projects").doc("pNoTs").set(base));
      await assertFails(db.collection("projects").doc("pStrTs").set({ ...base, createdAt: "2026-11-24" }));
      await assertFails(db.collection("projects").doc("pFuture").set({ ...base, createdAt: new Date(Date.now() + 3600 * 1000) }));
      await assertFails(db.collection("projects").doc("pPast").set({ ...base, createdAt: new Date(0) }));

      // Mutar createdAt en update falla
      const initialDate = new Date();
      await assertSucceeds(db.collection("projects").doc("pImmutable").set({ ...base, createdAt: initialDate }));
      await assertFails(db.collection("projects").doc("pImmutable").update({ createdAt: new Date(Date.now() + 60 * 1000) }));
    });
  });

  describe("Applications Collection", () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("projects").doc("proj1").set({
          creator_id: "creator1",
          creatorName: "Creator 1",
          title: "Valid title",
          description: "Valid description with enough length",
          profiles: ["Developer"],
        });
      });
    });

    it("create con applicantId != uid falla", async () => {
      const db = getAuthContext("user1", "test@live.uem.es").firestore();
      await assertFails(db.collection("applications").doc("proj1_user2").set({
        projectId: "proj1",
        applicantId: "user2",
        creatorId: "creator1",
        status: "pending",
        createdAt: new Date(),
      }));
      
      await assertSucceeds(db.collection("applications").doc("proj1_user1").set({
        projectId: "proj1",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
        createdAt: new Date(),
      }));
    });

    it("update por tercero ajeno falla", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("applications").doc("app1").set({
          projectId: "proj1",
          applicantId: "user1",
          creatorId: "creator1",
          status: "pending",
        });
      });

      const user3Db = getAuthContext("user3", "test3@live.uem.es").firestore();
      await assertFails(user3Db.collection("applications").doc("app1").update({ status: "accepted" }));

      const creatorDb = getAuthContext("creator1", "creator@live.uem.es").firestore();
      await assertSucceeds(creatorDb.collection("applications").doc("app1").update({ status: "accepted" }));
    });

    it("get de una application por un tercero ajeno falla", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection("applications").doc("app1").set({
          projectId: "proj1",
          applicantId: "user1",
          creatorId: "creator1",
          status: "pending",
        });
      });

      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const user3Db = getAuthContext("user3", "test3@live.uem.es").firestore();

      await assertFails(unauthedDb.collection("applications").doc("app1").get());
      await assertFails(user3Db.collection("applications").doc("app1").get());
    });

    it("get por applicant y por creator succeed", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection("applications").doc("app1").set({
          projectId: "proj1",
          applicantId: "user1",
          creatorId: "creator1",
          status: "pending",
        });
      });

      const applicantDb = getAuthContext("user1", "test1@live.uem.es").firestore();
      const creatorDb = getAuthContext("creator1", "creator@live.uem.es").firestore();

      await assertSucceeds(applicantDb.collection("applications").doc("app1").get());
      await assertSucceeds(creatorDb.collection("applications").doc("app1").get());
    });

    it("list sin filtro de participante falla", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection("applications").doc("app1").set({
          projectId: "proj1",
          applicantId: "user1",
          creatorId: "creator1",
          status: "pending",
        });
      });

      const applicantDb = getAuthContext("user1", "test1@live.uem.es").firestore();
      const user3Db = getAuthContext("user3", "test3@live.uem.es").firestore();

      // Query sin filtro de participante
      await assertFails(applicantDb.collection("applications").get());
      // Query solo por projectId sin especificar participante
      await assertFails(applicantDb.collection("applications").where("projectId", "==", "proj1").get());
      // Query de tercero ajeno sin filtro
      await assertFails(user3Db.collection("applications").get());
    });

    it("list filtrando por applicantId == uid o creatorId == uid solo devuelve las suyas", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection("applications").doc("app1").set({
          projectId: "proj1",
          applicantId: "user1",
          creatorId: "creator1",
          status: "pending",
        });
        await adminDb.collection("applications").doc("app2").set({
          projectId: "proj1",
          applicantId: "user2",
          creatorId: "creator1",
          status: "pending",
        });
      });

      const applicantDb = getAuthContext("user1", "test1@live.uem.es").firestore();
      const creatorDb = getAuthContext("creator1", "creator@live.uem.es").firestore();

      // List con filtro del propio applicantId succeed
      await assertSucceeds(applicantDb.collection("applications").where("applicantId", "==", "user1").get());

      // List intentando consultar postulaciones de otro usuario falla
      await assertFails(applicantDb.collection("applications").where("applicantId", "==", "user2").get());

      // List del creador por creatorId succeed
      await assertSucceeds(creatorDb.collection("applications").where("creatorId", "==", "creator1").get());
      await assertSucceeds(creatorDb.collection("applications").where("projectId", "==", "proj1").where("creatorId", "==", "creator1").get());
    });

    it("bloquea autopostulación, creación con status distinto de pending y autoaceptación por el postulante", async () => {
      const applicantDb = getAuthContext("user1", "user1@live.uem.es").firestore();
      const creatorDb = getAuthContext("creator1", "creator1@live.uem.es").firestore();

      // Autopostulación (el propio creador intenta postularse a su proyecto) falla
      await assertFails(creatorDb.collection("applications").doc("proj1_creator1").set({
        projectId: "proj1",
        applicantId: "creator1",
        creatorId: "creator1",
        status: "pending",
      }));

      // Crear con status ya aceptado falla
      await assertFails(applicantDb.collection("applications").doc("proj1_user1").set({
        projectId: "proj1",
        applicantId: "user1",
        creatorId: "creator1",
        status: "accepted",
      }));

      // Crear postulación válida
      await assertSucceeds(applicantDb.collection("applications").doc("proj1_user1").set({
        projectId: "proj1",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
        createdAt: new Date(),
      }));

      // Postulante intentando autoaceptarse falla
      await assertFails(applicantDb.collection("applications").doc("proj1_user1").update({ status: "accepted" }));
      // Postulante intentando tocar lastReadByCreator falla
      await assertFails(applicantDb.collection("applications").doc("proj1_user1").update({ lastReadByCreator: new Date() }));
      // Postulante actualizando sus metadatos de chat/lectura succeed
      await assertSucceeds(applicantDb.collection("applications").doc("proj1_user1").update({
        lastMessageAt: new Date(),
        lastMessageSenderId: "user1",
        lastReadByApplicant: new Date(),
      }));
      // Creador aceptando candidatura succeed
      await assertSucceeds(creatorDb.collection("applications").doc("proj1_user1").update({ status: "accepted" }));
      // Creador intentando alterar applicantId falla
      await assertFails(creatorDb.collection("applications").doc("proj1_user1").update({ applicantId: "user2" }));
    });

    it("valida existencia y propietario real del proyecto, ID determinista, unicidad y esquema cerrado (CF-01, CF-06, CF-08)", async () => {
      const applicantDb = getAuthContext("user1", "user1@live.uem.es").firestore();

      // 1. Proyecto inexistente falla
      await assertFails(applicantDb.collection("applications").doc("ghostProj_user1").set({
        projectId: "ghostProj",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
      }));

      // 2. creatorId falso (distinto al propietario real de proj1) falla
      await assertFails(applicantDb.collection("applications").doc("proj1_user1").set({
        projectId: "proj1",
        applicantId: "user1",
        creatorId: "fakeCreator",
        status: "pending",
      }));

      // 3. ID no determinista falla
      await assertFails(applicantDb.collection("applications").doc("randomId").set({
        projectId: "proj1",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
      }));

      // 4. Campo arbitrario no permitido en el esquema falla
      await assertFails(applicantDb.collection("applications").doc("proj1_user1").set({
        projectId: "proj1",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
        injectedAdminFlag: true,
      }));

      // 5. Postulación válida succeed y segundo set duplicado que intente alterar campos inmutables falla
      await assertSucceeds(applicantDb.collection("applications").doc("proj1_user1").set({
        projectId: "proj1",
        projectTitle: "Valid title",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
        createdAt: new Date(),
      }));

      await assertFails(applicantDb.collection("applications").doc("proj1_user1").set({
        projectId: "proj1",
        projectTitle: "Overwritten title",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
        createdAt: new Date(),
      }));
    });

    it("exige createdAt reciente en postulaciones y bloquea lastMessageAt cuando está rechazada permitiendo lectura (SEC-04, SEC-06)", async () => {
      const applicantDb = getAuthContext("user1", "user1@live.uem.es").firestore();
      const creatorDb = getAuthContext("creator1", "creator1@live.uem.es").firestore();

      // Sin createdAt o con fecha futura falla
      await assertFails(applicantDb.collection("applications").doc("proj1_user1").set({
        projectId: "proj1",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
      }));
      await assertFails(applicantDb.collection("applications").doc("proj1_user1").set({
        projectId: "proj1",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
        createdAt: new Date(Date.now() + 3600 * 1000),
      }));

      // Crear postulación válida y rechazarla por parte del creador
      await assertSucceeds(applicantDb.collection("applications").doc("proj1_user1").set({
        projectId: "proj1",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
        createdAt: new Date(),
      }));
      await assertSucceeds(creatorDb.collection("applications").doc("proj1_user1").update({ status: "rejected" }));

      // Con status rejected, el candidato puede limpiar su indicador de lectura pero NO actualizar lastMessageAt
      await assertSucceeds(applicantDb.collection("applications").doc("proj1_user1").update({ lastReadByApplicant: new Date() }));
      await assertFails(applicantDb.collection("applications").doc("proj1_user1").update({
        lastMessageAt: new Date(),
        lastMessageSenderId: "user1",
      }));
    });
  });

  describe("Messages Subcollection", () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("applications").doc("app1").set({
          projectId: "proj1",
          applicantId: "user1",
          creatorId: "creator1",
          status: "pending",
        });
      });
    });

    it("create por usuario ajeno a la aplicación falla", async () => {
      const user3Db = getAuthContext("user3", "test3@live.uem.es").firestore();
      await assertFails(user3Db.collection("applications").doc("app1").collection("messages").add({
        text: "Hello",
        senderId: "user3",
      }));
    });

    it("create por participant con text válido succeed", async () => {
      const user1Db = getAuthContext("user1", "test1@live.uem.es").firestore();
      await assertSucceeds(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "Hello creator",
        senderId: "user1",
        createdAt: new Date(),
      }));

      const creatorDb = getAuthContext("creator1", "creator@live.uem.es").firestore();
      await assertSucceeds(creatorDb.collection("applications").doc("app1").collection("messages").add({
        text: "Hello applicant",
        senderId: "creator1",
        createdAt: new Date(),
      }));
    });

    it("create con text vacío o > 1000 chars falla", async () => {
      const user1Db = getAuthContext("user1", "test1@live.uem.es").firestore();
      
      await assertFails(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "",
        senderId: "user1",
      }));

      await assertFails(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "a".repeat(1001),
        senderId: "user1",
      }));
    });

    it("bloquea suplantación de senderId en el chat", async () => {
      const user1Db = getAuthContext("user1", "test1@live.uem.es").firestore();
      const creatorDb = getAuthContext("creator1", "creator@live.uem.es").firestore();

      // Postulante intentando hacerse pasar por el creador falla
      await assertFails(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "Mensaje suplantado",
        senderId: "creator1",
      }));

      // Creador intentando hacerse pasar por el postulante falla
      await assertFails(creatorDb.collection("applications").doc("app1").collection("messages").add({
        text: "Mensaje suplantado",
        senderId: "user1",
      }));
    });

    it("permite envío atómico mediante writeBatch (mensaje + metadatos de aplicación) y rechaza campos extra (CF-06, CF-10)", async () => {
      const user1Db = getAuthContext("user1", "test1@live.uem.es").firestore();

      // Rechaza mensaje con campo extra no permitido
      await assertFails(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "Hola con campo extra",
        senderId: "user1",
        injectedHtml: "<script>",
      }));

      // Permite writeBatch atómico (crear mensaje + actualizar metadatos del chat en applications/app1)
      const batch = user1Db.batch();
      const appRef = user1Db.collection("applications").doc("app1");
      const msgRef = appRef.collection("messages").doc("msgBatch1");
      batch.set(msgRef, {
        text: "Mensaje atómico por batch",
        senderId: "user1",
        createdAt: new Date(),
      });
      batch.update(appRef, {
        lastMessageAt: new Date(),
        lastMessageSenderId: "user1",
        lastReadByApplicant: new Date(),
      });
      await assertSucceeds(batch.commit());
    });

    it("bloquea envío de nuevos mensajes sobre postulaciones rechazadas y exige createdAt reciente (SEC-04, SEC-06)", async () => {
      const user1Db = getAuthContext("user1", "test1@live.uem.es").firestore();
      const creatorDb = getAuthContext("creator1", "creator@live.uem.es").firestore();

      // Mensaje sin createdAt o con fecha futura falla
      await assertFails(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "Sin timestamp",
        senderId: "user1",
      }));
      await assertFails(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "Timestamp futuro",
        senderId: "user1",
        createdAt: new Date(Date.now() + 3600 * 1000),
      }));

      // Al rechazar la postulación, se bloquea la creación de mensajes nuevos
      await assertSucceeds(creatorDb.collection("applications").doc("app1").update({ status: "rejected" }));
      await assertFails(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "Insistencia tras rechazo",
        senderId: "user1",
        createdAt: new Date(),
      }));
    });
  });

  describe("usuarios no verificados", () => {
    it("no puede leer documentos de users", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user1").set({
          name: "User 1",
          email: "user1@live.uem.es",
        });
      });

      const unverifiedDb = getUnverifiedAuthContext("unverified1", "unverified@live.uem.es").firestore();
      await assertFails(unverifiedDb.collection("users").doc("user1").get());
    });

    it("no puede crear un proyecto", async () => {
      const unverifiedDb = getUnverifiedAuthContext("unverified1", "unverified@live.uem.es").firestore();
      await assertFails(unverifiedDb.collection("projects").doc("proj1").set({
        creator_id: "unverified1",
        creatorName: "User",
        title: "Valid title",
        description: "Valid description with enough length",
        profiles: ["Developer"],
      }));
    });

    it("no puede crear una postulación", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("projects").doc("proj1").set({
          creator_id: "creator1",
          creatorName: "Creator",
          title: "Valid title",
          description: "Valid description with enough length",
          profiles: ["Developer"],
        });
      });

      const unverifiedDb = getUnverifiedAuthContext("unverified1", "unverified@live.uem.es").firestore();
      await assertFails(unverifiedDb.collection("applications").doc("app1").set({
        projectId: "proj1",
        applicantId: "unverified1",
        creatorId: "creator1",
        status: "pending",
      }));
    });

    it("no puede leer mensajes de una postulación en la que participa", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection("applications").doc("app1").set({
          projectId: "proj1",
          applicantId: "unverified1",
          creatorId: "creator1",
          status: "pending",
        });
        await adminDb.collection("applications").doc("app1").collection("messages").doc("msg1").set({
          text: "Hola unverified",
          senderId: "creator1",
        });
      });

      const unverifiedDb = getUnverifiedAuthContext("unverified1", "unverified@live.uem.es").firestore();
      await assertFails(unverifiedDb.collection("applications").doc("app1").collection("messages").doc("msg1").get());
    });
  });

  describe("dominio institucional obligatorio en reglas", () => {
    it("bloquea dominios externos verificados (@gmail.com, spoofing) y permite @universidadeuropea.es", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user1").set({
          name: "User 1",
        });
      });

      const gmailDb = getAuthContext("ext1", "hacker@gmail.com").firestore();
      const spoofDb = getAuthContext("ext2", "fake@live.uem.es.evil.com").firestore();
      const subSpoofDb = getAuthContext("ext3", "fake@notlive.uem.es").firestore();
      const staffDb = getAuthContext("staff1", "profesor@universidadeuropea.es").firestore();

      await assertFails(gmailDb.collection("users").doc("user1").get());
      await assertFails(gmailDb.collection("projects").doc("proj1").set({
        creator_id: "ext1",
        creatorName: "External",
        title: "External project",
        description: "Valid description with enough length",
        profiles: ["Developer"],
      }));
      await assertFails(spoofDb.collection("users").doc("user1").get());
      await assertFails(subSpoofDb.collection("users").doc("user1").get());

      await assertSucceeds(staffDb.collection("users").doc("user1").get());
    });
  });

  describe("Client Errors Collection (Telemetría)", () => {
    it("permite crear reporte válido propio con TTL pero bloquea lectura, edición, borrado, suplantación y campos extra", async () => {
      const user1Db = getAuthContext("user1", "user1@live.uem.es").firestore();
      const validExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // 1. Crear reporte de error válido propio con expiresAt succeed
      await assertSucceeds(user1Db.collection("client_errors").doc("err1").set({
        uid: "user1",
        context: "project_create",
        message: "Failed to create project",
        code: "permission-denied",
        path: "/dashboard/nuevo",
        userAgent: "Mozilla/5.0",
        createdAt: new Date(),
        expiresAt: validExpiresAt,
      }));

      // 2. Suplantar uid de otro usuario falla
      await assertFails(user1Db.collection("client_errors").doc("err2").set({
        uid: "user2",
        context: "project_create",
        message: "Failed",
        code: "unknown",
        path: "/dashboard",
        userAgent: "Mozilla/5.0",
        createdAt: new Date(),
        expiresAt: validExpiresAt,
      }));

      // 3. Inyectar campo extra (ej. email) o superar límite de message falla
      await assertFails(user1Db.collection("client_errors").doc("err3").set({
        uid: "user1",
        email: "user1@live.uem.es",
        context: "project_create",
        message: "Failed",
        code: "unknown",
        path: "/dashboard",
        userAgent: "Mozilla/5.0",
        createdAt: new Date(),
        expiresAt: validExpiresAt,
      }));
      await assertFails(user1Db.collection("client_errors").doc("err4").set({
        uid: "user1",
        context: "project_create",
        message: "a".repeat(501),
        code: "unknown",
        path: "/dashboard",
        userAgent: "Mozilla/5.0",
        createdAt: new Date(),
        expiresAt: validExpiresAt,
      }));

      // 4. Ningún usuario puede leer, listar, actualizar ni borrar client_errors
      await assertFails(user1Db.collection("client_errors").doc("err1").get());
      await assertFails(user1Db.collection("client_errors").get());
      await assertFails(user1Db.collection("client_errors").doc("err1").update({ message: "Edited" }));
      await assertFails(user1Db.collection("client_errors").doc("err1").delete());
    });

    it("exige expiresAt futuro y <= 31 días para cumplir retención TTL RGPD (SEC-09)", async () => {
      const user1Db = getAuthContext("user1", "user1@live.uem.es").firestore();
      const baseErr = {
        uid: "user1",
        context: "project_create",
        message: "Failed",
        code: "unknown",
        path: "/dashboard",
        userAgent: "Mozilla/5.0",
        createdAt: new Date(),
      };

      // Sin expiresAt, expiresAt pasado o expiresAt > 31 días fallan
      await assertFails(user1Db.collection("client_errors").doc("eNoTtl").set(baseErr));
      await assertFails(user1Db.collection("client_errors").doc("ePastTtl").set({
        ...baseErr,
        expiresAt: new Date(Date.now() - 60 * 1000),
      }));
      await assertFails(user1Db.collection("client_errors").doc("eTooLongTtl").set({
        ...baseErr,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      }));
    });
  });

  describe("Smoke Test E2E Multicuentas (Flujo Completo Lanzamiento Día 11)", () => {
    it("ejecuta de extremo a extremo el ciclo de vida real con 4 cuentas (Creadora + Aceptada + Rechazada + No Verificada)", async () => {
      // Cuentas con alias '+' institucionales (@live.uem.es y @universidadeuropea.es) + 1 cuenta sin verificar
      const uidA = "smoke_creator_a";
      const uidB = "smoke_applicant_b";
      const uidC = "smoke_applicant_c";
      const uidD = "smoke_unverified_d";

      const dbA = getAuthContext(uidA, "marc.cubero+smokea@live.uem.es").firestore();
      const dbB = getAuthContext(uidB, "marc.cubero+smokeb@live.uem.es").firestore();
      const dbC = getAuthContext(uidC, "juan.socio+smokec@universidadeuropea.es").firestore();
      const dbD = getUnverifiedAuthContext(uidD, "marc.cubero+smoked@live.uem.es").firestore();

      // 1. Cuenta D (correo institucional pero email_verified == false) bloqueada en lectura y escritura
      await assertFails(dbD.collection("projects").get());
      await assertFails(
        dbD.collection("users").doc(uidD).set({
          name: "Usuario Sin Verificar",
          degree: "Grado en ADE",
          campus: "Valencia",
          updatedAt: new Date(),
        })
      );

      // 2. Creación de perfiles públicos sin exponer email (RGPD) y bloqueo de listado masivo
      await assertSucceeds(
        dbA.collection("users").doc(uidA).set({
          name: "Marc Smoke A",
          degree: "Grado en Ingeniería en Organización Industrial",
          campus: "Valencia",
          bio: "Fundador de prueba para el smoke test oficial del Día 11.",
          skills: ["Next.js", "Operaciones", "Producto"],
          updatedAt: new Date(),
        })
      );
      await assertSucceeds(
        dbB.collection("users").doc(uidB).set({
          name: "Lucía Smoke B",
          degree: "Grado en Diseño Digital",
          campus: "Alameda",
          bio: "Diseñadora UX/UI buscando equipo para startup universitaria.",
          skills: ["Figma", "UI/UX", "Branding"],
          updatedAt: new Date(),
        })
      );
      await assertSucceeds(
        dbC.collection("users").doc(uidC).set({
          name: "Carlos Smoke C",
          degree: "Grado en Marketing",
          campus: "Valencia",
          bio: "Especialista en crecimiento y captación en campus.",
          skills: ["Growth", "Social Media"],
          updatedAt: new Date(),
        })
      );
      await assertFails(dbB.collection("users").get()); // Prohibido listar colección completa
      await assertSucceeds(dbB.collection("users").doc(uidA).get()); // Permitido ver perfil público individual

      // 3. Cuenta A publica proyecto y lo edita; Cuenta B no puede editar ni borrar proyecto ajeno
      const projectId = "proj_lanzamiento_dia11";
      const createdAt = new Date();
      await assertSucceeds(
        dbA.collection("projects").doc(projectId).set({
          title: "Plataforma IA para apuntes colaborativos UEV",
          description: "Buscamos co-founders de diseño y negocio para lanzar el MVP antes de exámenes.",
          category: "Startup Real",
          profiles: ["Diseño UI/UX", "Marketing Digital"],
          creator_id: uidA,
          creatorName: "Marc Smoke A",
          createdAt,
        })
      );

      await assertFails(
        dbB.collection("projects").doc(projectId).update({
          title: "Intento de sabotaje por Cuenta B",
        })
      );
      await assertFails(dbB.collection("projects").doc(projectId).delete());

      await assertSucceeds(
        dbA.collection("projects").doc(projectId).update({
          title: "Plataforma IA para apuntes colaborativos UEV (V2)",
          description: "Buscamos co-founders de diseño y negocio para lanzar el MVP antes de exámenes en Valencia.",
          category: "Startup Real",
          profiles: ["Diseño UI/UX", "Marketing Digital", "Full Stack"],
        })
      );

      // 4. Postulaciones deterministas: A no puede autopostularse; B y C se postulan; B no puede duplicar
      const appIdA = `${projectId}_${uidA}`;
      const appIdB = `${projectId}_${uidB}`;
      const appIdC = `${projectId}_${uidC}`;

      await assertFails(
        dbA.collection("applications").doc(appIdA).set({
          projectId,
          projectTitle: "Plataforma IA para apuntes colaborativos UEV (V2)",
          applicantId: uidA,
          creatorId: uidA,
          status: "pending",
          createdAt: new Date(),
        })
      );

      await assertSucceeds(
        dbB.collection("applications").doc(appIdB).set({
          projectId,
          projectTitle: "Plataforma IA para apuntes colaborativos UEV (V2)",
          applicantId: uidB,
          creatorId: uidA,
          status: "pending",
          createdAt: new Date(),
        })
      );

      // Doble postulación bloqueada (update carece de permisos para sobreescribir status/createdAt)
      await assertFails(
        dbB.collection("applications").doc(appIdB).set({
          projectId,
          projectTitle: "Plataforma IA para apuntes colaborativos UEV (V2)",
          applicantId: uidB,
          creatorId: uidA,
          status: "pending",
          createdAt: new Date(),
        })
      );

      await assertSucceeds(
        dbC.collection("applications").doc(appIdC).set({
          projectId,
          projectTitle: "Plataforma IA para apuntes colaborativos UEV (V2)",
          applicantId: uidC,
          creatorId: uidA,
          status: "pending",
          createdAt: new Date(),
        })
      );

      // Privacidad cruzada: Cuenta C no puede leer la postulación ni mensajes de Cuenta B
      await assertFails(dbC.collection("applications").doc(appIdB).get());

      // 5. Chat atómico por writeBatch (B -> A) + acuse de lectura de A + respuesta (A -> B)
      const batchB1 = dbB.batch();
      const msgB1Ref = dbB.collection("applications").doc(appIdB).collection("messages").doc("msg_b1");
      batchB1.set(msgB1Ref, {
        text: "¡Hola Marc! Tengo el prototipo en Figma listo para enseñarte.",
        senderId: uidB,
        createdAt: new Date(),
      });
      batchB1.update(dbB.collection("applications").doc(appIdB), {
        lastMessageAt: new Date(),
        lastMessageSenderId: uidB,
        lastReadByApplicant: new Date(),
      });
      await assertSucceeds(batchB1.commit());

      // Cuenta C envía primer mensaje antes de ser evaluada
      const batchC1 = dbC.batch();
      batchC1.set(dbC.collection("applications").doc(appIdC).collection("messages").doc("msg_c1"), {
        text: "Hola, me gustaría unirme a la parte comercial.",
        senderId: uidC,
        createdAt: new Date(),
      });
      batchC1.update(dbC.collection("applications").doc(appIdC), {
        lastMessageAt: new Date(),
        lastMessageSenderId: uidC,
        lastReadByApplicant: new Date(),
      });
      await assertSucceeds(batchC1.commit());

      // Cuenta A abre el chat de B (marca leído) y responde
      await assertSucceeds(
        dbA.collection("applications").doc(appIdB).update({
          lastReadByCreator: new Date(),
        })
      );
      const batchA1 = dbA.batch();
      batchA1.set(dbA.collection("applications").doc(appIdB).collection("messages").doc("msg_a1"), {
        text: "¡Genial Lucía! Te acepto en el equipo ahora mismo.",
        senderId: uidA,
        createdAt: new Date(),
      });
      batchA1.update(dbA.collection("applications").doc(appIdB), {
        lastMessageAt: new Date(),
        lastMessageSenderId: uidA,
        lastReadByCreator: new Date(),
      });
      await assertSucceeds(batchA1.commit());

      // 6. Cuenta A acepta a B y rechaza a C
      await assertSucceeds(dbA.collection("applications").doc(appIdB).update({ status: "accepted" }));
      await assertSucceeds(dbA.collection("applications").doc(appIdC).update({ status: "rejected" }));

      // 7. Bloqueo de chat rechazado: ni C ni A pueden enviar nuevos mensajes en appIdC, pero A y B siguen chateando
      await assertFails(
        dbC.collection("applications").doc(appIdC).collection("messages").doc("msg_c2").set({
          text: "Insisto después de rechazado",
          senderId: uidC,
          createdAt: new Date(),
        })
      );
      await assertFails(
        dbC.collection("applications").doc(appIdC).update({
          lastMessageAt: new Date(),
          lastMessageSenderId: uidC,
        })
      );
      await assertFails(
        dbA.collection("applications").doc(appIdC).collection("messages").doc("msg_a_rejected").set({
          text: "Mensaje en hilo rechazado",
          senderId: uidA,
          createdAt: new Date(),
        })
      );

      // En cambio, el chat aceptado A <-> B sigue operativo
      const batchB2 = dbB.batch();
      batchB2.set(dbB.collection("applications").doc(appIdB).collection("messages").doc("msg_b2"), {
        text: "¡Perfecto! Nos vemos mañana en el campus Turia.",
        senderId: uidB,
        createdAt: new Date(),
      });
      batchB2.update(dbB.collection("applications").doc(appIdB), {
        lastMessageAt: new Date(),
        lastMessageSenderId: uidB,
        lastReadByApplicant: new Date(),
      });
      await assertSucceeds(batchB2.commit());

      // 8. Limpieza en cascada (borrado de cuenta candidata B + borrado de proyecto y cuenta A/C)
      await assertSucceeds(dbB.collection("applications").doc(appIdB).collection("messages").doc("msg_b1").delete());
      await assertSucceeds(dbB.collection("applications").doc(appIdB).collection("messages").doc("msg_a1").delete());
      await assertSucceeds(dbB.collection("applications").doc(appIdB).collection("messages").doc("msg_b2").delete());
      await assertSucceeds(dbB.collection("applications").doc(appIdB).delete());
      await assertSucceeds(dbB.collection("users").doc(uidB).delete());

      // Cuenta A borra su proyecto limpiando antes postulaciones/mensajes restantes (hijos -> padre)
      await assertSucceeds(dbA.collection("applications").doc(appIdC).collection("messages").doc("msg_c1").delete());
      await assertSucceeds(dbA.collection("applications").doc(appIdC).delete());
      await assertSucceeds(dbA.collection("projects").doc(projectId).delete());
      await assertSucceeds(dbA.collection("users").doc(uidA).delete());
      await assertSucceeds(dbC.collection("users").doc(uidC).delete());
    });

    it("bloquea crear postulaciones hacia proyectos demostrativos (creatorId demo-*)", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("projects").doc("demo_proj_1").set({
          title: "CampusBite — Pedidos sin colas en cafeterías UEV",
          description: "Proyecto demostrativo de referencia para ilustrar el formato esperado.",
          category: "Startup Real",
          profiles: ["Ingeniería Informática", "Diseño UI/UX"],
          creator_id: "demo-cofound-ue",
          creatorName: "Equipo CoFound UE",
          createdAt: new Date(),
        });
      });

      const dbStudent = getAuthContext("student1", "student1@live.uem.es").firestore();
      await assertSucceeds(dbStudent.collection("projects").doc("demo_proj_1").get());
      await assertFails(
        dbStudent.collection("applications").doc("demo_proj_1_student1").set({
          projectId: "demo_proj_1",
          projectTitle: "CampusBite — Pedidos sin colas en cafeterías UEV",
          applicantId: "student1",
          creatorId: "demo-cofound-ue",
          status: "pending",
          createdAt: new Date(),
        })
      );
    });
  });
});
