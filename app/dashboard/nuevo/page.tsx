"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
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
  const router = useRouter();

  const handleAddProfile = () => {
    if (profileInput.trim() !== "" && !profiles.includes(profileInput.trim())) {
      setProfiles([...profiles, profileInput.trim()]);
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

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      await addDoc(collection(db, "projects"), {
        title,
        description,
        category,
        profiles,
        creator_id: user.uid,
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
      <div className="bg-transparent flex-grow py-12 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Publicar Nuevo Proyecto</h1>
          
          <div className="bg-zinc-900/60 backdrop-blur-md p-8 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-zinc-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Título del Proyecto</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600"
                  placeholder="Ej: Plataforma de economía circular para estudiantes"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Descripción</label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all resize-none placeholder:text-zinc-600"
                  placeholder="Explica de qué trata tu proyecto, en qué fase está y qué objetivos tiene..."
                />
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
                    value={profileInput}
                    onChange={(e) => setProfileInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all placeholder:text-zinc-600"
                    placeholder="Ej: Frontend Developer, Marketing Manager..."
                  />
                  <button
                    type="button"
                    onClick={handleAddProfile}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Añadir
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
