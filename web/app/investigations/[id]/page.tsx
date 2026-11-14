import { Suspense } from "react";

async function Investigation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <h1>Investigation {id}</h1>;
}

export default function Page({ params }: PageProps<"/investigations/[id]">) {
  return (
    <section>
      <Suspense fallback={<h1>Investigation</h1>}>
        <Investigation params={params} />
      </Suspense>
      <p className="muted">Coming soon.</p>
    </section>
  );
}
