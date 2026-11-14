import type { Metadata } from "next";
import ImplicationsView from "@/components/ImplicationsView";

export const metadata: Metadata = { title: "Implications" };

export default function Page() {
  return (
    <section>
      <h1>Implications</h1>
      <p className="muted">
        What the NASA tests suggest for fire prevention, detection and suppression, each with its evidence.
      </p>
      <ImplicationsView />
    </section>
  );
}
