"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { db } from "@/lib/firebase";
import { X, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import InitialsAvatar from "@/components/InitialsAvatar";
import { useLanguage } from "@/context/LanguageContext";

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
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;
      
      try {
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || "");
            setDegree(data.degree || "");
            let initialCampus = data.campus || "Valencia";
            if (initialCampus === "Campus Turia / Valencia" || initialCampus === "Campus Turia (Valencia)") initialCampus = "Valencia";
            if (initialCampus === "Campus Alameda / Valencia") initialCampus = "Alameda";
            if (initialCampus !== "Alameda" && initialCampus !== "Valencia") {
              initialCampus = "Valencia";
            }
            setCampus(initialCampus);
            setBio(data.bio || "");
            setSkills(data.skills || []);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setFetching(false);
      }
    };
    
    fetchProfile();
  }, [user, authLoading]);

  const handleAddSkill = () => {
    if (skillInput.trim() !== "" && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
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
        name,
        degree,
        campus,
        bio,
        skills,
        updatedAt: new Date()
      }, { merge: true });

      toast.success(t("profile.saveSuccess"));
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(t("profile.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      // 1. Delete user's applications
      const qApps = query(collection(db, "applications"), where("applicantId", "==", user.uid));
      const appsSnap = await getDocs(qApps);
      const appsPromises = appsSnap.docs.map(async (d) => {
        const msgsSnap = await getDocs(collection(db, "applications", d.id, "messages"));
        await Promise.all(msgsSnap.docs.map(m => deleteDoc(m.ref)));
        await deleteDoc(d.ref);
      });
      await Promise.all(appsPromises);

      // 2. Delete user's projects and applications to those projects
      const qProjects = query(collection(db, "projects"), where("creator_id", "==", user.uid));
      const projSnap = await getDocs(qProjects);
      
      const projPromises = projSnap.docs.map(async (projectDoc) => {
        // Delete applications to this project
        const qProjApps = query(collection(db, "applications"), where("projectId", "==", projectDoc.id));
        const projAppsSnap = await getDocs(qProjApps);
        const projAppsPromises = projAppsSnap.docs.map(async (d) => {
          const msgsSnap = await getDocs(collection(db, "applications", d.id, "messages"));
          await Promise.all(msgsSnap.docs.map(m => deleteDoc(m.ref)));
          await deleteDoc(d.ref);
        });
        await Promise.all(projAppsPromises);
        
        // Delete project itself
        await deleteDoc(projectDoc.ref);
      });
      await Promise.all(projPromises);

      // 3. Delete user document
      await deleteDoc(doc(db, "users", user.uid));

      // 4. Delete Auth user
      await deleteUser(user);

      toast.success(t("profile.deleteAccountSuccess"));
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error(t("profile.deleteAccountRequiresLogin"));
      } else {
        toast.error(t("profile.deleteAccountError"));
      }
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">{t("profile.title")}</h1>
          
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
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all resize-none placeholder:text-zinc-600"
                  placeholder={t("profile.bioPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("profile.skills")}</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 px-3.5 sm:px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600 text-sm sm:text-base"
                    placeholder={t("profile.skillsPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="shrink-0 px-3.5 sm:px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>{t("profile.addSkill")}</span>
                  </button>
                </div>
                
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

            <div className="mt-8 pt-8 border-t border-zinc-800/50">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-transparent border border-red-900/50 text-red-500 hover:bg-red-950/30 hover:border-red-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
              >
                {t("profile.deleteAccountBtn")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-red-900/50 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(230,0,0,0.15)] relative">
            <h2 className="text-xl font-bold text-white mb-2">{t("profile.deleteAccountTitle")}</h2>
            <p className="text-zinc-400 text-sm mb-8">{t("profile.deleteAccountWarning")}</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingAccount}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {t("profile.deleteAccountCancel")}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 bg-[#E60000] hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeletingAccount ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  t("profile.deleteAccountConfirm")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
