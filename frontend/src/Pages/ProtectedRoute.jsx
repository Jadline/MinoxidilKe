import { Navigate } from "react-router-dom";
import { useProducts } from "../contexts/ProductContext";

export default function ProtectedRoute({ children }) {
  const { currentUser } = useProducts();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
