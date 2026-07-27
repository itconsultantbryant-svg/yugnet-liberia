import { redirect } from "next/navigation";

export default function LoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  return redirectLogin(searchParams);
}

async function redirectLogin(
  searchParams: Promise<{ next?: string; error?: string }>,
) {
  const params = await searchParams;
  const q = new URLSearchParams();
  if (params.next) q.set("next", params.next);
  if (params.error) q.set("error", params.error);
  const qs = q.toString();
  redirect(`/training/login${qs ? `?${qs}` : ""}`);
}
