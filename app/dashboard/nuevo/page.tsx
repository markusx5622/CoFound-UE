"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { X, Plus, LayoutTemplate, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryLabel, CANONICAL_CATEGORIES } from "@/lib/categories";
import { reportClientError } from "@/lib/error-logger";

const SUGGESTED_PROFILES = [
  "Desarrollo Web",
  "Diseño UI/UX",
  "Marketing Digital",
  "ADE / Finanzas",
  "Org. Industrial (IOI)",
  "Datos / IA",
  "Desarrollo Móvil",
  "Comunicación / Vídeo",
];

export default function NuevoProyecto() {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Reto Académico");
  const [profileInput, setProfileInput] = useState("");
  const [profiles, setProfiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleAddProfile = (valueOverride?: string) => {
    const trimmed = (typeof valueOverride === "string" ? valueOverride : profileInput).trim();
    if (trimmed !== "" && !profiles.includes(trimmed)) {
      if (profiles.length >= 10) {
        toast.error(t("projectNew.maxProfilesError"));
        return;
      }
      setProfiles([...profiles, trimmed]);
      if (typeof valueOverride !== "string") {
        setProfileInput("");
      }
    }
  };

  const handleInsertTemplate = () => {
    if (description.trim().length > 0) {
      toast.info(t("projectNew.templateAlreadyHasText"));
      return;
    }
    setDescription(t("projectNew.templateText"));
  };

  const handleRemoveProfile = (profileToRemove: string) => {
    setProfiles(profiles.filter((p) => p !== profileToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProfile();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || profiles.length === 0) {
      toast.error(t("projectNew.allFieldsRequiredError"));
      return;
    }

    if (title.trim().length < 3) {
      toast.error(t("projectNew.titleMinLengthError"));
      return;
    }

    if (description.trim().length < 20) {
      toast.error(t("projectNew.descMinLengthError"));
      return;
    }

    setLoading(true);
    try {
      if (!user) throw new Error("No user logged in");

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : null;
      const creatorName = userData?.name?.trim();

      if (!creatorName) {
        toast.error(t("projectNew.completeProfileError"));
        setLoading(false);
        router.push("/perfil");
        return;
      }

      await addDoc(collection(db, "projects"), {
        title: title.trim(),
        description: description.trim(),
        category,
        profiles,
        creator_id: user.uid,
        creatorName,
        createdAt: serverTimestamp()
      });

      toast.success(t("projectNew.successToast"));
      router.push("/dashboard");
    } catch (error) {
      reportClientError("project_create", error);
      toast.error(t("projectNew.errorToast"));
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-8 sm:py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">{t("projectNew.title")}</h1>
          
          <div className="bg-zinc-900/60 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-zinc-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("projectNew.titleLabel")}</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600"
                  placeholder={t("projectNew.titlePlaceholder")}
                />
                <div className="text-right text-xs text-zinc-500 mt-1">{title.length}/100</div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="block text-sm font-semibold text-zinc-300">{t("projectNew.descLabel")}</label>
                  <button
                    type="button"
                    onClick={handleInsertTemplate}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 px-3 py-1 rounded-lg transition-colors"
                  >
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    <span>{t("projectNew.useTemplateBtn")}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={7}
                  maxLength={1500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all resize-y placeholder:text-zinc-600"
                  placeholder={t("projectNew.descPlaceholder")}
                />
                <div className="text-right text-xs text-zinc-500 mt-1">{description.length}/1500</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("projectNew.categoryLabel")}</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 pr-10 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none appearance-none transition-all cursor-pointer"
                  >
                    {CANONICAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryLabel(cat, t)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("projectNew.profilesLabel")}</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    maxLength={40}
                    value={profileInput}
                    onChange={(e) => setProfileInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 px-3.5 sm:px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600 text-sm sm:text-base"
                    placeholder={t("projectNew.profilePlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddProfile()}
                    className="shrink-0 px-3.5 sm:px-4 py-3 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.97] border border-zinc-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base touch-manipulation"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>{t("projectNew.addBtn")}</span>
                  </button>
                </div>

                {/* Sugerencias rápidas de perfiles */}
                {profiles.length < 10 && (
                  <div className="mb-3">
                    <p className="text-xs text-zinc-500 mb-2">{t("projectNew.suggestedProfilesLabel")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_PROFILES.filter((item) => !profiles.includes(item)).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleAddProfile(suggestion)}
                          className="text-xs text-zinc-300 hover:text-white active:scale-[0.96] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 px-2.5 py-1.5 rounded-lg transition-all inline-flex items-center gap-1 touch-manipulation"
                        >
                          <Plus className="h-3 w-3 text-[#E60000]" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {profiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                    {profiles.map((profile) => (
                      <motion.span
                        key={profile}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.16 }}
                        className="flex items-center gap-1.5 bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-900/30 text-sm font-medium shadow-sm text-[#E60000]"
                      >
                        {profile}
                        <button
                          type="button"
                          onClick={() => handleRemoveProfile(profile)}
                          className="text-red-400 hover:text-red-300 transition-colors p-0.5 touch-manipulation"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-800/50">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E60000] text-white hover:bg-red-700 active:scale-[0.98] font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(230,0,0,0.3)] hover:shadow-[0_0_25px_rgba(230,0,0,0.5)] disabled:opacity-70 touch-manipulation"
                >
                  {loading ? t("projectNew.publishing") : t("projectNew.publishBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
