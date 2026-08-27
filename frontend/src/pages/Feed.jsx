import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, FileText, Send, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// ألوان بطاقة الدور (طالب / معلم / مدير)
const ROLE_META = {
  student: { label: "طالب", color: "bg-blue-50 text-blue-600" },
  teacher: { label: "معلم", color: "bg-teal-50 text-teal-600" },
  admin: { label: "مدير", color: "bg-slate-100 text-slate-600" },
};

// صفحة المجتمع التعليمي (المنشورات) — بالالتزام بتصميم الفيجما
const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // نجيب كل المنشورات من السيرفر
  const loadPosts = async () => {
    try {
      const res = await api.getPosts();
      setPosts(res.posts);
    } catch (e) {
      toast.error(e.message || "فشل تحميل المنشورات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // اختيار ملف للإرفاق مع المنشور
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // نشر منشور جديد (نص + ملف اختياري) عن طريق FormData
  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedFile) {
      toast.error("يرجى كتابة محتوى المنشور أو إرفاق ملف");
      return;
    }
    if (!user) {
      toast.error("يرجى تسجيل الدخول للنشر");
      return;
    }

    const formData = new FormData();
    formData.append("content", newPost);
    formData.append("subject", "عام");
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const res = await api.createPost(formData);
      setPosts([res.post, ...posts]);
      setNewPost("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("تم نشر المنشور بنجاح");
    } catch (e) {
      toast.error(e.message || "فشل النشر");
    }
  };

  // إعجاب / إلغاء إعجاب
  const toggleLike = async (id) => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول للتفاعل مع المنشورات");
      return;
    }
    try {
      const res = await api.likePost(id);
      setPosts(posts.map((p) => {
        if (p.id === id) {
          const liked = !p.liked_by.includes(user.id);
          const liked_by = liked ? [...p.liked_by, user.id] : p.liked_by.filter((uid) => uid !== user.id);
          return { ...p, likes: res.likes, liked_by };
        }
        return p;
      }));
    } catch (e) {
      toast.error(e.message || "حدث خطأ ما");
    }
  };

  // فتح / قفل قسم التعليقات وتحميلها
  const handleToggleComments = async (postId) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      setComments([]);
      return;
    }
    setOpenCommentsPostId(postId);
    setLoadingComments(true);
    try {
      const res = await api.getComments(postId);
      setComments(res.comments);
    } catch (e) {
      toast.error(e.message || "فشل تحميل التعليقات");
    } finally {
      setLoadingComments(false);
    }
  };

  // إضافة تعليق جديد
  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    if (!user) {
      toast.error("يرجى تسجيل الدخول للتعليق");
      return;
    }
    try {
      const res = await api.createComment(postId, commentText);
      setComments([...comments, res.comment]);
      setCommentText("");
      setPosts(posts.map((p) => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    } catch (e) {
      toast.error(e.message || "فشل إضافة التعليق");
    }
  };

  // نسخ رابط الصفحة للمشاركة
  const handleShare = () => {
    navigator.clipboard.writeText("http://localhost:5173/feed");
    toast.success("تم نسخ رابط المشاركة");
  };

  // أول حرف من اسم صاحب المنشور (للأفاتار)
  const getAvatarLetter = (name) => {
    return name ? name.trim().charAt(0) : "م";
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  };

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* الهيدر */}
      <div className="text-right">
        <h1 className="text-xl font-extrabold text-slate-800">المجتمع التعليمي</h1>
        <p className="text-xs text-slate-400 mt-1">شارك المعرفة مع زملائك ومعلميك</p>
      </div>

      {/* صندوق كتابة منشور جديد — يظهر للمستخدم المسجّل فقط */}
      {user && (
        <div className={`${card} p-5`}>
          <textarea
            placeholder="شارك ملخصاً أو سؤالاً أو مورداً تعليمياً..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full bg-[#F5F7FF] rounded-xl p-3 text-sm text-slate-700 placeholder:text-slate-400 resize-none min-h-[80px] outline-none border border-transparent focus:border-blue-200"
          />

          {/* خانة الملف مخفية وبنفتحها من زرار "إرفاق ملف" */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          />

          {/* اسم الملف المختار + زرار حذفه */}
          {selectedFile && (
            <div className="mt-2 flex items-center gap-2 p-2.5 bg-[#F5F7FF] rounded-xl border border-slate-100">
              <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs text-slate-600 truncate flex-1">{selectedFile.name}</span>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-rose-500 text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                <X className="w-3.5 h-3.5" /> حذف
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-3 py-2 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100"
            >
              <FileText className="w-4 h-4 text-blue-600" /> إرفاق ملف
            </button>
            <button
              onClick={handleCreatePost}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" /> نشر
            </button>
          </div>
        </div>
      )}

      {/* قائمة المنشورات */}
      {loading ? (
        <p className="text-sm text-slate-400 text-center py-10">جاري تحميل المنشورات...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10 bg-[#F5F7FF] rounded-2xl">لا يوجد منشورات حالياً. كن أول من ينشر!</p>
      ) : (
        posts.map((post) => {
          const isLiked = user ? post.liked_by.includes(user.id) : false;
          const role = ROLE_META[post.author_role] || ROLE_META.admin;
          const isCommentsOpen = openCommentsPostId === post.id;

          return (
            <div key={post.id} className={`${card} p-5`}>
              <div className="flex items-start gap-3">
                {/* أفاتار بأول حرف من الاسم */}
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-extrabold shrink-0">
                  {getAvatarLetter(post.author_name)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* اسم صاحب المنشور + دوره + وقت النشر */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-800">{post.author_name}</span>
                    <span className={`rounded-full text-[10px] font-bold px-2 py-0.5 ${role.color}`}>{role.label}</span>
                    <span className="text-[10px] text-slate-400 mr-auto">{formatTime(post.created_at)}</span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  {/* الملف المرفق مع المنشور */}
                  {post.file_url && (
                    <div className="mt-3 flex items-center gap-2 p-3 bg-[#F5F7FF] rounded-xl border border-slate-100">
                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 truncate flex-1">{post.file_url.split("/").pop()}</span>
                      <a
                        href={`http://localhost:5000${post.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs font-bold shrink-0 hover:underline"
                      >
                        تحميل
                      </a>
                    </div>
                  )}

                  {/* أزرار التفاعل: إعجاب / تعليقات / مشاركة */}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"}`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                      {post.likes}
                    </button>
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isCommentsOpen ? "text-teal-500" : "text-slate-400 hover:text-teal-500"}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors mr-auto"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* قسم التعليقات — يفتح لما نضغط على زرار التعليقات */}
                  {isCommentsOpen && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-extrabold text-slate-800 mb-2">التعليقات</h4>

                      {loadingComments ? (
                        <p className="text-xs text-slate-400">جاري تحميل التعليقات...</p>
                      ) : comments.length === 0 ? (
                        <p className="text-xs text-slate-400 bg-[#F5F7FF] p-3 rounded-xl">لا توجد تعليقات بعد.</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {comments.map((c) => (
                            <div key={c.id} className="p-3 bg-[#F5F7FF] rounded-xl">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-800">{c.author_name}</span>
                                <span className="text-[10px] text-slate-400">{formatTime(c.created_at)}</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed mt-1">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* خانة كتابة تعليق جديد */}
                      {user && (
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="اكتب تعليقاً..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-300"
                            onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                          >
                            تعليق
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Feed;
