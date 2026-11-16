import { Languages } from "lucide-react";
import { useAdminI18n } from "./i18n";

function LanguageSwitcher() {
  const { language, setLanguage } = useAdminI18n();
  const nextLanguage = language === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={nextLanguage === "en" ? "Switch to English" : "التبديل إلى العربية"}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
    >
      <Languages className="h-4 w-4" />
      {nextLanguage === "en" ? "English" : "العربية"}
    </button>
  );
}

export default LanguageSwitcher;
