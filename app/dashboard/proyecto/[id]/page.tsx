"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, serverTimestamp, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, Tag, ArrowLeft, Send, BookOpen, Info, ArrowRight, Share2, Clock, Edit, MessageSquare, CheckCircle2, Languages, ExternalLink } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryLabel } from "@/lib/categories";
import { reportClientError } from "@/lib/error-logger";
import { sanitizeString, sanitizeStringArray } from "@/lib/firestore-guards";
import { isDemoId, cleanProjectTitle } from "@/lib/demo";
import { localizeDemoProject, localizeDemoProfile, buildExternalTranslateUrl } from "@/lib/demo-i18n";
import { formatRelativeDate } from "@/lib/date-utils";
import ApplyProjectModal from "@/components/ApplyProjectModal";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  profiles: string[];
  creator_id: string;
  creatorName?: string;
  createdAt?: unknown;
}

interface UserProfile {
  name: string;
  degree: string;
  campus: string;
}

export default function ProyectoDetalle() {
  const { id } = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  
  const [project, setProject] = useState<Project | null>(null);
  const [creator, setCreator] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchProjectAndCreator = async () => {
      if (authLoading) return;
      try {
        if (!id || typeof id !== "string") return;
        
        // Fetch project
        const projectDocRef = doc(db, "projects", id);
        const projectDoc = await getDoc(projectDocRef);
        
        if (projectDoc.exists()) {
          const raw = projectDoc.data() as Record<string, unknown>;
          const creatorName = sanitizeString(raw.creatorName);
          const projectData: Project = {
            id: projectDoc.id,
            title: sanitizeString(raw.title),
            description: sanitizeString(raw.description),
            category: sanitizeString(raw.category),
            profiles: sanitizeStringArray(raw.profiles, 10),
            creator_id: sanitizeString(raw.creator_id),
            ...(creatorName ? { creatorName } : {}),
            createdAt: raw.createdAt,
          };
          setProject(projectData);
          
          // Fetch creator
          if (projectData.creator_id) {
            const creatorDocRef = doc(db, "users", projectData.creator_id);
            const creatorDoc = await getDoc(creatorDocRef);
            if (creatorDoc.exists()) {
              const cRaw = creatorDoc.data() as Record<string, unknown>;
              setCreator({
                name: sanitizeString(cRaw.name),
                degree: sanitizeString(cRaw.degree),
                campus: sanitizeString(cRaw.campus),
              });
            }
          }

          // Check if already applied
          if (user) {
            const q = query(
              collection(db, "applications"),
              where("projectId", "==", id),
              where("applicantId", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              setHasApplied(true);
            }
          }
        }
      } catch (error) {
        reportClientError("project_detail_fetch", error);
        toast.error(t("projectDetail.loadErrorToast"));
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndCreator();
  }, [id, user, authLoading, t]);

  const handleOpenApplyModal = async () => {
    if (!user) {
      toast.error(t("projectDetail.mustLoginToast"));
      return;
    }
    if (!project) return;
    if (isDemoId(project.creator_id)) {
      toast.error(t("projectDetail.cannotApplyDemoToast"));
      return;
    }
    if (user.uid === project.creator_id) {
      toast.error(t("projectDetail.cannotApplyOwnToast"));
      return;
    }

    setCheckingProfile(true);
    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userName = userSnap.exists()
        ? sanitizeString((userSnap.data() as Record<string, unknown>).name)
        : "";
      if (!userName) {
        toast.error(t("projectDetail.completeProfileBeforeApply"));
        router.push("/perfil");
        return;
      }
      setShowApplyModal(true);
    } catch (error) {
      reportClientError("project_apply_profile_check", error);
      setShowApplyModal(true);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleConfirmApply = async ({
    selectedProfile,
    note,
  }: {
    selectedProfile: string;
    note: string;
  }) => {
    try {
      setApplying(true);
      if (!user || !project) return;
      if (isDemoId(project.creator_id) || user.uid === project.creator_id) return;

      const deterministicAppId = `${project.id}_${user.uid}`;
      const appRef = doc(db, "applications", deterministicAppId);
      await setDoc(appRef, {
        projectId: project.id,
        projectTitle: project.title,
        applicantId: user.uid,
        creatorId: project.creator_id,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Enviar la nota/perfil seleccionado como primer mensaje de chat de forma atómica
      const introParts: string[] = [];
      if (selectedProfile && note) {
        introParts.push(`[${t("projectDetail.applyRoleMessagePrefix")}: ${selectedProfile}]`);
        introParts.push(note);
      } else if (note) {
        introParts.push(note);
      } else if (selectedProfile) {
        introParts.push(t("projectDetail.applyRoleDefaultMsg", { role: selectedProfile }));
      }

      const introText = introParts.join("\n").trim().slice(0, 1000);
      if (introText) {
        try {
          const batch = writeBatch(db);
          const firstMsgRef = doc(collection(db, "applications", deterministicAppId, "messages"));
          batch.set(firstMsgRef, {
            text: introText,
            senderId: user.uid,
            createdAt: serverTimestamp(),
          });
          batch.update(appRef, {
            lastMessageAt: serverTimestamp(),
            lastMessageSenderId: user.uid,
            lastReadByApplicant: serverTimestamp(),
          });
          await batch.commit();
        } catch (msgError) {
          reportClientError("project_apply_intro_message", msgError);
        }
      }

      setHasApplied(true);
      setShowApplyModal(false);
      toast.success(t("projectDetail.applySuccessToast"));
    } catch (error) {
      reportClientError("project_apply", error);
      toast.error(t("projectDetail.applyErrorToast"));
    } finally {
      setApplying(false);
    }
  };

  const handleShare = async () => {
    if (!project || typeof window === "undefined") return;
    const shareUrl = window.location.href;
    const localized = localizeDemoProject(project, language);
    const shareTitle = `${cleanProjectTitle(localized.title)} · CoFound UE`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      } catch (err: unknown) {
        const name =
          typeof err === "object" && err !== null && "name" in err
            ? String((err as { name?: unknown }).name)
            : "";
        if (name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("projectDetail.shareCopiedToast"));
    } catch {
      toast.error(t("projectDetail.loadErrorToast"));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex-grow flex items-center justify-center bg-transparent min-h-screen relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="bg-transparent flex-grow py-12 px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h2 className="text-3xl font-bold text-white mb-4">{t("projectDetail.notFoundTitle")}</h2>
            <Link href="/dashboard" className="text-[#E60000] hover:underline">
              {t("projectDetail.backToDashboard")}
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isDemo = isDemoId(project.creator_id);
  const displayProject = localizeDemoProject(project, language);
  const displayCreator = creator ? localizeDemoProfile(creator, project.creator_id, language) : null;
  const publishedLabel = formatRelativeDate(project.createdAt, language);
  const displayTitle = cleanProjectTitle(displayProject.title);
  const translateUrl = !isDemo
    ? buildExternalTranslateUrl(`${displayTitle}\n\n${displayProject.description}`, language)
    : "";

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-12 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              {t("projectDetail.backToExplore")}
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2 rounded-xl transition-all"
            >
              <Share2 className="h-4 w-4 text-[#E60000]" />
              <span>{t("projectDetail.shareBtn")}</span>
            </button>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E60000] rounded-full blur-[150px] opacity-5 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-xs font-medium px-3 py-1.5 rounded-md">
                      <Tag className="h-3.5 w-3.5" />
                      {getCategoryLabel(project.category, t)}
                    </span>
                    {isDemo && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs font-semibold px-3 py-1.5 rounded-md">
                        <BookOpen className="h-3.5 w-3.5" />
                        {t("projectDetail.demoBadge")}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{displayTitle}</h1>
                </div>
                
                <div className="shrink-0">
                  {isDemo ? (
                    <Link
                      href="/dashboard/nuevo"
                      className="px-7 py-4 rounded-xl font-bold inline-flex items-center gap-2 transition-all duration-200 shadow-md bg-[#E60000] hover:bg-red-700 text-white hover:shadow-[0_0_20px_rgba(230,0,0,0.3)]"
                    >
                      <span>{t("projectDetail.demoPublishCta")}</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  ) : user?.uid === project.creator_id ? (
                    <Link
                      href={`/dashboard/proyecto/${project.id}/editar`}
                      className="px-7 py-4 rounded-xl font-bold inline-flex items-center gap-2 transition-all duration-200 shadow-md bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                    >
                      <Edit className="h-5 w-5 text-[#E60000]" />
                      <span>{t("projectDetail.editProjectBtn")}</span>
                    </Link>
                  ) : hasApplied && user ? (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-5 py-3.5 rounded-xl font-bold inline-flex items-center gap-2 bg-green-600/15 text-green-400 border border-green-600/30">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{t("projectDetail.alreadyApplied")}</span>
                      </span>
                      <Link
                        href={`/dashboard/mensajes?chat=${project.id}_${user.uid}`}
                        className="px-6 py-3.5 rounded-xl font-bold inline-flex items-center gap-2 bg-[#E60000] hover:bg-red-700 text-white transition-all shadow-md hover:shadow-[0_0_20px_rgba(230,0,0,0.3)]"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>{t("projectDetail.openChatBtn")}</span>
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleOpenApplyModal}
                      disabled={applying || checkingProfile}
                      className="px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all duration-200 shadow-md bg-[#E60000] hover:bg-red-700 text-white hover:shadow-[0_0_20px_rgba(230,0,0,0.3)] disabled:opacity-70"
                    >
                      {applying || checkingProfile ? t("projectDetail.processing") : t("projectDetail.applyBtn")}
                      {!applying && !checkingProfile && <Send className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-8 pb-8 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-zinc-500" />
                  <span>{t("projectDetail.createdBy")} <Link href={`/perfil/${project.creator_id}`} className="text-zinc-200 font-bold hover:text-[#E60000] hover:underline transition-colors">{displayProject.creatorName || displayCreator?.name || t("projectDetail.defaultCreator")}</Link></span>
                </div>
                {displayCreator?.degree && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                    <span>{displayCreator.degree}</span>
                  </>
                )}
                {displayCreator?.campus && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                    <span>{displayCreator.campus.toLowerCase().includes("campus") ? displayCreator.campus : `Campus ${displayCreator.campus}`}</span>
                  </>
                )}
                {publishedLabel && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                    <span className="inline-flex items-center gap-1.5 text-zinc-400">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      {t("projectDetail.publishedPrefix")} {publishedLabel.toLowerCase()}
                    </span>
                  </>
                )}
              </div>

              {isDemo && (
                <div className="mb-10 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-amber-300 mb-1">{t("projectDetail.demoNoticeTitle")}</h2>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{t("projectDetail.demoNoticeDesc")}</p>
                  </div>
                </div>
              )}

              <div className="mb-10">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-xl font-bold text-white">{t("projectDetail.aboutProject")}</h3>
                  {!isDemo && translateUrl && (
                    <a
                      href={translateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t("projectDetail.translateTooltip")}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Languages className="h-3.5 w-3.5 text-[#E60000]" />
                      <span>{t("projectDetail.translateBtn")}</span>
                      <ExternalLink className="h-3 w-3 text-zinc-400" />
                    </a>
                  )}
                </div>
                <div className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {displayProject.description}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">{t("projectDetail.profilesWanted")}</h3>
                <div className="flex flex-wrap gap-3">
                  {displayProject.profiles && displayProject.profiles.map((profile, idx) => (
                    <span key={idx} className="bg-red-950/40 text-[#E60000] text-sm font-medium px-4 py-2 rounded-lg border border-red-900/40">
                      {profile}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <ApplyProjectModal
        isOpen={showApplyModal}
        projectTitle={displayTitle}
        profiles={project.profiles}
        submitting={applying}
        onClose={() => setShowApplyModal(false)}
        onConfirm={handleConfirmApply}
      />
    </ProtectedRoute>
  );
}
