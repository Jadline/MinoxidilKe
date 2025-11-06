import { Navigate } from "react-router-dom";
import { useProducts } from "../Contexts/productContext";

export default function ProtectedRoute({ children }) {
  const { currentUser } = useProducts();

  if (!currentUser) {
    
    return <Navigate to="/login" replace />;
  }

  return children; 
}
