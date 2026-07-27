import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Training Login",
  description: "Sign in to YUGNet-Liberia Training portals.",
};

export default function TrainingLoginPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
