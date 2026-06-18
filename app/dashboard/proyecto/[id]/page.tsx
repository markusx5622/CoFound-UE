"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Briefcase, UserCircle, Tag, ArrowLeft, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  profiles: string[];
  creator_id: string;
}

interface UserProfile {
  name: string;
  degree: string;
  campus: string;
}

export default function ProyectoDetalle() {
  const { id } = useParams();
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [creator, setCreator] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchProjectAndCreator = async () => {
      try {
        if (!id || typeof id !== "string") return;
        
        // Fetch project
        const projectDocRef = doc(db, "projects", id);
        const projectDoc = await getDoc(projectDocRef);
        
        if (projectDoc.exists()) {
          const projectData = { id: projectDoc.id, ...projectDoc.data() } as Project;
          setProject(projectData);
          
          // Fetch creator
          if (projectData.creator_id) {
            const creatorDocRef = doc(db, "users", projectData.creator_id);
            const creatorDoc = await getDoc(creatorDocRef);
            if (creatorDoc.exists()) {
              setCreator(creatorDoc.data() as UserProfile);
            }
          }

          // Check if already applied
          const user = auth.currentUser;
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
        console.error("Error fetching project:", error);
        toast.error("Error al cargar el proyecto");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndCreator();
  }, [id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      const user = auth.currentUser;
      if (!user) {
        toast.error("Debes iniciar sesión para postularte");
        return;
      }
      
      if (!project) return;
      
      if (user.uid === project.creator_id) {
        toast.error("No puedes postularte a tu propio proyecto");
        return;
      }

      await addDoc(collection(db, "applications"), {
        projectId: project.id,
        projectTitle: project.title,
        applicantId: user.uid,
        creatorId: project.creator_id,
        status: "pending",
        createdAt: serverTimestamp()
      });

      setHasApplied(true);
      toast.success("Te has postulado correctamente");
    } catch (error) {
      console.error("Error applying:", error);
      toast.error("Hubo un error al enviar tu postulación");
    } finally {
      setApplying(false);
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
            <h2 className="text-3xl font-bold text-white mb-4">Proyecto no encontrado</h2>
            <Link href="/dashboard" className="text-[#E60000] hover:underline">
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-12 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Volver al explorar
          </Link>

          <div className="bg-zinc-900/60 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E60000] rounded-full blur-[150px] opacity-5 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                  <span className="inline-flex items-center gap-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-xs font-medium px-3 py-1.5 rounded-md mb-4">
                    <Tag className="h-3.5 w-3.5" />
                    {project.category}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{project.title}</h1>
                </div>
                
                <div className="shrink-0">
                  <button
                    onClick={handleApply}
                    disabled={hasApplied || applying || auth.currentUser?.uid === project.creator_id}
                    className={`px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all duration-200 shadow-md ${
                      hasApplied 
                        ? "bg-green-600/20 text-green-500 border border-green-600/30 cursor-default" 
                        : auth.currentUser?.uid === project.creator_id
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-[#E60000] hover:bg-red-700 text-white hover:shadow-[0_0_20px_rgba(230,0,0,0.3)]"
                    }`}
                  >
                    {applying ? "Procesando..." : hasApplied ? "Ya postulado" : "Postularme"}
                    {!hasApplied && !applying && auth.currentUser?.uid !== project.creator_id && <Send className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-10 pb-8 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-zinc-500" />
                  <span>Creado por <strong className="text-zinc-200">{creator?.name || 'Anónimo'}</strong></span>
                </div>
                {creator?.degree && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                    <span>{creator.degree}</span>
                  </>
                )}
                {creator?.campus && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                    <span>Campus {creator.campus}</span>
                  </>
                )}
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-bold text-white mb-4">Acerca del Proyecto</h3>
                <div className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Perfiles que buscamos</h3>
                <div className="flex flex-wrap gap-3">
                  {project.profiles && project.profiles.map((profile, idx) => (
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
    </ProtectedRoute>
  );
}
