"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, serverTimestamp, orderBy, doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Send, MessageSquare } from "lucide-react";
import InitialsAvatar from "@/components/InitialsAvatar";
import Link from "next/link";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { reportClientError } from "@/lib/error-logger";

interface UserData {
  name: string;
}

interface Conversation {
  id: string;
  applicantId: string;
  creatorId: string;
  projectTitle: string;
  status: string;
  otherUser: UserData;
  createdAt?: any;
  lastMessageAt?: any;
  lastMessageSenderId?: string;
  lastReadByApplicant?: any;
  lastReadByCreator?: any;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
}

function getTimestampMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  return 0;
}

function hasUnreadMessages(convo: Conversation, currentUserId: string): boolean {
  if (!convo.lastMessageAt || !convo.lastMessageSenderId) return false;
  if (convo.lastMessageSenderId === currentUserId) return false;

  const isCreator = convo.creatorId === currentUserId;
  const lastRead = isCreator ? convo.lastReadByCreator : convo.lastReadByApplicant;

  if (!lastRead) return true;

  return getTimestampMillis(convo.lastMessageAt) > getTimestampMillis(lastRead);
}

export default function Mensajes() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const qApplicant = query(collection(db, "applications"), where("applicantId", "==", user.uid));
    const qCreator = query(collection(db, "applications"), where("creatorId", "==", user.uid));

    let applicantDocs: any[] = [];
    let creatorDocs: any[] = [];
    const usersCache = new Map<string, UserData>();

    const updateConversationsList = async () => {
      try {
        const allConvos = [...applicantDocs, ...creatorDocs];
        const uniqueConvosMap = new Map<string, any>();
        for (const item of allConvos) {
          uniqueConvosMap.set(item.id, item);
        }
        const uniqueConvos = Array.from(uniqueConvosMap.values());

        const enhancedConvos = await Promise.all(uniqueConvos.map(async (convo: any) => {
          const otherUserId = convo.creatorId === user.uid ? convo.applicantId : convo.creatorId;
          let otherUserData = usersCache.get(otherUserId);
          if (!otherUserData) {
            const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
            const otherData = otherUserDoc.exists() ? otherUserDoc.data() : null;
            otherUserData = {
              name: otherData?.name || t("messages.unknownUser"),
            };
            usersCache.set(otherUserId, otherUserData);
          }

          return {
            ...convo,
            otherUser: otherUserData
          } as Conversation;
        }));

        enhancedConvos.sort((a, b) => {
          const timeA = getTimestampMillis(a.lastMessageAt) || getTimestampMillis(a.createdAt);
          const timeB = getTimestampMillis(b.lastMessageAt) || getTimestampMillis(b.createdAt);
          return timeB - timeA;
        });

        setConversations(enhancedConvos);
        if (typeof window !== "undefined") {
          const requestedChatId = new URLSearchParams(window.location.search).get("chat");
          if (requestedChatId) {
            const matched = enhancedConvos.find((c) => c.id === requestedChatId);
            if (matched) {
              setActiveChat((prev) => prev || matched);
            }
          }
        }
      } catch (error) {
        reportClientError("messages_update_conversations", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubApp = onSnapshot(qApplicant, (snapshot) => {
      applicantDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      updateConversationsList();
    }, (err) => {
      reportClientError("messages_listen_applicant", err);
      setLoading(false);
    });

    const unsubCreator = onSnapshot(qCreator, (snapshot) => {
      creatorDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      updateConversationsList();
    }, (err) => {
      reportClientError("messages_listen_creator", err);
      setLoading(false);
    });

    return () => {
      unsubApp();
      unsubCreator();
    };
  }, [user, t]);

  useEffect(() => {
    if (!activeChat || !user) return;

    const isCreator = activeChat.creatorId === user.uid;
    const readField = isCreator ? "lastReadByCreator" : "lastReadByApplicant";
    updateDoc(doc(db, "applications", activeChat.id), {
      [readField]: serverTimestamp()
    }).catch(err => console.error("Error updating read status:", err));

    const q = query(
      collection(db, "applications", activeChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && lastMsg.senderId !== user.uid) {
        updateDoc(doc(db, "applications", activeChat.id), {
          [readField]: serverTimestamp()
        }).catch(err => console.error("Error updating read status on new message:", err));
      }
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [activeChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user || sending) return;

    const msgText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const isCreator = activeChat.creatorId === user.uid;
      const readField = isCreator ? "lastReadByCreator" : "lastReadByApplicant";
      const batch = writeBatch(db);
      const newMsgRef = doc(collection(db, "applications", activeChat.id, "messages"));
      const appRef = doc(db, "applications", activeChat.id);

      batch.set(newMsgRef, {
        text: msgText,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });
      batch.update(appRef, {
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: user.uid,
        [readField]: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      reportClientError("messages_send", error);
      setNewMessage(msgText);
      toast.error(t("messages.sendError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-transparent flex-grow flex flex-col relative z-10 h-[calc(100vh-5rem)] md:h-[calc(100dvh-5rem)] max-h-[calc(100dvh-5rem)] min-h-[500px] p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full flex-grow flex overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/60 backdrop-blur-md">
          
          {/* Sidebar */}
          <div className={`w-full md:w-1/3 bg-zinc-950/80 backdrop-blur-md border-r border-zinc-800 flex flex-col h-full ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">{t("messages.title")}</h2>
            </div>
            <div className="overflow-y-auto flex-grow custom-scrollbar">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E60000]"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  {t("messages.noConversationsTitle")}
                  <br /><br />
                  {t("messages.noConversationsDesc")}
                </div>
              ) : (
                conversations.map(convo => {
                  const isUnread = user ? hasUnreadMessages(convo, user.uid) : false;
                  return (
                    <div 
                      key={convo.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveChat(convo)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveChat(convo);
                        }
                      }}
                      className={`p-4 border-b border-zinc-800/50 cursor-pointer transition-colors flex items-center gap-3 focus:outline-none focus:bg-zinc-900/80 ${activeChat?.id === convo.id ? 'bg-zinc-900 border-l-2 border-l-[#E60000]' : 'hover:bg-zinc-900/50'}`}
                    >
                      <InitialsAvatar name={convo.otherUser.name} size={48} className="w-12 h-12 text-sm font-semibold" />
                      <div className="overflow-hidden flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-white font-medium truncate">{convo.otherUser.name}</h3>
                          {isUnread && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E60000] shrink-0" title={t("messages.unreadTooltip")} />
                          )}
                        </div>
                        <p className="text-zinc-400 text-xs truncate">{t("messages.projectPrefix")}: {convo.projectTitle}</p>
                      </div>
                    </div>
                  );
                })
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
                      {t("messages.back")}
                    </button>
                    <div className="flex flex-col">
                      <h3 className="text-white font-bold">{activeChat.otherUser.name}</h3>
                      <span className="text-xs text-zinc-400 truncate max-w-[200px] md:max-w-sm">{t("messages.projectPrefix")}: {activeChat.projectTitle}</span>
                    </div>
                  </div>
                  <Link href={`/perfil/${activeChat.creatorId === user?.uid ? activeChat.applicantId : activeChat.creatorId}`} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg transition-colors border border-zinc-700">
                    {t("messages.viewProfile")}
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                      <MessageSquare className="h-8 w-8 opacity-50" />
                      <p className="text-sm">{t("messages.emptyChat")}</p>
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
                      placeholder={t("messages.inputPlaceholder")}
                      maxLength={1000}
                      className="flex-grow bg-zinc-900 border border-zinc-700 rounded-full px-5 py-3 text-white focus:outline-none focus:border-[#E60000] transition-colors placeholder:text-zinc-500 text-sm"
                    />
                    <button type="submit" disabled={!newMessage.trim() || sending} className="bg-[#E60000] hover:bg-red-700 text-white p-3 rounded-full disabled:opacity-50 transition-colors shadow-md">
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-zinc-600 gap-4">
                <MessageSquare className="h-12 w-12 opacity-30" />
                <p className="text-sm font-medium">{t("messages.selectConversation")}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
