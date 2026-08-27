import { useState, useEffect } from "react";
import { Trophy, Award, BookOpen, Target, Star, Calendar, CheckCircle, Beaker, PenTool, ShieldAlert, GraduationCap, School } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";

// الشارات المتاحة في المنصة
const defaultBadges = [
  { name: "بطل الأسبوع", icon: Trophy },
  { name: "مشارك نشط", icon: Award },
  { name: "صديق المجتمع", icon: Star },
  { name: "محب العلم", icon: Beaker },
  { name: "أول منشور", icon: PenTool },
];

// الملف الشخصي — بالالتزام بتصميم الفيجما
const Profile = () => {
  const { user } = useAuth();
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // نجيب التحديات + محاولات الطالب ونطابقهم مع بعض
  const loadProfileData = async () => {
    if (!user) return;
    try {
      const [challengesRes, subsRes] = await Promise.all([api.getChallenges(), api.getSubmissions()]);
      const chMap = new Map(challengesRes.challenges.map((c) => [c.id, c]));
      const mapped = subsRes.submissions.map((sub) => {
        const ch = chMap.get(sub.challengeId);
        return {
          title: ch ? ch.title : "تحدي غير معروف",
          points: ch ? ch.points : 0,
          date: new Date(sub.submittedAt).toLocaleDateString("ar-EG", { day: "numeric", month: "long" }),
        };
      });
      setCompletedChallenges(mapped);
    } catch (e) {
      toast.error(e.message || "حدث خطأ أثناء تحميل بيانات الملف الشخصي");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user]);

  // اسم الدور بالعربي
  const getRoleLabel = (role) => {
    if (role === "student") return "طالب";
    if (role === "teacher") return "معلم";
    if (role === "admin") return "مدير مدرسة";
    if (role === "supervisor") return "مشرف تعليمي";
    return "";
  };

  // اسم الصف بالعربي
  const getGradeLabel = (grade) => {
    if (!grade) return "";
    if (grade === "primary-1") return "الصف الأول الابتدائي";
    if (grade === "primary-2") return "الصف الثاني الابتدائي";
    if (grade === "primary-3") return "الصف الثالث الابتدائي";
    if (grade === "primary-4") return "الصف الرابع الابتدائي";
    if (grade === "primary-5") return "الصف الخامس الابتدائي";
    if (grade === "primary-6") return "الصف السادس الابتدائي";
    if (grade === "prep-1") return "الصف الأول الإعدادي";
    if (grade === "prep-2") return "الصف الثاني الإعدادي";
    if (grade === "prep-3") return "الصف الثالث الإعدادي";
    if (grade === "sec-1") return "الصف الأول الثانوي";
    if (grade === "sec-2") return "الصف الثاني الثانوي";
    if (grade === "sec-3") return "الصف الثالث الثانوي";
    return grade;
  };

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  // لازم يكون مسجّل دخول
  if (!user) {
    return (
      <div className={`max-w-md mx-auto text-center py-12 px-6 ${card}`}>
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-800 mt-4">الرجاء تسجيل الدخول</h2>
        <p className="text-sm text-slate-400 mt-2">الملف الشخصي متوفر للأعضاء المسجلين فقط.</p>
      </div>
    );
  }

  const points = user.points || 0;

  // المهارات بتتحسب من النقاط
  const skills = [
    { name: "الرياضيات", level: Math.min(Math.floor(points / 15), 100) },
    { name: "الفيزياء", level: Math.min(Math.floor(points / 20), 100) },
    { name: "اللغة العربية", level: Math.min(Math.floor(points / 12), 100) },
    { name: "الكيمياء", level: Math.min(Math.floor(points / 18), 100) },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* كارت البيانات الأساسية */}
      <div className={`${card} overflow-hidden`}>
        <div className="h-28 bg-blue-600" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4 flex-wrap sm:flex-nowrap">
            <div className="w-20 h-20 rounded-2xl bg-teal-500 flex items-center justify-center text-2xl font-extrabold text-white border-4 border-white shadow-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 pt-12 min-w-0 text-right">
              <h1 className="text-xl font-extrabold text-slate-800 truncate">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400 mt-1">
                {user.grade && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-blue-600" /> {getGradeLabel(user.grade)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <School className="w-4 h-4 text-blue-600" /> {user.schoolCode ? `مدرسة: ${user.schoolCode}` : "لا توجد مدرسة مضافة"}
                </span>
                <span className="rounded-full text-[10px] font-bold px-2 py-0.5 bg-[#EEF2FF] text-blue-700">{getRoleLabel(user.role)}</span>
              </div>
            </div>
            {/* النقاط */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-bold mt-4 sm:mt-0 shrink-0">
              <Trophy className="w-4 h-4 text-amber-500" /> {points} نقطة
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* المهارات التراكمية */}
        <div className={`${card} p-5`}>
          <h2 className="font-extrabold text-slate-800 flex items-center justify-end gap-2 mb-4">
            المهارات التراكمية <Target className="w-5 h-5 text-blue-600" />
          </h2>
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-blue-600">{skill.level}%</span>
                  <span className="text-slate-600">{skill.name}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${skill.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* شارات التكريم */}
        <div className={`${card} p-5`}>
          <h2 className="font-extrabold text-slate-800 flex items-center justify-end gap-2 mb-4">
            شارات التكريم <Award className="w-5 h-5 text-amber-500" />
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {defaultBadges.map((badge) => {
              const earned = user.badges?.includes(badge.name);
              const Icon = badge.icon;
              return (
                <div
                  key={badge.name}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center ${earned ? "bg-amber-100 border border-amber-200" : "bg-[#F5F7FF] opacity-40"}`}
                >
                  <Icon className={`w-7 h-7 ${earned ? "text-amber-500" : "text-slate-400"}`} />
                  <span className="text-[11px] font-bold text-slate-600">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* التحديات المكتملة */}
      <div className={`${card} p-5`}>
        <h2 className="font-extrabold text-slate-800 flex items-center justify-end gap-2 mb-4">
          التحديات المكتملة <CheckCircle className="w-5 h-5 text-teal-500" />
        </h2>
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-4">جاري تحميل التحديات المكتملة...</p>
        ) : completedChallenges.length === 0 ? (
          <p className="text-sm text-slate-400 bg-[#F5F7FF] p-4 rounded-xl text-center">
            لم تقم بحل أي تحديات بعد. انطلق إلى صفحة التحديات وابدأ المنافسة!
          </p>
        ) : (
          <div className="space-y-2">
            {completedChallenges.map((ch, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-[#F5F7FF] rounded-xl">
                <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-bold text-slate-800">{ch.title}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> تم الحل في: {ch.date}
                  </p>
                </div>
                <span className="text-sm font-bold text-amber-500 shrink-0">+{ch.points} نقطة</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
