const BACKEND_ORIGIN = "http://localhost:5000";
const resolveFileUrl = (url) => url?.startsWith("http") ? url : `${BACKEND_ORIGIN}${url}`;
const subjectName = (m) => typeof m.subject === "object" && m.subject ? m.subject.name : "";
const uploaderName = (m) => typeof m.uploadedBy === "object" && m.uploadedBy ? m.uploadedBy.name : "";
const uploaderId = (m) => typeof m.uploadedBy === "object" && m.uploadedBy ? m.uploadedBy.id : String(m.uploadedBy);
export {
  BACKEND_ORIGIN,
  resolveFileUrl,
  subjectName,
  uploaderId,
  uploaderName
};
