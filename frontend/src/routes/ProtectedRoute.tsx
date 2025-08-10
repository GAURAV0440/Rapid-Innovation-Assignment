import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute: React.FC = () => {
  const location = useLocation();

  // Prefer AuthContext, but also trust a persisted token to avoid flicker/404
  let isAuthed = false;
  try {
    const { isAuthenticated } = useAuth();
    isAuthed = !!isAuthenticated;
  } catch {
    // if context isn't ready for any reason, fall back to token
  }

  if (!isAuthed) {
    const token = typeof window !== "undefined" ? localStorage.getItem("ace_token") : null;
    isAuthed = !!token;
  }

  return isAuthed ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default ProtectedRoute;