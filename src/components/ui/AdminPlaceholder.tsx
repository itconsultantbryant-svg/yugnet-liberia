export default function AdminPlaceholder({
  title = "Coming soon",
  blurb = "This module ships in a later phase.",
}: {
  title?: string;
  blurb?: string;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-muted">{blurb}</p>
    </div>
  );
}
