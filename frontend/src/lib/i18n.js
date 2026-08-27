import { useAuth } from "../context/AuthContext";

const messages = {
  ar: {
    home: "الرئيسية", materials: "المواد", lessons: "الدروس أونلاين", challenges: "المسابقات",
    softSkills: "المهارات الناعمة", chat: "الشات", community: "المجتمع", profile: "ملفي",
    rewards: "المكافآت", leaderboard: "المتصدرون", teachers: "المدرسون", settings: "الإعدادات",
    help: "المساعدة", logout: "تسجيل الخروج", visitor: "زائر", search: "ابحث عن مادة تعليمية... (اضغط Enter)",
    teacher: "معلم", admin: "مدير النظام", student: "طالب", settingsTitle: "الإعدادات",
    settingsDescription: "قم بتحديث ملفك الشخصي وتخصيص تجربتك التعليمية",
    profileTab: "الملف الشخصي", accountTab: "الحساب", notificationsTab: "الإشعارات",
    privacyTab: "الخصوصية", languageTab: "اللغة والمظهر",
  },
  en: {
    home: "Home", materials: "Materials", lessons: "Online lessons", challenges: "Challenges",
    softSkills: "Soft skills", chat: "Chat", community: "Community", profile: "My profile",
    rewards: "Rewards", leaderboard: "Leaderboard", teachers: "Teachers", settings: "Settings",
    help: "Help", logout: "Log out", visitor: "Guest", search: "Search educational materials... (press Enter)",
    teacher: "Teacher", admin: "Administrator", student: "Student", settingsTitle: "Settings",
    settingsDescription: "Update your profile and personalize your learning experience",
    profileTab: "Profile", accountTab: "Account", notificationsTab: "Notifications",
    privacyTab: "Privacy", languageTab: "Language and appearance",
  },
};

export function useI18n() {
  const { user } = useAuth();
  const language = user?.preferences?.language || localStorage.getItem("language") || "ar";
  const dictionary = messages[language] || messages.ar;
  return { language, t: (key) => dictionary[key] || messages.ar[key] || key };
}

export default messages;
