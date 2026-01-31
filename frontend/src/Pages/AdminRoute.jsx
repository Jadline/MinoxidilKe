import { Navigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

/**
 * Protects admin-only routes. Requires user to be logged in and have role 'admin'.
 * Redirects to /login if not authenticated, or to / if authenticated but not admin.
 */
export default function AdminRoute({ children }) {
  const currentUser = useUserStore((state) => state.currentUser);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (!currentUser.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
