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
    return testEnv.authenticatedContext(uid, { email });
  };

  describe("Users Collection", () => {
    it("lectura requiere auth", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(unauthedDb.collection("users").doc("user1").get());
      
      const authedDb = getAuthContext("user1", "test@test.com").firestore();
      await assertSucceeds(authedDb.collection("users").doc("user1").get());
    });

    it("escritura solo del propio uid", async () => {
      const db = getAuthContext("user1", "test@test.com").firestore();
      
      // Escritura propia
      await assertSucceeds(db.collection("users").doc("user1").set({ name: "User 1" }));
      // Escritura en doc ajeno
      await assertFails(db.collection("users").doc("user2").set({ name: "User 2" }));
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
      const db = getAuthContext("user1", "test@test.com").firestore();
      await assertFails(db.collection("projects").doc("proj1").set({
        creator_id: "user2",
        creatorName: "User",
        title: "Valid title",
        description: "Valid description with enough length",
        profiles: ["Developer"],
      }));
    });

    it("create SIN creatorName o con creatorName vacío falla", async () => {
      const db = getAuthContext("user1", "test@test.com").firestore();
      
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
      const db = getAuthContext("user1", "test@test.com").firestore();
      
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
      const db = getAuthContext("user1", "test@test.com").firestore();
      
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
      const db = getAuthContext("user1", "test@test.com").firestore();
      
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
      const db = getAuthContext("user1", "test@test.com").firestore();
      await assertSucceeds(db.collection("projects").doc("proj1").set({
        creator_id: "user1",
        creatorName: "User",
        title: "Valid title",
        description: "Valid description with enough length",
        profiles: ["Developer"],
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

      const user1Db = getAuthContext("user1", "test1@test.com").firestore();
      const user2Db = getAuthContext("user2", "test2@test.com").firestore();

      // Update por no creador
      await assertFails(user2Db.collection("projects").doc("proj1").update({ title: "Hack" }));
      // Delete por no creador
      await assertFails(user2Db.collection("projects").doc("proj1").delete());

      // Update por creador
      await assertSucceeds(user1Db.collection("projects").doc("proj1").update({ title: "New Valid Title" }));
      // Delete por creador
      await assertSucceeds(user1Db.collection("projects").doc("proj1").delete());
    });
  });

  describe("Applications Collection", () => {
    it("create con applicantId != uid falla", async () => {
      const db = getAuthContext("user1", "test@test.com").firestore();
      await assertFails(db.collection("applications").doc("app1").set({
        projectId: "proj1",
        applicantId: "user2",
        creatorId: "creator1",
        status: "pending",
      }));
      
      await assertSucceeds(db.collection("applications").doc("app2").set({
        projectId: "proj1",
        applicantId: "user1",
        creatorId: "creator1",
        status: "pending",
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

      const user3Db = getAuthContext("user3", "test3@test.com").firestore();
      await assertFails(user3Db.collection("applications").doc("app1").update({ status: "accepted" }));

      const creatorDb = getAuthContext("creator1", "creator@test.com").firestore();
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
      const user3Db = getAuthContext("user3", "test3@test.com").firestore();

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

      const applicantDb = getAuthContext("user1", "test1@test.com").firestore();
      const creatorDb = getAuthContext("creator1", "creator@test.com").firestore();

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

      const applicantDb = getAuthContext("user1", "test1@test.com").firestore();
      const user3Db = getAuthContext("user3", "test3@test.com").firestore();

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

      const applicantDb = getAuthContext("user1", "test1@test.com").firestore();
      const creatorDb = getAuthContext("creator1", "creator@test.com").firestore();

      // List con filtro del propio applicantId succeed
      await assertSucceeds(applicantDb.collection("applications").where("applicantId", "==", "user1").get());

      // List intentando consultar postulaciones de otro usuario falla
      await assertFails(applicantDb.collection("applications").where("applicantId", "==", "user2").get());

      // List del creador por creatorId succeed
      await assertSucceeds(creatorDb.collection("applications").where("creatorId", "==", "creator1").get());
      await assertSucceeds(creatorDb.collection("applications").where("projectId", "==", "proj1").where("creatorId", "==", "creator1").get());
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
      const user3Db = getAuthContext("user3", "test3@test.com").firestore();
      await assertFails(user3Db.collection("applications").doc("app1").collection("messages").add({
        text: "Hello",
        senderId: "user3",
      }));
    });

    it("create por participant con text válido succeed", async () => {
      const user1Db = getAuthContext("user1", "test1@test.com").firestore();
      await assertSucceeds(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "Hello creator",
        senderId: "user1",
      }));

      const creatorDb = getAuthContext("creator1", "creator@test.com").firestore();
      await assertSucceeds(creatorDb.collection("applications").doc("app1").collection("messages").add({
        text: "Hello applicant",
        senderId: "creator1",
      }));
    });

    it("create con text vacío o > 1000 chars falla", async () => {
      const user1Db = getAuthContext("user1", "test1@test.com").firestore();
      
      await assertFails(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "",
        senderId: "user1",
      }));

      await assertFails(user1Db.collection("applications").doc("app1").collection("messages").add({
        text: "a".repeat(1001),
        senderId: "user1",
      }));
    });
  });
});
