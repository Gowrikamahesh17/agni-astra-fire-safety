import GapsView from "@/components/GapsView";

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
