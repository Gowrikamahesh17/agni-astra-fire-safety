import PredictView from "@/components/PredictView";

export default function Page() {
  return (
    <section>
      <h1>Predict</h1>
      <p className="muted">
        A what-if tool built on simple baseline models trained on the PSI tables. It always shows its limits and warns when you leave the
        range of the training data.
      </p>
      <PredictView />
    </section>
  );
}
