import FitMath from "./FitMath";
import MathDisplay from "./MathDisplay";

// Backend decimals look like "-0.629961 + 1.091124i"; give the i a thin space in TeX.
const approxTex = (approx) => approx.replace(/(\d)i$/, "$1\\,i");

// Roots alpha_1..alpha_n as returned by the backend ({latex, approx} in the
// canonical order the lattice's permutations refer to), plus notes such as
// "zeta_5 = e^{2 pi i/5}" for any roots of unity used.
export default function RootList({ roots, notes = [], compact = false }) {
  if (!roots?.length) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {roots.map((r, k) => (
          <span key={k}>
            <MathDisplay inline>
              {r.latex ? `\\alpha_{${k + 1}} = ${r.latex}` : `\\alpha_{${k + 1}} \\approx ${approxTex(r.approx)}`}
            </MathDisplay>
          </span>
        ))}
        {notes.map((note) => (
          <span key={note} className="text-gray-500">
            <MathDisplay inline>{note}</MathDisplay>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ol className="space-y-1.5">
        {roots.map((r, k) => (
          <li
            key={k}
            className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 bg-gray-950 border border-gray-800 border-l-2 border-l-accent-400 px-3 py-1.5"
          >
            {/* \displaystyle: inline math would shrink fractions inside radicals (Cardano) to script size. */}
            <FitMath align="left" className="text-gray-50">
              {`\\displaystyle \\alpha_{${k + 1}} ${r.latex ? `= ${r.latex}` : `\\approx ${approxTex(r.approx)}`}`}
            </FitMath>
            {r.latex && (
              <span className="text-sm text-gray-500 sm:text-right">
                <MathDisplay inline>{`\\approx ${approxTex(r.approx)}`}</MathDisplay>
              </span>
            )}
          </li>
        ))}
      </ol>
      {notes.length > 0 && (
        <p className="text-xs text-gray-500">
          where{" "}
          {notes.map((note, i) => (
            <span key={note}>
              {i > 0 && ", "}
              <MathDisplay inline>{note}</MathDisplay>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
