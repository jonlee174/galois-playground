import FitMath from "./math/FitMath";
import MathDisplay, { Rationals } from "./math/MathDisplay";
import { Card, CardContent, Panel, SectionTitle } from "./ui/primitives";

const Mark = ({ value }) => (
  <span
    className={`w-3 h-3 shrink-0 border ${
      value === true ? "bg-accent-400 border-accent-400" : value === false ? "border-gray-500" : "border-gray-700 border-dashed"
    }`}
  />
);

const PropertyTile = ({ label, value, explanation }) => (
  <Panel>
    <div className="flex items-center gap-2 mb-1.5">
      <Mark value={value} />
      <h4 className="text-sm text-gray-100">{label}</h4>
      <span className="ml-auto text-sm text-accent-300 uppercase tracking-wider">
        {value === null || value === undefined ? "Unknown" : value ? "Yes" : "No"}
      </span>
    </div>
    {explanation && <p className="text-xs text-gray-500 leading-relaxed">{explanation}</p>}
  </Panel>
);

export default function GroupPropertiesCard({ galoisGroup }) {
  if (!galoisGroup) return null;

  const {
    is_abelian,
    is_solvable,
    transitive_label,
    discriminant,
    discriminant_latex,
    is_square_discriminant,
    polynomial_degree,
  } = galoisGroup;

  const hasAnyProperty =
    is_abelian !== undefined || is_solvable !== undefined || transitive_label || discriminant !== undefined;
  if (!hasAnyProperty) return null;

  const An = <MathDisplay inline>{`A_{${polynomial_degree ?? "n"}}`}</MathDisplay>;

  return (
    <Card>
      <CardContent>
        <SectionTitle>Group &amp; field properties</SectionTitle>

        <div className="grid sm:grid-cols-2 gap-3">
          <PropertyTile
            label="Solvable by radicals"
            value={is_solvable}
            explanation={
              is_solvable === false
                ? "By the Abel–Ruffini theorem, no formula using +, −, ×, ÷ and radicals can express the roots."
                : "The Galois group is solvable, so the roots can in principle be written using nested radicals."
            }
          />

          <PropertyTile
            label="Abelian"
            value={is_abelian}
            explanation={
              is_abelian
                ? "Every pair of automorphisms in the group commutes."
                : "At least two automorphisms in the group don't commute."
            }
          />

          <Panel>
            <h4 className="text-sm text-gray-100 mb-1.5">Discriminant</h4>
            <div className="text-gray-100">
              {discriminant_latex || discriminant ? (
                <FitMath align="left">{`\\Delta = ${discriminant_latex || discriminant}`}</FitMath>
              ) : (
                "Unknown"
              )}
            </div>
            {is_square_discriminant !== null && is_square_discriminant !== undefined && (
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                {is_square_discriminant ? (
                  <>
                    A perfect square in <Rationals />, so the Galois group lies inside {An} (even permutations only).
                  </>
                ) : (
                  <>
                    Not a perfect square in <Rationals />, so the Galois group contains odd permutations and is not a
                    subgroup of {An}.
                  </>
                )}
              </p>
            )}
          </Panel>

          {transitive_label && (
            <Panel>
              <h4 className="text-sm text-gray-100 mb-1.5">Transitive group</h4>
              <p className="text-accent-300 tracking-wider">{transitive_label}</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Label in the catalogue of transitive permutation groups (degree T index), used to identify Galois
                groups of number fields.
              </p>
            </Panel>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
