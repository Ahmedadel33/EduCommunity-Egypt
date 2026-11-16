import { Languages } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

function LanguageSwitcher({ className = "" }) {
  const { user, language, changeLanguage } = useAuth();
  const nextLanguage = language === "ar" ? "en" : "ar";

  async function handleChange() {
    changeLanguage(nextLanguage);
    if (!user) return;

    try {
      await api.updateMe({ preferences: { language: nextLanguage } });
    } catch (error) {
      toast.error(error.message || (nextLanguage === "en" ? "Could not save language preference." : "تعذر حفظ إعداد اللغة."));
    }
  }

  return (
    <button
      type="button"
      onClick={handleChange}
      aria-label={nextLanguage === "en" ? "Switch to English" : "التبديل إلى العربية"}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 ${className}`}
    >
      <Languages className="h-4 w-4" />
      {nextLanguage === "en" ? "English" : "العربية"}
    </button>
  );
}

export default LanguageSwitcher;
