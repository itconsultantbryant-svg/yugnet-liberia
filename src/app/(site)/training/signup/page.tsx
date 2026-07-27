import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Student Signup",
  description: "Create a YUGNet-Liberia student account and enroll in courses.",
};

export default function TrainingSignupPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-muted">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
