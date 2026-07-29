"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Send, UserCircle, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Mensajes() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch applications where user is applicant or creator
    const fetchConversations = async () => {
      try {
        const qApplicant = query(collection(db, "applications"), where("applicantId", "==", user.uid));
        const qCreator = query(collection(db, "applications"), where("creatorId", "==", user.uid));
        
        const [snapApp, snapCreator] = await Promise.all([getDocs(qApplicant), getDocs(qCreator)]);
        
        let allConvos = [...snapApp.docs, ...snapCreator.docs].map(d => ({ id: d.id, ...d.data() }));
        
        // Remove duplicates if any
        const uniqueConvos = Array.from(new Map(allConvos.map(item => [item.id, item])).values());
        
        // Enhance with other user's info
        const enhancedConvos = await Promise.all(uniqueConvos.map(async (convo: any) => {
          const otherUserId = convo.creatorId === user.uid ? convo.applicantId : convo.creatorId;
          const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
          const otherUserData = otherUserDoc.exists() ? otherUserDoc.data() : { name: "Usuario Desconocido" };
          
          return {
            ...convo,
            otherUser: otherUserData
          };
        }));
        
        setConversations(enhancedConvos);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!activeChat || !user) return;

    const q = query(
      collection(db, "applications", activeChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [activeChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user) return;

    const msgText = newMessage.trim();
    setNewMessage("");

    try {
      await addDoc(collection(db, "applications", activeChat.id, "messages"), {
        text: msgText,
        senderId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow flex flex-col relative z-10 h-[calc(100vh-80px)] pt-6 pb-0">
        <div className="max-w-7xl mx-auto w-full flex-grow flex overflow-hidden border border-zinc-800 rounded-t-2xl">
          
          {/* Sidebar */}
          <div className={`w-full md:w-1/3 bg-zinc-950/80 backdrop-blur-md border-r border-zinc-800 flex flex-col h-full ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Mensajes</h2>
            </div>
            <div className="overflow-y-auto flex-grow custom-scrollbar">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E60000]"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No tienes conversaciones activas. 
                  <br /><br />
                  Postúlate a proyectos para conectar con otros estudiantes.
                </div>
              ) : (
                conversations.map(convo => (
                  <div 
                    key={convo.id}
                    onClick={() => setActiveChat(convo)}
                    className={`p-4 border-b border-zinc-800/50 cursor-pointer transition-colors flex items-center gap-3 ${activeChat?.id === convo.id ? 'bg-zinc-900 border-l-2 border-l-[#E60000]' : 'hover:bg-zinc-900/50'}`}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      {convo.otherUser.photoURL ? (
                        <Image src={convo.otherUser.photoURL} alt={convo.otherUser.name} fill className="rounded-full object-cover" />
                      ) : (
                        <UserCircle className="w-12 h-12 text-zinc-600 bg-zinc-900 rounded-full" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-white font-medium truncate">{convo.otherUser.name}</h3>
                      <p className="text-zinc-400 text-xs truncate">Proyecto: {convo.projectTitle}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`w-full md:w-2/3 flex flex-col bg-zinc-900/40 backdrop-blur-md h-full ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setActiveChat(null)}>
                      ← Volver
                    </button>
                    <div className="flex flex-col">
                      <h3 className="text-white font-bold">{activeChat.otherUser.name}</h3>
                      <span className="text-xs text-zinc-400 truncate max-w-[200px] md:max-w-sm">Proyecto: {activeChat.projectTitle}</span>
                    </div>
                  </div>
                  <Link href={`/perfil/${activeChat.creatorId === user?.uid ? activeChat.applicantId : activeChat.creatorId}`} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg transition-colors border border-zinc-700">
                    Ver Perfil
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                      <MessageSquare className="h-8 w-8 opacity-50" />
                      <p className="text-sm">No hay mensajes aún. ¡Rompe el hielo!</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.senderId === user?.uid;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'bg-[#E60000] text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'}`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 backdrop-blur-md">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-grow bg-zinc-900 border border-zinc-700 rounded-full px-5 py-3 text-white focus:outline-none focus:border-[#E60000] transition-colors placeholder:text-zinc-500 text-sm"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-[#E60000] hover:bg-red-700 text-white p-3 rounded-full disabled:opacity-50 transition-colors shadow-md">
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-zinc-600 gap-4">
                <MessageSquare className="h-12 w-12 opacity-30" />
                <p className="text-sm font-medium">Selecciona una conversación para empezar a chatear.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
