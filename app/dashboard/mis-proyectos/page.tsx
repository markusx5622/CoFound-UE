"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, UserCircle, Tag, Trash2, Users, X, Check, XCircle, Edit } from "lucide-react";
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

interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantId: string;
  status: string;
  createdAt: any;
  applicantData?: {
    name: string;
    email: string;
    degree: string;
    campus: string;
    bio: string;
    skills: string[];
    photoURL?: string;
  };
}

export default function MisProyectos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Application["applicantData"] | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      try {
        if (!user) return;

        // Fetch user's projects
        const qProjects = query(collection(db, "projects"), where("creator_id", "==", user.uid));
        const projectSnapshot = await getDocs(qProjects);
        const projectsData = projectSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        setProjects(projectsData);

        // Fetch applications for these projects
        const qApps = query(collection(db, "applications"), where("creatorId", "==", user.uid));
        const appSnapshot = await getDocs(qApps);
        
        const appsData = await Promise.all(appSnapshot.docs.map(async (appDoc) => {
          const app = { id: appDoc.id, ...appDoc.data() } as Application;
          // Fetch applicant data
          const userDocRef = doc(db, "users", app.applicantId);
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists()) {
            const data = userDocSnapshot.data();
            app.applicantData = {
              name: data.name || "Desconocido",
              email: data.email || "",
              degree: data.degree || "",
              campus: data.campus || "",
              bio: data.bio || "",
              skills: data.skills || [],
              photoURL: data.photoURL
            };
          }
          return app;
        }));
        
        setApplications(appsData);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar tus proyectos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  const handleDelete = async (projectId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este proyecto? Se perderán las postulaciones asociadas.")) return;
    
    try {
      // 1. Delete project document
      await deleteDoc(doc(db, "projects", projectId));
      
      // 2. Cascade delete applications
      const qApps = query(collection(db, "applications"), where("projectId", "==", projectId));
      const appSnapshot = await getDocs(qApps);
      
      const deletePromises = appSnapshot.docs.map(appDoc => deleteDoc(doc(db, "applications", appDoc.id)));
      await Promise.all(deletePromises);

      setProjects(projects.filter(p => p.id !== projectId));
      setApplications(applications.filter(a => a.projectId !== projectId));
      toast.success("Proyecto y postulaciones eliminadas correctamente");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error al eliminar el proyecto");
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "applications", appId), {
        status: newStatus
      });
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      toast.success(newStatus === 'accepted' ? 'Candidato aceptado' : 'Candidato rechazado');
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Mis Proyectos</h1>
            <Link 
              href="/dashboard/nuevo" 
              className="bg-[#E60000] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md"
            >
              Crear Nuevo
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-zinc-900/60 backdrop-blur-md p-10 rounded-2xl shadow-sm text-center border border-zinc-800 mb-12">
              <Briefcase className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Aún no has creado ningún proyecto</h3>
              <p className="text-zinc-400 mb-6">Publica tu primera idea y empieza a recibir postulaciones.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {projects.map((project) => (
                <div key={project.id} className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-zinc-800 flex flex-col h-full relative group">
                  <div className="absolute top-4 right-4 flex items-center gap-1 z-20">
                    <Link
                      href={`/dashboard/proyecto/${project.id}/editar`}
                      className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Editar proyecto"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Link href={`/dashboard/proyecto/${project.id}`} className="flex-grow z-10">
                    <div className="flex justify-between items-start mb-4 pr-10">
                      <span className="inline-flex items-center gap-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-xs font-medium px-2.5 py-1 rounded-md">
                        <Tag className="h-3 w-3" />
                        {project.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#E60000] transition-colors">{project.title}</h2>
                    <p className="text-zinc-400 text-sm mb-6 line-clamp-3">
                      {project.description}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Sección de Postulaciones Recibidas */}
          <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-[#E60000]" />
            Postulaciones Recibidas
          </h2>

          {loading ? null : applications.length === 0 ? (
            <div className="bg-zinc-900/60 backdrop-blur-md p-10 rounded-2xl shadow-sm text-center border border-zinc-800">
              <Users className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No hay postulaciones</h3>
              <p className="text-zinc-400 mb-6">Aún nadie se ha postulado a tus proyectos.</p>
            </div>
          ) : (
            <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="text-xs text-zinc-300 uppercase bg-zinc-800/50 border-b border-zinc-700">
                    <tr>
                      <th className="px-6 py-4">Candidato</th>
                      <th className="px-6 py-4">Titulación / Campus</th>
                      <th className="px-6 py-4">Proyecto</th>
                      <th className="px-6 py-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors ${
                        app.status === 'accepted' ? 'bg-green-950/10' : app.status === 'rejected' ? 'bg-red-950/10 opacity-75' : ''
                      }`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/perfil/${app.applicantId}`} className="font-medium text-white hover:text-[#E60000] transition-colors">
                              {app.applicantData?.name || 'Usuario sin nombre'}
                            </Link>
                            {app.status === 'accepted' && (
                              <span className="bg-green-500/20 text-green-500 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Aceptado</span>
                            )}
                            {app.status === 'rejected' && (
                              <span className="bg-red-500/20 text-red-500 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Rechazado</span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">{app.applicantData?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div>{app.applicantData?.degree || 'No especificada'}</div>
                          <div className="text-xs text-zinc-500 mt-1">{app.applicantData?.campus || 'No especificado'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/proyecto/${app.projectId}`} className="text-zinc-300 hover:text-white transition-colors text-sm">
                            {app.projectTitle}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className="text-zinc-400 hover:text-white p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
                              onClick={() => setSelectedApplicant(app.applicantData)}
                              title="Ver Perfil Detallado"
                            >
                              <UserCircle className="h-5 w-5" />
                            </button>
                            
                            {app.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'accepted')}
                                  className="text-green-500 hover:text-green-400 p-1.5 rounded-md hover:bg-green-500/10 transition-colors"
                                  title="Aceptar Candidato"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                  className="text-red-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                                  title="Rechazar Candidato"
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setSelectedApplicant(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserCircle className="h-12 w-12 text-zinc-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">{selectedApplicant.name || 'Sin nombre'}</h3>
              <p className="text-[#E60000]">{selectedApplicant.email}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Titulación y Campus</h4>
                <p className="text-zinc-300">{selectedApplicant.degree || 'No especificada'} - {selectedApplicant.campus || 'No especificado'}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Sobre Mí</h4>
                <p className="text-zinc-300 whitespace-pre-wrap">{selectedApplicant.bio || 'El usuario no ha escrito una biografía.'}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Habilidades</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedApplicant.skills && selectedApplicant.skills.length > 0 ? (
                    selectedApplicant.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic text-sm">Ninguna habilidad listada</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="w-full bg-[#E60000] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
