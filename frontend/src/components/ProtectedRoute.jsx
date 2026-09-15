import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck } from "lucide-react";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ShieldCheck className="text-[#e60012] animate-pulse" size={40} />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "dealer" ? "/dealer" : "/app"} replace />;
  }
  return children;
}
