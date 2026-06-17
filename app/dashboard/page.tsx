"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Briefcase, UserCircle, Tag } from "lucide-react";

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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, "projects"));
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        // Sort by id for consistency since we didn't add composite index for createdAt
        setProjects(projectsData.reverse());
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <ProtectedRoute>
      <div className="bg-gray-50 flex-grow py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-black mb-10 tracking-tight">Proyectos Activos</h1>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No hay proyectos todavía</h3>
              <p className="text-gray-500 mb-6">Sé el primero en publicar una idea y encuentra a tu equipo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex flex-col h-full">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md">
                        <Tag className="h-3 w-3" />
                        {project.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-black mb-2 line-clamp-2">{project.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <UserCircle className="h-4 w-4" />
                      <span>Creador ID: {project.creator_id ? project.creator_id.substring(0, 8) : 'Unknown'}...</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Perfiles Buscados</p>
                      <div className="flex flex-wrap gap-2">
                        {project.profiles && project.profiles.map((profile, idx) => (
                          <span key={idx} className="bg-red-50 text-[#E60000] text-xs font-medium px-2.5 py-1 rounded-md border border-red-100">
                            {profile}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <button className="w-full py-2.5 border-2 border-[#E60000] text-[#E60000] rounded-xl font-semibold hover:bg-[#E60000] hover:text-white transition-all duration-200">
                      Postularse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
