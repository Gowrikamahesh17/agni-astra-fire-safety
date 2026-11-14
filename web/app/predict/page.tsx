import type { Metadata } from "next";
import PredictView from "@/components/PredictView";
import HowTo from "@/components/HowTo";

export const metadata: Metadata = { title: "Predict" };

export default function Page() {
  return (
    <section>
      <h1>Predict</h1>
      <p className="muted">
        A what-if tool built on simple baseline models trained on the PSI tables. It always shows its limits and warns when you leave the
        range of the training data.
      </p>
      <HowTo>
        <ol>
          <li>Pick a question. Each model was fitted to one NASA table.</li>
          <li>Move the sliders, or press <strong>Use selected scenario</strong> to copy a mission atmosphere into the oxygen and pressure inputs.</li>
          <li>Read the estimate, then check <strong>How much to trust it</strong>. If an input is outside the range the model was trained on, the number is greyed out and flagged.</li>
        </ol>
      </HowTo>
      <PredictView />
    </section>
  );
}
