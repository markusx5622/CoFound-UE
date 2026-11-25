"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, deleteField, serverTimestamp } from "firebase/firestore";
import { deleteUser, signOut, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { X, Plus, Save, LogOut, Lock, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import InitialsAvatar from "@/components/InitialsAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { reportClientError } from "@/lib/error-logger";
import { sanitizeString, sanitizeStringArray } from "@/lib/firestore-guards";

const SUGGESTED_SKILLS = [
  "Desarrollo Web",
  "Python",
  "Figma / UI",
  "Marketing Digital",
  "Finanzas / ADE",
  "Excel",
  "Gestión de Proyectos",
  "Diseño Gráfico",
  "Ventas / Pitch",
  "Datos / IA",
];

export default function MiPerfil() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [campus, setCampus] = useState("Valencia");
  const [bio, setBio] = useState("");
  
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { user, loading: authLoading } = useAuth();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;
      
      try {
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as Record<string, unknown>;
            setName(sanitizeString(data.name));
            setDegree(sanitizeString(data.degree));
            let initialCampus = sanitizeString(data.campus, "Valencia");
            if (initialCampus === "Campus Turia / Valencia" || initialCampus === "Campus Turia (Valencia)") initialCampus = "Valencia";
            if (initialCampus === "Campus Alameda / Valencia") initialCampus = "Alameda";
            if (initialCampus !== "Alameda" && initialCampus !== "Valencia") {
              initialCampus = "Valencia";
            }
            setCampus(initialCampus);
            setBio(sanitizeString(data.bio));
            setSkills(sanitizeStringArray(data.skills, 20));
          }
        }
      } catch (error) {
        reportClientError("profile_fetch", error);
      } finally {
        setFetching(false);
      }
    };
    
    fetchProfile();
  }, [user, authLoading]);

  const handleAddSkill = (valueOverride?: string) => {
    const trimmed = (typeof valueOverride === "string" ? valueOverride : skillInput).trim();
    if (trimmed !== "" && !skills.includes(trimmed)) {
      if (skills.length >= 20) return;
      setSkills([...skills, trimmed]);
      if (typeof valueOverride !== "string") {
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user) throw new Error("No user logged in");

      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        degree: degree.trim(),
        campus,
        bio: bio.trim(),
        skills,
        email: deleteField(),
        photoURL: deleteField(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast.success(t("profile.saveSuccess"));
    } catch (error) {
      reportClientError("profile_save", error);
      toast.error(t("profile.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !user.email) return;
    if (!deletePassword) {
      toast.error(t("profile.deleteAccountPasswordRequired"));
      return;
    }

    setIsDeletingAccount(true);
    try {
      // 0. Reautenticar primero con contraseña antes de tocar ningún documento de Firestore (SEC-02)
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);

      // 1. Eliminar postulaciones y mensajes del usuario como candidato
      const qApps = query(collection(db, "applications"), where("applicantId", "==", user.uid));
      const appsSnap = await getDocs(qApps);
      const appsPromises = appsSnap.docs.map(async (d) => {
        const msgsSnap = await getDocs(collection(db, "applications", d.id, "messages"));
        await Promise.all(msgsSnap.docs.map(m => deleteDoc(m.ref)));
        await deleteDoc(d.ref);
      });
      await Promise.all(appsPromises);

      // 2. Eliminar proyectos propios y sus postulaciones/mensajes (hijos -> padre)
      const qProjects = query(collection(db, "projects"), where("creator_id", "==", user.uid));
      const projSnap = await getDocs(qProjects);
      
      const projPromises = projSnap.docs.map(async (projectDoc) => {
        const qProjApps = query(
          collection(db, "applications"),
          where("projectId", "==", projectDoc.id),
          where("creatorId", "==", user.uid)
        );
        const projAppsSnap = await getDocs(qProjApps);
        const projAppsPromises = projAppsSnap.docs.map(async (d) => {
          const msgsSnap = await getDocs(collection(db, "applications", d.id, "messages"));
          await Promise.all(msgsSnap.docs.map(m => deleteDoc(m.ref)));
          await deleteDoc(d.ref);
        });
        await Promise.all(projAppsPromises);
        
        await deleteDoc(projectDoc.ref);
      });
      await Promise.all(projPromises);

      // 3. Eliminar perfil público
      await deleteDoc(doc(db, "users", user.uid));

      // 4. Eliminar usuario en Firebase Auth (con sesión recién reautenticada)
      await deleteUser(user);

      setDeletePassword("");
      setShowDeleteModal(false);
      toast.success(t("profile.deleteAccountSuccess"));
    } catch (error: unknown) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        toast.error(t("profile.deleteAccountWrongPassword"));
      } else if (code === "auth/too-many-requests") {
        toast.error(t("auth.errors.tooManyRequests"));
      } else if (code === "auth/requires-recent-login") {
        toast.error(t("profile.deleteAccountRequiresLogin"));
      } else {
        reportClientError("profile_delete_account", error);
        toast.error(t("profile.deleteAccountError"));
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error signing out:", error);
      }
      toast.error(t("protectedRoute.toastErrorSignOut") || "Error al cerrar sesión");
      setIsLoggingOut(false);
    }
  };

  if (fetching) {
    return (
      <ProtectedRoute>
        <div className="flex-grow flex items-center justify-center bg-transparent min-h-screen relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-8 sm:py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("profile.title")}</h1>
            {user && (
              <Link
                href={`/perfil/${user.uid}`}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2 rounded-xl transition-all"
              >
                <span>{t("profile.viewPublicProfile")}</span>
                <ExternalLink className="h-4 w-4 text-[#E60000]" />
              </Link>
            )}
          </div>
          
          <div className="bg-zinc-900/60 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-zinc-800">
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="flex flex-col items-center mb-8">
                <InitialsAvatar name={name} size={112} className="w-28 h-28 text-3xl font-bold border-2" />
                <p className="text-xs text-zinc-500 mt-2">{t("profile.avatarPreview")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("profile.fullName")}</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600"
                    placeholder={t("profile.fullNamePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("profile.degree")}</label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600"
                    placeholder={t("profile.degreePlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("profile.campus")}</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all"
                >
                  <option value="Valencia">Campus Turia / Valencia</option>
                  <option value="Alameda">Campus Alameda / Valencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("profile.bio")}</label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all resize-none placeholder:text-zinc-600"
                  placeholder={t("profile.bioPlaceholder")}
                />
                <div className="text-right text-xs text-zinc-500 mt-1">{bio.length}/1000</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("profile.skills")}</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    maxLength={40}
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 px-3.5 sm:px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600 text-sm sm:text-base"
                    placeholder={t("profile.skillsPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="shrink-0 px-3.5 sm:px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>{t("profile.addSkill")}</span>
                  </button>
                </div>

                {/* Sugerencias rápidas de habilidades */}
                {skills.length < 20 && (
                  <div className="mb-3">
                    <p className="text-xs text-zinc-500 mb-2">{t("profile.suggestedSkillsLabel")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_SKILLS.filter((item) => !skills.includes(item)).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleAddSkill(suggestion)}
                          className="text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3 text-[#E60000]" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 bg-zinc-800 text-white px-3 py-1.5 rounded-lg border border-zinc-700 text-sm font-medium shadow-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-zinc-400 hover:text-white transition-colors ml-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-800/50">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E60000] text-white hover:bg-red-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(230,0,0,0.3)] hover:shadow-[0_0_25px_rgba(230,0,0,0.5)] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {loading ? t("profile.saving") : t("profile.saveBtn")}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-zinc-800/50 space-y-3">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full bg-red-950/40 border border-red-900/60 text-red-400 hover:text-white hover:bg-[#E60000] hover:border-red-600 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 group select-none disabled:opacity-50"
              >
                <LogOut className="h-5 w-5 text-red-400 group-hover:text-white transition-colors" />
                <span>{isLoggingOut ? t("landing.auth.processing") : t("profile.logoutBtn")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeletePassword("");
                  setShowDeletePassword(false);
                  setShowDeleteModal(true);
                }}
                className="w-full bg-transparent border border-red-900/30 text-red-500/80 hover:text-red-400 hover:bg-red-950/20 hover:border-red-800 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                {t("profile.deleteAccountBtn")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleDeleteAccount} className="bg-zinc-900 border border-red-900/50 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(230,0,0,0.15)] relative">
            <h2 className="text-xl font-bold text-white mb-2">{t("profile.deleteAccountTitle")}</h2>
            <p className="text-zinc-400 text-sm mb-6">{t("profile.deleteAccountWarning")}</p>

            <div className="mb-6">
              <label htmlFor="delete-account-password" className="block text-xs font-semibold text-zinc-300 mb-2">
                {t("profile.deleteAccountPasswordLabel")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="delete-account-password"
                  type={showDeletePassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={isDeletingAccount}
                  placeholder={t("profile.deleteAccountPasswordPlaceholder")}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword((prev) => !prev)}
                  disabled={isDeletingAccount}
                  aria-label={showDeletePassword ? t("profile.hidePassword") : t("profile.showPassword")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeletePassword("");
                  setShowDeletePassword(false);
                  setShowDeleteModal(false);
                }}
                disabled={isDeletingAccount}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {t("profile.deleteAccountCancel")}
              </button>
              <button
                type="submit"
                disabled={isDeletingAccount || !deletePassword}
                className="flex-1 bg-[#E60000] hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeletingAccount ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  t("profile.deleteAccountConfirm")
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </ProtectedRoute>
  );
}
