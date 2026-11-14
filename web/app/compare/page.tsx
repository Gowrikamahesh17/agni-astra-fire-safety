import { Suspense } from "react";
import type { Metadata } from "next";
import CompareView from "@/components/CompareView";

export const metadata: Metadata = { title: "Compare" };

export default function Page() {
  return (
    <section>
      <h1>Compare</h1>
      <p className="muted">
        Put two or three investigations side by side: what they tested, with which hardware and sensors, and where they differ.
      </p>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <CompareView />
      </Suspense>
    </section>
  );
}
