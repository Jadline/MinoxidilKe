import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

export default function ProtectedRoute({ children }) {
  const currentUser = useUserStore((state) => state.currentUser);
  const location = useLocation();

  if (!currentUser) {
    const redirectTo = `/login?redirect=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
}
