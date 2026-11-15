import { meterOpacity, meterScale, meterWords } from "@/lib/flame";

/**
 * The prediction as a flame: it burns large and bright when the flame is likely to survive, and shrinks and dims as the chance of it going out rises.
 * The words underneath say the same thing, so the picture is never the only signal.
 */
export default function FlameMeter({ probability, unreliable }: { probability: number; unreliable: boolean }) {
  const s = meterScale(probability);
  const out = probability > 0.8;
  return (
    <figure className={`fm${unreliable ? " unreliable" : ""}`}>
      <svg viewBox="0 0 220 190" aria-hidden="true">
        <defs>
          <filter id="fm-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <g transform="translate(110 100)">
          <g className="fm-flame" style={{ transform: `scale(${s.toFixed(3)})`, opacity: meterOpacity(probability) }}>
            <circle r="78" fill="#2f6bff" opacity=".32" filter="url(#fm-blur)" />
            <circle r="62" fill="#4d84ff" />
            <circle r="34" fill="#c7e1ff" />
          </g>
          <g className="fm-smoke" style={{ opacity: out ? Math.min(1, (probability - 0.8) * 5) : 0 }} stroke="#8f9bbf" fill="none" strokeWidth="3" strokeLinecap="round">
            <path d="M-8 22c-12-24 14-34 0-60" />
            <path d="M7 18c12-22-12-36 2-58" />
          </g>
        </g>
      </svg>
      <figcaption>{meterWords(probability)}</figcaption>
    </figure>
  );
}
