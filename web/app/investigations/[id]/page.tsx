import { Suspense } from "react";
import InvestigationView from "@/components/InvestigationView";

async function Loaded({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvestigationView id={decodeURIComponent(id)} />;
}

export default function Page({ params }: PageProps<"/investigations/[id]">) {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <Loaded params={params} />
    </Suspense>
  );
}
