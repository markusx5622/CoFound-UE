"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserCircle, Briefcase, Tag, MapPin, GraduationCap } from "lucide-react";
import Link from "next/link";

interface PublicUser {
  uid: string;
  name: string;
  email: string;
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

        setProfileUser({ uid, ...userDocSnap.data() } as PublicUser);

        // Fetch User Projects
        const qProjects = query(collection(db, "projects"), where("creator_id", "==", uid));
        const projectSnapshot = await getDocs(qProjects);
        
        const projectsData = projectSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        
        setProjects(projectsData);
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndProjects();
  }, [params.uid]);

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-12 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
            </div>
          ) : error || !profileUser ? (
            <div className="bg-zinc-900/60 backdrop-blur-md p-10 rounded-2xl shadow-sm text-center border border-zinc-800">
              <UserCircle className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Usuario no encontrado</h3>
              <p className="text-zinc-400 mb-6">El perfil que buscas no existe o ha sido eliminado.</p>
              <Link 
                href="/dashboard" 
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md inline-block"
              >
                Volver al Dashboard
              </Link>
            </div>
          ) : (
            <>
              {/* Profile Card */}
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden mb-10">
                <div className="h-32 bg-gradient-to-r from-zinc-800 to-[#E60000]/20 relative"></div>
                <div className="px-8 pb-8 relative">
                  <div className="absolute -top-16 left-8 bg-zinc-950 p-2 rounded-full border-4 border-zinc-900">
                    <UserCircle className="h-24 w-24 text-zinc-400 bg-zinc-800 rounded-full" />
                  </div>
                  
                  <div className="pt-14">
                    <h1 className="text-3xl font-extrabold text-white mb-1">{profileUser.name || 'Usuario Sin Nombre'}</h1>
                    <p className="text-[#E60000] font-medium mb-6">{profileUser.email}</p>
                    
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
                          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sobre Mí</h3>
                          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {profileUser.bio || <span className="italic text-zinc-600">Este usuario aún no ha escrito una biografía.</span>}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Habilidades</h3>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.skills && profileUser.skills.length > 0 ? (
                            profileUser.skills.map((skill, idx) => (
                              <span key={idx} className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-md border border-zinc-700">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-600 italic text-sm">Ninguna habilidad listada</span>
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
                Proyectos de {profileUser.name?.split(' ')[0] || 'este usuario'}
              </h2>
              
              {projects.length === 0 ? (
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-8 text-center">
                  <p className="text-zinc-500">No tiene proyectos publicados actualmente.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <Link href={`/dashboard/proyecto/${project.id}`} key={project.id} className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-[0_0_15px_rgba(230,0,0,0.1)] transition-all border border-zinc-800 hover:border-zinc-700 flex flex-col h-full group">
                      <div className="flex-grow">
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-xs font-medium px-2 py-1 rounded-md">
                            <Tag className="h-3 w-3" />
                            {project.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#E60000] transition-colors">{project.title}</h3>
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
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
