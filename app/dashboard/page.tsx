"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, orderBy, limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Briefcase, UserCircle, Tag, Search, Filter, Sparkles, UserCheck, ArrowRight, Clock, X, EyeOff, RotateCcw } from "lucide-react";
import Link from "next/link";
import { ProjectSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryLabel, CANONICAL_CATEGORIES } from "@/lib/categories";
import { reportClientError } from "@/lib/error-logger";
import { sanitizeString, sanitizeStringArray } from "@/lib/firestore-guards";
import { isDemoId, cleanProjectTitle } from "@/lib/demo";
import { formatRelativeDate } from "@/lib/date-utils";

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

function mapProjectDoc(id: string, data: Record<string, unknown>): Project {
  const creatorName = sanitizeString(data.creatorName);
  return {
    id,
    title: sanitizeString(data.title),
    description: sanitizeString(data.description),
    category: sanitizeString(data.category),
    profiles: sanitizeStringArray(data.profiles, 10),
    creator_id: sanitizeString(data.creator_id),
    ...(creatorName ? { creatorName } : {}),
    createdAt: data.createdAt,
  };
}

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [hideDemos, setHideDemos] = useState(false);
  
  // Paginación
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PROJECTS_PER_PAGE = 12;

  const fetchProjects = async (isInitial = true) => {
    try {
      let q;
      if (isInitial) {
        setLoading(true);
        q = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(PROJECTS_PER_PAGE));
      } else {
        if (!lastVisible) return;
        setLoadingMore(true);
        q = query(collection(db, "projects"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(PROJECTS_PER_PAGE));
      }

      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map((doc) =>
        mapProjectDoc(doc.id, doc.data() as Record<string, unknown>)
      );

      if (projectsData.length < PROJECTS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      if (isInitial) {
        setProjects(projectsData);
      } else {
        setProjects([...projects, ...projectsData]);
      }
    } catch (error) {
      reportClientError("dashboard_fetch_projects_more", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const loadInitialProjects = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(PROJECTS_PER_PAGE));
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map((doc) =>
          mapProjectDoc(doc.id, doc.data() as Record<string, unknown>)
        );

        setHasMore(projectsData.length >= PROJECTS_PER_PAGE);
        if (querySnapshot.docs.length > 0) {
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }
        setProjects(projectsData);
      } catch (error) {
        reportClientError("dashboard_fetch_projects_initial", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialProjects();
  }, []);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user || !user.emailVerified) {
        setNeedsProfileSetup(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) {
          setNeedsProfileSetup(true);
          return;
        }
        const data = snap.data() as Record<string, unknown>;
        const hasName = sanitizeString(data.name).length > 0;
        const hasDegree = sanitizeString(data.degree).length > 0;
        setNeedsProfileSetup(!hasName || !hasDegree);
      } catch {
        // No bloquear el tablero si falla la comprobación auxiliar
      }
    };

    checkProfileStatus();
  }, [user]);

  const filteredProjects = projects.filter(project => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      project.title.toLowerCase().includes(q) ||
      project.description.toLowerCase().includes(q) ||
      (project.profiles && project.profiles.some((p) => p.toLowerCase().includes(q))) ||
      (project.creatorName && project.creatorName.toLowerCase().includes(q));
    
    const matchesCategory = categoryFilter === "Todas" || project.category === categoryFilter;
    const matchesDemoFilter = !hideDemos || !isDemoId(project.creator_id);
    
    return matchesSearch && matchesCategory && matchesDemoFilter;
  });

  const hasDemoProjects = projects.some((p) => isDemoId(p.creator_id));
  const hasActiveFilters = searchQuery.trim() !== "" || categoryFilter !== "Todas" || hideDemos;

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("Todas");
    setHideDemos(false);
  };

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">{t("dashboard.title")}</h1>

          {/* Banner de onboarding si falta completar el perfil */}
          {needsProfileSetup && (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/50 via-zinc-900/90 to-zinc-900/80 border border-[#E60000]/35 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-950/70 border border-[#E60000]/40 flex items-center justify-center text-[#E60000] shrink-0 mt-0.5">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    {t("dashboard.completeProfileBannerTitle")}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-0.5 leading-relaxed">
                    {t("dashboard.completeProfileBannerDesc")}
                  </p>
                </div>
              </div>
              <Link
                href="/perfil"
                className="shrink-0 bg-[#E60000] hover:bg-red-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>{t("dashboard.completeProfileBannerCta")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
          
          {/* Barra de Filtros */}
          <div className="bg-zinc-900/60 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 mb-8 space-y-3">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="text"
                  placeholder={t("dashboard.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-zinc-700 bg-zinc-950 rounded-xl focus:ring-[#E60000] focus:border-[#E60000] outline-none text-white placeholder-zinc-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label={t("dashboard.clearSearchAria")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="relative w-full md:w-64 shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-zinc-500" />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-zinc-700 bg-zinc-950 rounded-xl focus:ring-[#E60000] focus:border-[#E60000] outline-none text-white appearance-none transition-colors"
                >
                  <option value="Todas">{t("categories.all")}</option>
                  {CANONICAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat, t)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!loading && projects.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/70 text-xs">
                <span className="text-zinc-400">
                  {filteredProjects.length === 1
                    ? t("dashboard.showingCountSingle")
                    : t("dashboard.showingCount", { count: String(filteredProjects.length) })}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {hasDemoProjects && (
                    <button
                      type="button"
                      onClick={() => setHideDemos((prev) => !prev)}
                      aria-pressed={hideDemos}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        hideDemos
                          ? "bg-[#E60000]/15 text-red-300 border-[#E60000]/40"
                          : "bg-zinc-950/70 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>{t("dashboard.hideExamples")}</span>
                    </button>
                  )}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 font-medium transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>{t("dashboard.clearFiltersBtn")}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[...Array(6)].map((_, i) => (
                <ProjectSkeleton key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-zinc-900/60 backdrop-blur-md p-10 rounded-2xl shadow-sm text-center border border-zinc-800">
              <Briefcase className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{t("dashboard.emptyTitle")}</h3>
              <p className="text-zinc-400 mb-6">{t("dashboard.emptyDesc")}</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <>
              <div className="bg-zinc-900/60 backdrop-blur-md p-10 rounded-2xl shadow-sm text-center border border-zinc-800">
                <Briefcase className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{t("dashboard.noResultsTitle")}</h3>
                <p className="text-zinc-400 mb-6">{t("dashboard.noResultsDesc")}</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold border border-zinc-700 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{t("dashboard.clearFiltersBtn")}</span>
                  </button>
                )}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => fetchProjects(false)}
                    disabled={loadingMore}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? t("dashboard.loadingMore") : t("dashboard.loadMoreBtn")}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {filteredProjects.map((project) => {
                  const isDemo = isDemoId(project.creator_id);
                  return (
                <Link href={`/dashboard/proyecto/${project.id}`} key={project.id} className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-[0_0_20px_rgba(230,0,0,0.15)] transition-all duration-300 border border-zinc-800 hover:border-zinc-700 flex flex-col h-full group">
                  <div className="flex-grow">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-xs font-medium px-2.5 py-1 rounded-md">
                        <Tag className="h-3 w-3" />
                        {getCategoryLabel(project.category, t)}
                      </span>
                      {isDemo && (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                          <Sparkles className="h-3 w-3" />
                          {t("dashboard.demoBadge")}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#E60000] transition-colors">{cleanProjectTitle(project.title)}</h2>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-400 mb-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <UserCircle className="h-4 w-4 shrink-0" />
                        <span className="truncate">{project.creatorName || t("dashboard.defaultCreator")}</span>
                      </div>
                      {formatRelativeDate(project.createdAt, language) && (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-500 shrink-0">
                          <Clock className="h-3 w-3" />
                          {formatRelativeDate(project.createdAt, language)}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm mb-6 line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{t("dashboard.profilesWanted")}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.profiles && project.profiles.map((profile, idx) => (
                          <span key={idx} className="bg-red-950/30 text-[#E60000] text-xs font-medium px-2.5 py-1 rounded-md border border-red-900/30">
                            {profile}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-zinc-800/50">
                    <span className="block text-center w-full py-2.5 bg-zinc-800/50 border border-zinc-700 text-zinc-300 rounded-xl font-semibold group-hover:bg-[#E60000] group-hover:border-[#E60000] group-hover:text-white transition-all duration-200">
                      {isDemo ? t("dashboard.viewDemoDetailsBtn") : t("dashboard.viewDetailsBtn")}
                    </span>
                  </div>
                </Link>
                  );
                })}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchProjects(false)}
                  disabled={loadingMore}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {loadingMore ? t("dashboard.loadingMore") : t("dashboard.loadMoreBtn")}
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
