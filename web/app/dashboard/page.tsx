import Dashboard from "@/components/Dashboard";

export default function Page() {
  return (
    <section>
      <h1>Dashboard</h1>
      <p className="muted">
        Investigations ranked for your mission atmosphere. Open one to see its tests and source rows.
      </p>
      <Dashboard />
    </section>
  );
}
