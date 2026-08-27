import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, MessageSquare, Paperclip, Mic, Square, FileText, X, Download, Users, UserRound, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { gradeLabel } from "../../lib/grades";

// عنوان الباك عشان نكمّل روابط المرفقات المحلية (/uploads/..)
const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "");
function fileUrl(u) {
  if (!u) return "";
  return u.startsWith("http") ? u : BACKEND + u;
}

// شات الصف — لحظي عبر Socket.IO + تخزين الرسائل + مرفقات (صوت/صورة/ملف)
function ChatPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(user?.grade || user?.grades?.[0] || "sec-1");
  const [contacts, setContacts] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingName, setTypingName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const isStudent = user?.role === "student";
  const isGroupRoom = !room.startsWith("private:");
  const activeContact = contacts.find((contact) => contact.room === room);

  useEffect(() => {
    api.getChatContacts().then((data) => {
      const nextContacts = isStudent ? data.teachers || [] : data.students || [];
      setContacts(nextContacts);
      const requestedTeacher = searchParams.get("teacher");
      const teacher = isStudent && requestedTeacher
        ? nextContacts.find((contact) => String(contact.id) === requestedTeacher)
        : null;
      if (teacher) setRoom(teacher.room);
    }).catch(() => {});
  }, [isStudent, searchParams]);

  useEffect(() => {
    const defaultRoom = user?.grade || user?.grades?.[0];
    if (defaultRoom) setRoom(defaultRoom);
  }, [user?.grade, user?.grades]);

  // (1) نجيب سجل الرسائل المخزّنة كل ما نغيّر الغرفة
  useEffect(() => {
    api.getMessages(room).then((data) => setMessages(data.messages || [])).catch(() => {});
  }, [room]);

  // (2) الـ Socket: ندخل الغرفة ونسمع الأحداث
  useEffect(() => {
    if (!socket) return;
    socket.emit("join_room", room);
    const onNewMessage = (m) => { if (m.room === room) setMessages((prev) => [...prev, m]); };
    const onTyping = ({ name }) => { setTypingName(name); setTimeout(() => setTypingName(""), 2000); };
    const onSocketError = (message) => toast.error(message || "تعذر إرسال الرسالة");
    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onTyping);
    socket.on("error_message", onSocketError);
    return () => {
      socket.emit("leave_room", room);
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onTyping);
      socket.off("error_message", onSocketError);
    };
  }, [socket, room]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingName]);

  // نبعت رسالة (نص و/أو مرفق) عبر السوكت
  function emitMessage({ text = "", kind = "text", attachmentUrl = "", attachmentName = "", attachmentType = "" }) {
    if (!socket) return;
    socket.emit("send_message", { room, text, kind, attachmentUrl, attachmentName, attachmentType });
  }

  function sendText(e) {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    emitMessage({ text: text.trim() });
    setText("");
  }

  function handleTyping(e) {
    setText(e.target.value);
    if (socket) socket.emit("typing", room);
  }

  // نحدّد نوع المرفق من الـ mime
  function kindOf(mime) {
    if (mime?.startsWith("image/")) return "image";
    if (mime?.startsWith("audio/")) return "voice";
    return "file";
  }

  // رفع ملف (أي نوع) → بعد ما يترفع نبعت رسالة بالمرفق
  async function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await api.uploadChatFile(fd);
      emitMessage({ kind: kindOf(res.type), attachmentUrl: res.url, attachmentName: res.name, attachmentType: res.type });
    } catch (err) {
      toast.error(err.message || "فشل رفع الملف");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  // تسجيل صوتي: نبدأ/نوقف التسجيل، وبعد الإيقاف نرفعه ونبعته
  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => { if (ev.data.size) chunksRef.current.push(ev.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append("file", blob, "voice-" + Date.now() + ".webm");
          const res = await api.uploadChatFile(fd);
          emitMessage({ kind: "voice", attachmentUrl: res.url, attachmentName: res.name, attachmentType: res.type });
        } catch (err) {
          toast.error(err.message || "فشل رفع التسجيل");
        }
        setUploading(false);
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch (err) {
      toast.error("مش قادر أوصل للميكروفون — اسمح بالإذن");
    }
  }

  // رسم محتوى الرسالة حسب نوعها
  function renderBody(m, mine) {
    if (m.kind === "image" && m.attachmentUrl) {
      return <a href={fileUrl(m.attachmentUrl)} target="_blank" rel="noreferrer"><img src={fileUrl(m.attachmentUrl)} alt={m.attachmentName} className="rounded-lg max-w-full max-h-60 object-cover" /></a>;
    }
    if (m.kind === "voice" && m.attachmentUrl) {
      return <audio controls src={fileUrl(m.attachmentUrl)} className="max-w-[220px] sm:max-w-[260px]" />;
    }
    if (m.kind === "file" && m.attachmentUrl) {
      return (
        <a href={fileUrl(m.attachmentUrl)} target="_blank" rel="noreferrer" download
          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${mine ? "bg-white/15" : "bg-white"}`}>
          <FileText className="w-5 h-5 shrink-0" />
          <span className="text-xs truncate max-w-[160px]">{m.attachmentName || "ملف"}</span>
          <Download className="w-4 h-4 shrink-0" />
        </a>
      );
    }
    return <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>;
  }

  return (
    // ارتفاع متجاوب: بيملأ الشاشة تحت الهيدر على الموبايل والديسكتوب
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-8rem)]">
      {/* الهيدر */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0"><MessageSquare className="w-5 h-5" /></div>
          <div className="min-w-0"><h1 className="text-base sm:text-xl font-extrabold text-slate-800 truncate">{isGroupRoom ? "شات المجموعة" : isStudent ? `محادثة مع أ. ${activeContact?.name || "المدرس"}` : `محادثة مع ${activeContact?.name || "الطالب"}`}</h1><p className="text-[11px] sm:text-xs text-slate-400 truncate">{isGroupRoom ? `تكلّم مع زملائك في ${gradeLabel(room)}` : isStudent ? activeContact?.subject : gradeLabel(activeContact?.grade)}</p></div>
        </div>
      </div>

      {/* اختيار غرفة المجموعة أو محادثة مدرس مرتبطة بالصف */}
      {user?.role === "teacher" && (
        <form onSubmit={(e) => { e.preventDefault(); api.getChatContacts({ search: studentSearch }).then((data) => setContacts(data.students || [])).catch(() => {}); }} className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="ابحث عن طالب بالاسم أو البريد" className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs outline-none focus:border-blue-400" />
          </div>
          <button type="submit" className="rounded-xl bg-blue-600 text-white px-3 text-xs font-bold">بحث</button>
        </form>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(isStudent ? [user?.grade] : (user?.grades || [])).filter(Boolean).map((group) => (
          <button key={group} onClick={() => setRoom(group)} className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${room === group ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
            <Users className="w-4 h-4" /> {isStudent ? "مجموعة الصف" : gradeLabel(group)}
          </button>
        ))}
        {contacts.map((contact) => (
          <button key={contact.id} onClick={() => setRoom(contact.room)} className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${room === contact.room ? "bg-teal-500 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
            <UserRound className="w-4 h-4" />
            <span>{isStudent ? `أ. ${contact.name}` : contact.name}</span>
            {isStudent && contact.onDuty && <span className="w-1.5 h-1.5 rounded-full bg-green-300" />}
          </button>
        ))}
      </div>

      {/* الرسائل — بتاخد المساحة المتبقية وتعمل scroll */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4 overflow-y-auto flex flex-col gap-2.5">
        {messages.length === 0 && <p className="text-center text-slate-400 my-auto text-sm">لا توجد رسائل بعد. ابدأ الكلام!</p>}
        {messages.map((m) => {
          const mine = m.user?.id === user?.id;
          return (
            <div key={m.id || m._id} className={`max-w-[85%] sm:max-w-[75%] ${mine ? "self-start" : "self-end"}`}>
              <div className={`rounded-2xl px-3 py-2 ${mine ? "bg-blue-600 text-white" : "bg-[#F1F5F9] text-slate-800"}`}>
                {!mine && <p className="text-[11px] font-bold mb-0.5 text-slate-500">{m.user?.name}</p>}
                {renderBody(m, mine)}
                <p className={`text-[9px] mt-1 ${mine ? "text-white/60" : "text-slate-400"}`}>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
              </div>
            </div>
          );
        })}
        {typingName && <p className="text-[11px] text-slate-400 self-end">{typingName} بيكتب...</p>}
        <div ref={bottomRef} />
      </div>

      {/* شريط الإدخال + المرفقات */}
      <form onSubmit={sendText} className="flex items-center gap-1.5 sm:gap-2 mt-3">
        {/* رفع ملف بأي نوع */}
        <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 disabled:opacity-50 shrink-0" title="إرفاق ملف">
          <Paperclip className="w-4 h-4" />
        </button>
        {/* تسجيل صوتي */}
        <button type="button" onClick={toggleRecording} disabled={uploading}
          className={`p-2.5 rounded-xl border shrink-0 ${recording ? "bg-red-500 text-white border-red-500 animate-pulse" : "bg-white border-slate-200 text-slate-500 hover:text-blue-600"}`}
          title={recording ? "إيقاف التسجيل" : "تسجيل صوتي"}>
          {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <input value={text} onChange={handleTyping} placeholder={uploading ? "جاري الرفع..." : recording ? "بيسجّل..." : "اكتب رسالتك..."}
          className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="bg-blue-600 text-white font-bold px-3 sm:px-5 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0">
          <Send className="w-4 h-4" /> <span className="hidden sm:inline">إرسال</span>
        </button>
      </form>
    </div>
  );
}

export default ChatPage;
