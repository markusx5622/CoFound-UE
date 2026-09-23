"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

export default function NuevoProyecto() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Reto Académico");
  const [profileInput, setProfileInput] = useState("");
  const [profiles, setProfiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleAddProfile = () => {
    const trimmed = profileInput.trim();
    if (trimmed !== "" && !profiles.includes(trimmed)) {
      if (profiles.length >= 10) {
        toast.error("Máximo 10 perfiles por proyecto");
        return;
      }
      setProfiles([...profiles, trimmed]);
      setProfileInput("");
    }
  };

  const handleRemoveProfile = (profileToRemove: string) => {
    setProfiles(profiles.filter((p) => p !== profileToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProfile();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || profiles.length === 0) {
      toast.error("Por favor completa todos los campos y añade al menos un perfil buscado.");
      return;
    }

    if (title.trim().length < 3) {
      toast.error("El título debe tener al menos 3 caracteres.");
      return;
    }

    if (description.trim().length < 20) {
      toast.error("La descripción debe tener al menos 20 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (!user) throw new Error("No user logged in");

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : null;
      const creatorName = userData?.name?.trim();

      if (!creatorName) {
        toast.error("Completa tu perfil antes de publicar");
        setLoading(false);
        router.push("/perfil");
        return;
      }

      await addDoc(collection(db, "projects"), {
        title,
        description,
        category,
        profiles,
        creator_id: user.uid,
        creatorName,
        createdAt: serverTimestamp()
      });

      toast.success("Proyecto publicado correctamente.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Hubo un error al publicar el proyecto.");
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow py-8 sm:py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Publicar Nuevo Proyecto</h1>
          
          <div className="bg-zinc-900/60 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-zinc-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Título del Proyecto</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600"
                  placeholder="Ej: Plataforma de economía circular para estudiantes"
                />
                <div className="text-right text-xs text-zinc-500 mt-1">{title.length}/100</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Descripción</label>
                <textarea
                  required
                  rows={5}
                  maxLength={1500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all resize-none placeholder:text-zinc-600"
                  placeholder="Explica de qué trata tu proyecto, en qué fase está y qué objetivos tiene..."
                />
                <div className="text-right text-xs text-zinc-500 mt-1">{description.length}/1500</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all"
                >
                  <option value="Reto Académico">Reto Académico</option>
                  <option value="TFG">TFG (Trabajo Fin de Grado)</option>
                  <option value="Startup Real">Startup Real</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Perfiles Buscados</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    maxLength={40}
                    value={profileInput}
                    onChange={(e) => setProfileInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 px-3.5 sm:px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600 text-sm sm:text-base"
                    placeholder="Ej: Frontend Developer, Marketing Manager..."
                  />
                  <button
                    type="button"
                    onClick={handleAddProfile}
                    className="shrink-0 px-3.5 sm:px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>Añadir</span>
                  </button>
                </div>
                
                {profiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                    {profiles.map((profile, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-900/30 text-sm font-medium shadow-sm text-[#E60000]">
                        {profile}
                        <button
                          type="button"
                          onClick={() => handleRemoveProfile(profile)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-800/50">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E60000] text-white hover:bg-red-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(230,0,0,0.3)] hover:shadow-[0_0_25px_rgba(230,0,0,0.5)] disabled:opacity-70"
                >
                  {loading ? "Publicando..." : "Publicar Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
