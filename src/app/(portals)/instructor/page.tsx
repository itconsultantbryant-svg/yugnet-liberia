import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Instructor Dashboard",
};

export default function InstructorDashboardPage() {
  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <Logo size="md" href={false} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Instructor
          </p>
          <h1 className="font-display text-3xl font-bold text-ink">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Course delivery tools — rosters, attendance, grade submission, and online
            class scheduling (Phases 9–10).
          </p>
        </div>
      </div>
      <p className="text-sm text-muted">
        Assigned courses and pending tasks will load here once auth and course
        assignment are live.
      </p>
    </div>
  );
}
