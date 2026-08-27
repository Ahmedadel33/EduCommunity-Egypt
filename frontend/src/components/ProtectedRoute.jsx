import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        جارٍ التحميل...
      </div>;
  }
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/feed" replace />;
  }
  return <>{children}</>;
};
var ProtectedRoute_default = ProtectedRoute;
export {
  ProtectedRoute_default as default
};
