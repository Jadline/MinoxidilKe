import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

function getInitialUser() {
  const token = localStorage.getItem("userToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (err) {
    console.error("Invalid token in userStore", err);
    localStorage.removeItem("userToken");
    return null;
  }
}

export const useUserStore = create((set) => ({
  currentUser: getInitialUser(),
  setCurrentUser: (user) => set({ currentUser: user }),
  clearCurrentUser: () => set({ currentUser: null }),
}));
