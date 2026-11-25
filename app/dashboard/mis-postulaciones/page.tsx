"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Briefcase, Clock, CheckCircle, XCircle, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { reportClientError } from "@/lib/error-logger";
import { sanitizeString, toSafeDate } from "@/lib/firestore-guards";
import ConfirmModal from "@/components/ConfirmModal";

interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantId: string;
  status: string;
  createdAt: Date | null;
}

export default function MisPostulaciones() {
  const { t, language } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [appToWithdraw, setAppToWithdraw] = useState<Application | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      if (authLoading) return;

      try {
        if (!user) return;

        const qApps = query(collection(db, "applications"), where("applicantId", "==", user.uid));
        const appSnapshot = await getDocs(qApps);
        
        const appsData = appSnapshot.docs.map((doc) => {
          const raw = doc.data() as Record<string, unknown>;
          return {
            id: doc.id,
            projectId: sanitizeString(raw.projectId),
            projectTitle: sanitizeString(raw.projectTitle),
            applicantId: sanitizeString(raw.applicantId),
            status: sanitizeString(raw.status, "pending"),
            createdAt: toSafeDate(raw.createdAt),
          };
        });
        
        // Ordenar por fecha de creación en cliente de forma segura
        appsData.sort((a, b) => {
          const timeA = a.createdAt ? a.createdAt.getTime() : 0;
          const timeB = b.createdAt ? b.createdAt.getTime() : 0;
          return timeB - timeA;
        });

        setApplications(appsData);
      } catch (error) {
        reportClientError("my_applications_fetch", error);
        toast.error(t("myApplications.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, authLoading, t]);

  const handleConfirmWithdraw = async () => {
    if (!user || !appToWithdraw) return;
    const targetId = appToWithdraw.id;
    setWithdrawing(true);
    try {
      // Eliminar primero los mensajes de la conversación (hijos -> padre) y luego la postulación
      const msgsSnap = await getDocs(collection(db, "applications", targetId, "messages"));
      await Promise.all(msgsSnap.docs.map((m) => deleteDoc(m.ref)));
      await deleteDoc(doc(db, "applications", targetId));

      setApplications((prev) => prev.filter((item) => item.id !== targetId));
      setAppToWithdraw(null);
      toast.success(t("myApplications.withdrawSuccessToast"));
    } catch (error) {
      reportClientError("my_applications_withdraw", error);
      toast.error(t("myApplications.withdrawErrorToast"));
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-12 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 sm:mb-10 tracking-tight">{t("myApplications.title")}</h1>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-zinc-800 border-t-[#E60000]"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-zinc-900/60 backdrop-blur-md p-10 rounded-2xl shadow-sm text-center border border-zinc-800">
              <Briefcase className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{t("myApplications.emptyTitle")}</h3>
              <p className="text-zinc-400 mb-6">{t("myApplications.emptyDesc")}</p>
              <Link 
                href="/dashboard" 
                className="bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md inline-block touch-manipulation"
              >
                {t("myApplications.exploreBtn")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => (
                <div 
                  key={app.id} 
                  className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <Link href={`/dashboard/proyecto/${app.projectId}`} className="flex-grow">
                    <h2 className="text-lg font-bold text-white group-hover:text-[#E60000] transition-colors">{app.projectTitle}</h2>
                    <div className="text-sm text-zinc-500 mt-1">
                      {t("myApplications.submittedOn", {
                        date: app.createdAt
                          ? app.createdAt.toLocaleDateString(language === "en" ? "en-US" : "es-ES")
                          : "-"
                      })}
                    </div>
                  </Link>
                  
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Link
                      href={`/dashboard/mensajes?chat=${app.id}`}
                      className="inline-flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium border border-zinc-700 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 text-[#E60000]" />
                      <span>{t("myApplications.openChatBtn")}</span>
                    </Link>
                    {app.status === 'pending' && (
                      <>
                        <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg text-sm font-medium border border-yellow-500/20">
                          <Clock className="h-4 w-4" />
                          {t("myApplications.pending")}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAppToWithdraw(app)}
                          title={t("myApplications.withdrawBtn")}
                          className="inline-flex items-center gap-1.5 bg-transparent hover:bg-red-950/40 text-zinc-400 hover:text-red-400 px-2.5 py-1.5 rounded-lg text-sm font-medium border border-zinc-800 hover:border-red-900/50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">{t("myApplications.withdrawBtn")}</span>
                        </button>
                      </>
                    )}
                    {app.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-500/20">
                        <CheckCircle className="h-4 w-4" />
                        {t("myApplications.accepted")}
                      </span>
                    )}
                    {app.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-500/20">
                        <XCircle className="h-4 w-4" />
                        {t("myApplications.rejected")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={Boolean(appToWithdraw)}
        title={t("myApplications.withdrawModalTitle")}
        description={t("myApplications.withdrawModalDesc", {
          title: appToWithdraw?.projectTitle || "",
        })}
        confirmLabel={t("myApplications.withdrawModalConfirm")}
        cancelLabel={t("myApplications.withdrawModalCancel")}
        loading={withdrawing}
        onConfirm={handleConfirmWithdraw}
        onCancel={() => setAppToWithdraw(null)}
      />
    </ProtectedRoute>
  );
}
