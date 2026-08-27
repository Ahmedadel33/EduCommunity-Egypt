import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import AuthForm from "../features/auth/AuthForm";
const Auth = () => {
  return <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-4"><Link to="/" className="flex items-center gap-2 mb-6"><div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center"><GraduationCap className="w-6 h-6 text-accent-foreground" /></div><span className="text-lg font-display font-bold text-foreground">مجتمع مصر التعليمي</span></Link><AuthForm /></div>;
};
var Auth_default = Auth;
export {
  Auth_default as default
};
