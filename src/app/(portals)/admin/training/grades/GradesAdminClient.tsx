import { Suspense } from "react";
import GradesAdminPage from "./GradesAdminClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading grades…</p>}>
      <GradesAdminPage />
    </Suspense>
  );
}
