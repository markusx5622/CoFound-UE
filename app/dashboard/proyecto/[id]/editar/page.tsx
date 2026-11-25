"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { X, Plus, ArrowLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryLabel, CANONICAL_CATEGORIES } from "@/lib/categories";
import { reportClientError } from "@/lib/error-logger";

export default function EditarProyecto() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Reto Académico");
  const [profileInput, setProfileInput] = useState("");
  const [profiles, setProfiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (authLoading) return;
      try {
        if (!user || !id || typeof id !== "string") return;

        const projectDocRef = doc(db, "projects", id);
        const projectDoc = await getDoc(projectDocRef);

        if (projectDoc.exists()) {
          const data = projectDoc.data();
          if (data.creator_id !== user.uid) {
            toast.error(t("projectEdit.noPermissionError"));
            router.push("/dashboard");
            return;
          }
          
          setTitle(data.title || "");
          setDescription(data.description || "");
          setCategory(data.category || "Reto Académico");
          setProfiles(data.profiles || []);
        } else {
          toast.error(t("projectEdit.notFoundError"));
          router.push("/dashboard");
        }
      } catch (error) {
        reportClientError("project_edit_fetch", error);
        toast.error(t("projectEdit.loadError"));
      } finally {
        setFetching(false);
      }
    };

    fetchProject();
  }, [id, user, authLoading, router, t]);

  const handleAddProfile = () => {
    const trimmed = profileInput.trim();
    if (trimmed !== "" && !profiles.includes(trimmed)) {
      if (profiles.length >= 10) {
        toast.error(t("projectNew.maxProfilesError"));
        return;
      }
      setProfiles([...profiles, trimmed]);
      setProfileInput("");
    }
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
      toast.error(t("projectEdit.allFieldsError"));
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
      if (!user || !id || typeof id !== "string") throw new Error("Missing user or id");

      const projectDocRef = doc(db, "projects", id);
      await updateDoc(projectDocRef, {
        title: title.trim(),
        description: description.trim(),
        category,
        profiles
      });

      toast.success(t("projectEdit.updateSuccess"));
      router.push(`/dashboard/proyecto/${id}`);
    } catch (error) {
      reportClientError("project_edit_update", error);
      toast.error(t("projectEdit.updateError"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ProtectedRoute>
        <div className="flex-grow flex items-center justify-center bg-transparent min-h-[70dvh] relative z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-zinc-800 border-t-[#E60000]"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-8 sm:py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard/mis-proyectos" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            {t("projectEdit.backToMyProjects")}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">{t("projectEdit.title")}</h1>
          
          <div className="bg-zinc-900/60 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-zinc-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("projectEdit.titleLabel")}</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600"
                  placeholder={t("projectEdit.titlePlaceholder")}
                />
                <div className="text-right text-xs text-zinc-500 mt-1">{title.length}/100</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("projectEdit.descLabel")}</label>
                <textarea
                  required
                  rows={5}
                  maxLength={1500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all resize-none placeholder:text-zinc-600"
                  placeholder={t("projectEdit.descPlaceholder")}
                />
                <div className="text-right text-xs text-zinc-500 mt-1">{description.length}/1500</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("projectEdit.categoryLabel")}</label>
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
                <label className="block text-sm font-semibold text-zinc-300 mb-2">{t("projectEdit.profilesLabel")}</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    maxLength={40}
                    value={profileInput}
                    onChange={(e) => setProfileInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 px-3.5 sm:px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600 text-sm sm:text-base"
                    placeholder={t("projectEdit.profilePlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={handleAddProfile}
                    className="shrink-0 px-3.5 sm:px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>{t("projectEdit.addBtn")}</span>
                  </button>
                </div>
                
                {profiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                    {profiles.map((profile, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-900/30 text-sm font-medium shadow-sm text-[#E60000]">
                        {profile}
                        <button
                          type="button"
                          onClick={() => handleRemoveProfile(profile)}
                          className="text-red-400 hover:text-red-300 transition-colors"
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
                  className="w-full bg-[#E60000] text-white hover:bg-red-700 active:scale-[0.98] font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(230,0,0,0.3)] hover:shadow-[0_0_25px_rgba(230,0,0,0.5)] disabled:opacity-70 touch-manipulation"
                >
                  {loading ? t("projectEdit.updating") : t("projectEdit.saveBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
