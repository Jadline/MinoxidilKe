import { Navigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

export default function ProtectedRoute({ children }) {
  const currentUser = useUserStore((state) => state.currentUser);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
