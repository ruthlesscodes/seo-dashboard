import Link from "next/link";

export default async function PreviewSlugPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolved = await params;
  const slug = Array.isArray(resolved?.slug) ? resolved.slug : [];
  const first = slug[0];
  const name = first ? first.charAt(0).toUpperCase() + first.slice(1).replace(/-/g, " ") : "Page";

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{name}</h1>
        <p className="text-sm text-muted-foreground">Preview — sign in to use this page</p>
      </div>
      <div className="rounded-[6px] border border-border bg-card p-8 text-center text-muted-foreground">
        <p>This is a preview of the page layout.</p>
        <Link href="/preview" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
