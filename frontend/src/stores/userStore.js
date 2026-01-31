import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

function getInitialUser() {
  const token = localStorage.getItem("userToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const role = decoded.role || "user";
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role,
      isAdmin: role === "admin",
    };
  } catch (err) {
    console.error("Invalid token in userStore", err);
    localStorage.removeItem("userToken");
    return null;
  }
}

function toStoreUser(apiUser) {
  const role = apiUser?.role || "user";
  return apiUser
    ? {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name ?? apiUser.firstName,
        role,
        isAdmin: role === "admin",
      }
    : null;
}

export const useUserStore = create((set) => ({
  currentUser: getInitialUser(),
  setCurrentUser: (user) => set({ currentUser: toStoreUser(user) ?? user }),
  clearCurrentUser: () => {
    localStorage.removeItem("userToken");
    set({ currentUser: null });
  },
  setTokenAndUser: (token, user) => {
    if (token) localStorage.setItem("userToken", token);
    set({ currentUser: toStoreUser(user) ?? getInitialUser() });
  },
}));
