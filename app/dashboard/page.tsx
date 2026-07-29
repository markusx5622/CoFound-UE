"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Briefcase, UserCircle, Tag, Search, Filter } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  profiles: string[];
  creator_id: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  
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
      const projectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

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
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProjects(true);
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "Todas" || project.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">Proyectos Activos</h1>
          
          {/* Barra de Filtros */}
          <div className="bg-zinc-900/60 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="text"
                placeholder="Buscar por palabra clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-700 bg-zinc-950 rounded-xl focus:ring-[#E60000] focus:border-[#E60000] outline-none text-white placeholder-zinc-500 transition-colors"
              />
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
                <option value="Todas">Todas las categorías</option>
                <option value="Reto Académico">Reto Académico</option>
                <option value="TFG">TFG</option>
                <option value="Startup Real">Startup Real</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-zinc-900/60 backdrop-blur-md p-10 rounded-2xl shadow-sm text-center border border-zinc-800">
              <Briefcase className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No hay proyectos todavía</h3>
              <p className="text-zinc-400 mb-6">Sé el primero en publicar una idea y encuentra a tu equipo.</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-zinc-900/60 backdrop-blur-md p-10 rounded-2xl shadow-sm text-center border border-zinc-800">
              <Briefcase className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron proyectos</h3>
              <p className="text-zinc-400 mb-6">Prueba a cambiar los filtros de búsqueda o sé el primero en publicar una idea.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {filteredProjects.map((project) => (
                <Link href={`/dashboard/proyecto/${project.id}`} key={project.id} className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-[0_0_20px_rgba(230,0,0,0.15)] transition-all duration-300 border border-zinc-800 hover:border-zinc-700 flex flex-col h-full group">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center gap-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-xs font-medium px-2.5 py-1 rounded-md">
                        <Tag className="h-3 w-3" />
                        {project.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#E60000] transition-colors">{project.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                      <UserCircle className="h-4 w-4" />
                      <span>Creador ID: {project.creator_id ? project.creator_id.substring(0, 8) : 'Unknown'}...</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-6 line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Perfiles Buscados</p>
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
                    <button className="w-full py-2.5 bg-zinc-800/50 border border-zinc-700 text-zinc-300 rounded-xl font-semibold hover:bg-[#E60000] hover:border-[#E60000] hover:text-white transition-all duration-200">
                      Ver Detalles y Postularse
                    </button>
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchProjects(false)}
                  disabled={loadingMore}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {loadingMore ? "Cargando..." : "Cargar más proyectos"}
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
