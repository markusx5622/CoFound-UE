"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserCircle, Briefcase, Tag, MapPin, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import InitialsAvatar from "@/components/InitialsAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryLabel } from "@/lib/categories";
import { reportClientError } from "@/lib/error-logger";
import { sanitizeString, sanitizeStringArray } from "@/lib/firestore-guards";
import { isDemoId, cleanProjectTitle } from "@/lib/demo";

interface PublicUser {
  uid: string;
  name: string;
  degree: string;
  campus: string;
  bio: string;
  skills: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  profiles: string[];
}

export default function PublicProfile({ params }: { params: { uid: string } }) {
  const { t } = useLanguage();
  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfileAndProjects = async () => {
      try {
        const uid = params.uid;
        
        // Fetch User Data
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          setError(true);
          setLoading(false);
          return;
        }

        const uRaw = userDocSnap.data() as Record<string, unknown>;
        setProfileUser({
          uid,
          name: sanitizeString(uRaw.name),
          degree: sanitizeString(uRaw.degree),
          campus: sanitizeString(uRaw.campus),
          bio: sanitizeString(uRaw.bio),
          skills: sanitizeStringArray(uRaw.skills, 20),
        });

        // Fetch User Projects
        const qProjects = query(collection(db, "projects"), where("creator_id", "==", uid));
        const projectSnapshot = await getDocs(qProjects);
        
        const projectsData = projectSnapshot.docs.map((doc) => {
          const pRaw = doc.data() as Record<string, unknown>;
          return {
            id: doc.id,
            title: sanitizeString(pRaw.title),
            description: sanitizeString(pRaw.description),
            category: sanitizeString(pRaw.category),
            profiles: sanitizeStringArray(pRaw.profiles, 10),
          };
        });
        
        setProjects(projectsData);
      } catch (err) {
        reportClientError("public_profile_fetch", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndProjects();
  }, [params.uid]);

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-8 sm:py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
            </div>
          ) : error || !profileUser ? (
            <div className="bg-zinc-900/60 backdrop-blur-md p-6 sm:p-10 rounded-2xl shadow-sm text-center border border-zinc-800">
              <UserCircle className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">{t("publicProfile.notFoundTitle")}</h3>
              <p className="text-zinc-400 mb-6">{t("publicProfile.notFoundDesc")}</p>
              <Link 
                href="/dashboard" 
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md inline-block"
              >
                {t("publicProfile.backToDashboard")}
              </Link>
            </div>
          ) : (
            (() => {
              const isOfficialDemo = isDemoId(profileUser.uid);
              return (
            <>
              {/* Profile Card */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden mb-10">
                <div className="h-32 bg-gradient-to-r from-zinc-800 to-[#E60000]/20 relative"></div>
                <div className="px-5 sm:px-8 pb-6 sm:pb-8 relative">
                  <div className="absolute -top-16 left-8 bg-zinc-950 p-2 rounded-full border-4 border-zinc-900 w-32 h-32 flex items-center justify-center overflow-hidden">
                    {isOfficialDemo ? (
                      <Image
                        src="/CoFoundUE_logo.png"
                        alt={profileUser.name || "CoFound UE"}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <InitialsAvatar name={profileUser.name} className="w-full h-full text-3xl font-bold" />
                    )}
                  </div>
                  
                  <div className="pt-16">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <h1 className="text-3xl font-extrabold text-white">{profileUser.name || t("publicProfile.defaultName")}</h1>
                      {isOfficialDemo && (
                        <span className="inline-flex items-center gap-1.5 bg-red-950/60 text-red-300 border border-[#E60000]/40 text-xs font-semibold px-3 py-1 rounded-full">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#E60000]" />
                          {t("publicProfile.officialDemoBadge")}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-8">
                      {profileUser.degree && (
                        <div className="flex items-center gap-2 text-zinc-300 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50">
                          <GraduationCap className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm">{profileUser.degree}</span>
                        </div>
                      )}
                      {profileUser.campus && (
                        <div className="flex items-center gap-2 text-zinc-300 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50">
                          <MapPin className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm">{profileUser.campus}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-6">
                        <div>
                          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">{t("publicProfile.aboutMe")}</h3>
                          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {profileUser.bio || <span className="italic text-zinc-600">{t("publicProfile.noBio")}</span>}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">{t("publicProfile.skills")}</h3>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.skills && profileUser.skills.length > 0 ? (
                            profileUser.skills.map((skill, idx) => (
                              <span key={idx} className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-md border border-zinc-700">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-600 italic text-sm">{t("publicProfile.noSkills")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User's Projects */}
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-[#E60000]" />
                {isOfficialDemo
                  ? t("publicProfile.demoProjectsTitle")
                  : t("publicProfile.userProjects", {
                      name: profileUser.name?.split(" ")[0] || t("publicProfile.defaultUser")
                    })}
              </h2>
              
              {projects.length === 0 ? (
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-8 text-center">
                  <p className="text-zinc-500">{t("publicProfile.noProjects")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <Link href={`/dashboard/proyecto/${project.id}`} key={project.id} className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-[0_0_15px_rgba(230,0,0,0.1)] transition-all border border-zinc-800 hover:border-zinc-700 flex flex-col h-full group">
                      <div className="flex-grow">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-xs font-medium px-2 py-1 rounded-md">
                            <Tag className="h-3 w-3" />
                            {getCategoryLabel(project.category, t)}
                          </span>
                          {isOfficialDemo && (
                            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                              <Sparkles className="h-3 w-3" />
                              {t("dashboard.demoBadge")}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#E60000] transition-colors">{cleanProjectTitle(project.title)}</h3>
                        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <div className="mt-auto pt-4 border-t border-zinc-800/50 flex flex-wrap gap-2">
                        {project.profiles && project.profiles.slice(0, 3).map((profile, idx) => (
                          <span key={idx} className="bg-red-950/30 text-[#E60000] text-[10px] font-medium px-2 py-1 rounded border border-red-900/30">
                            {profile}
                          </span>
                        ))}
                        {project.profiles && project.profiles.length > 3 && (
                          <span className="text-zinc-500 text-xs self-center">+{project.profiles.length - 3}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
              );
            })()
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
