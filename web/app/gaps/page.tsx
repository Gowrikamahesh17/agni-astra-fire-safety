import type { Metadata } from "next";
import GapsView from "@/components/GapsView";

export const metadata: Metadata = { title: "Evidence gaps" };

export default function Page() {
  return (
    <section>
      <h1>Evidence gaps</h1>
      <p className="muted">
        Where NASA tested, and where it did not. Pick a mission scenario to see which tests came close to its atmosphere.
      </p>
      <GapsView />
    </section>
  );
}
