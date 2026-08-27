const GRADES = [
  { value: "primary-1", label: "\u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A" },
  { value: "primary-2", label: "\u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A" },
  { value: "primary-3", label: "\u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A" },
  { value: "primary-4", label: "\u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A" },
  { value: "primary-5", label: "\u0627\u0644\u062E\u0627\u0645\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A" },
  { value: "primary-6", label: "\u0627\u0644\u0633\u0627\u062F\u0633 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A" },
  { value: "prep-1", label: "\u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A" },
  { value: "prep-2", label: "\u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A" },
  { value: "prep-3", label: "\u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u064A" },
  { value: "sec-1", label: "\u0627\u0644\u0623\u0648\u0644 \u0627\u0644\u062B\u0627\u0646\u0648\u064A" },
  { value: "sec-2", label: "\u0627\u0644\u062B\u0627\u0646\u064A \u0627\u0644\u062B\u0627\u0646\u0648\u064A" },
  { value: "sec-3", label: "\u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u062B\u0627\u0646\u0648\u064A" }
];
const gradeLabel = (value) => GRADES.find((g) => g.value === value)?.label || value || "";

// المواد اللي المدرس يقدر يختار تخصّصه منها وقت التسجيل
const SUBJECTS = [
  "الرياضيات",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "اللغة العربية",
  "اللغة الإنجليزية",
  "التاريخ",
  "الجغرافيا",
  "الفلسفة والمنطق",
  "الجيولوجيا",
];
const MATERIAL_TYPES = [
  { value: "pdf", label: "\u0645\u0644\u0641 PDF" },
  { value: "video", label: "\u0641\u064A\u062F\u064A\u0648" },
  { value: "graphic", label: "\u062C\u0631\u0627\u0641\u064A\u0643 \u062A\u0648\u0636\u064A\u062D\u064A" }
];
export {
  GRADES,
  MATERIAL_TYPES,
  SUBJECTS,
  gradeLabel
};
