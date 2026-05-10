import React, { FC } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"Admin" | "User">;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.isAdmin ? "Admin" : "User")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
