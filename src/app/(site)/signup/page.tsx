import { redirect } from "next/navigation";

export default function SignupRedirect({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  return redirectSignup(searchParams);
}

async function redirectSignup(searchParams: Promise<{ course?: string }>) {
  const params = await searchParams;
  const q = params.course ? `?course=${encodeURIComponent(params.course)}` : "";
  redirect(`/training/signup${q}`);
}
