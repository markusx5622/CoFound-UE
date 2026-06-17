"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { X, Plus, Save } from "lucide-react";

export default function MiPerfil() {
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [campus, setCampus] = useState("Villaviciosa");
  const [bio, setBio] = useState("");
  
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || "");
            setDegree(data.degree || "");
            setCampus(data.campus || "Villaviciosa");
            setBio(data.bio || "");
            setSkills(data.skills || []);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setFetching(false);
      }
    };
    
    // Slight delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      fetchProfile();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAddSkill = () => {
    if (skillInput.trim() !== "" && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      await setDoc(doc(db, "users", user.uid), {
        name,
        degree,
        campus,
        bio,
        skills,
        email: user.email,
        updatedAt: new Date()
      }, { merge: true });

      alert("Perfil guardado correctamente.");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Hubo un error al guardar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ProtectedRoute>
        <div className="flex-grow flex items-center justify-center bg-gray-50 min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-gray-50 flex-grow py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Mi Perfil</h1>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                    placeholder="Tu nombre y apellidos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Titulación</label>
                  <input
                    type="text"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                    placeholder="Ej: Grado en ADE"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Campus</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all bg-white"
                >
                  <option value="Villaviciosa">Villaviciosa de Odón</option>
                  <option value="Alcobendas">Alcobendas</option>
                  <option value="Valencia">Valencia</option>
                  <option value="Canarias">Canarias</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Biografía</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none"
                  placeholder="Cuéntanos un poco sobre ti, tus intereses y qué tipo de proyectos buscas..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Habilidades (Tags)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                    placeholder="Ej: React, Finanzas, SEO, Figma..."
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Añadir
                  </button>
                </div>
                
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-gray-300 hover:text-white transition-colors ml-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E60000] text-white hover:bg-red-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
