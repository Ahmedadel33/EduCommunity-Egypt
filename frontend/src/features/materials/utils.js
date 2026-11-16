import { resolveMediaUrl } from "../../lib/media";

const resolveFileUrl = resolveMediaUrl;
const subjectName = (m) => typeof m.subject === "object" && m.subject ? m.subject.name : "";
const uploaderName = (m) => typeof m.uploadedBy === "object" && m.uploadedBy ? m.uploadedBy.name : "";
const uploaderId = (m) => typeof m.uploadedBy === "object" && m.uploadedBy ? m.uploadedBy.id : String(m.uploadedBy);
export {
  resolveFileUrl,
  subjectName,
  uploaderId,
  uploaderName
};
