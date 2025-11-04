// app/dashboard/main/page.jsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardContent from "@/components/DashboardContent";

export default function DashboardMain() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!user) return null;

  return <DashboardContent />;
}