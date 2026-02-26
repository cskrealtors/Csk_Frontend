import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AuthRedirect = () => {
  const { isUnauthorized, setIsUnauthorized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ correct

  useEffect(() => {
    const isPublicRoute = location.pathname.startsWith("/public");
    if (isUnauthorized) {
      if (!isPublicRoute) {
        setIsUnauthorized(false);
        navigate("/login", { replace: true });
      } else {
        setIsUnauthorized(false);
      }
    }
  }, [isUnauthorized, location.pathname, navigate, setIsUnauthorized]);

  return null;
};

export default AuthRedirect;
