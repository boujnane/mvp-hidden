"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./FirbaseAuthProvider";
import { Spinner } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initializing } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!initializing && user === null && !redirecting) {
      setRedirecting(true);
      router.replace("/login");
    }
  }, [user, initializing, redirecting, router]);

  if (initializing || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="3" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
