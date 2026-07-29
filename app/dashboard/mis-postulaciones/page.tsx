"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Briefcase, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantId: string;
  status: string;
  createdAt: any;
}

export default function MisPostulaciones() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      if (authLoading) return;

      try {
        if (!user) return;

        const qApps = query(collection(db, "applications"), where("applicantId", "==", user.uid));
        const appSnapshot = await getDocs(qApps);
        
        const appsData = appSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Application[];
        
        // Sort by createdAt (client side)
        appsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setApplications(appsData);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Error al cargar tus postulaciones");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, authLoading]);

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-12 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-10 tracking-tight">Mis Postulaciones</h1>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-zinc-900/60 backdrop-blur-md p-10 rounded-2xl shadow-sm text-center border border-zinc-800">
              <Briefcase className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Aún no te has postulado a ningún proyecto</h3>
              <p className="text-zinc-400 mb-6">Explora los proyectos activos y únete a un equipo.</p>
              <Link 
                href="/dashboard" 
                className="bg-[#E60000] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md inline-block"
              >
                Explorar Proyectos
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => (
                <Link 
                  href={`/dashboard/proyecto/${app.projectId}`} 
                  key={app.id} 
                  className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h2 className="text-lg font-bold text-white group-hover:text-[#E60000] transition-colors">{app.projectTitle}</h2>
                    <div className="text-sm text-zinc-500 mt-1">
                      Enviada el {app.createdAt?.toDate().toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {app.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg text-sm font-medium border border-yellow-500/20">
                        <Clock className="h-4 w-4" />
                        Pendiente
                      </span>
                    )}
                    {app.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-500/20">
                        <CheckCircle className="h-4 w-4" />
                        Aceptada
                      </span>
                    )}
                    {app.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-500/20">
                        <XCircle className="h-4 w-4" />
                        Rechazada
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
