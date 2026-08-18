import MathDisplay from "./math/MathDisplay";
import { Card, CardContent } from "./ui/primitives";
import { CheckCircleIcon, LatticeIcon, XCircleThinIcon } from "./icons";

const PropertyTile = ({ label, isTrue, trueLabel, falseLabel, explanation }) => (
  <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-800">
    <div className="flex items-center gap-2 mb-1.5">
      {isTrue === null || isTrue === undefined ? (
        <span className="w-5 h-5 shrink-0 rounded-full border border-gray-700" />
      ) : isTrue ? (
        <CheckCircleIcon className="w-5 h-5 shrink-0 text-accent-400" />
      ) : (
        <XCircleThinIcon className="w-5 h-5 shrink-0 text-gray-500" />
      )}
      <h4 className="font-semibold text-gray-100 text-sm">{label}</h4>
    </div>
    <p className="text-sm text-gray-200 font-medium">
      {isTrue === null || isTrue === undefined ? "Unknown" : isTrue ? trueLabel : falseLabel}
    </p>
    {explanation && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{explanation}</p>}
  </div>
);

export default function GroupPropertiesCard({ galoisGroup }) {
  if (!galoisGroup) return null;

  const { is_abelian, is_solvable, transitive_label, discriminant, is_square_discriminant, polynomial_degree } =
    galoisGroup;

  const hasAnyProperty =
    is_abelian !== undefined || is_solvable !== undefined || transitive_label || discriminant !== undefined;
  if (!hasAnyProperty) return null;

  return (
    <Card className="shadow-xl border border-gray-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <LatticeIcon className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-gray-100">Group &amp; Field Properties</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <PropertyTile
            label="Solvable by radicals"
            isTrue={is_solvable}
            trueLabel="Yes"
            falseLabel="No"
            explanation={
              is_solvable === false
                ? "By the Abel–Ruffini theorem, no formula using +, −, ×, ÷, and radicals can express the roots."
                : "The Galois group is a solvable group, so the roots can in principle be written using nested radicals."
            }
          />

          <PropertyTile
            label="Abelian"
            isTrue={is_abelian}
            trueLabel="Yes"
            falseLabel="No"
            explanation={
              is_abelian
                ? "Every pair of automorphisms in the group commutes."
                : "At least two automorphisms in the group don't commute."
            }
          />

          <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-800">
            <h4 className="font-semibold text-gray-100 text-sm mb-1.5">Discriminant</h4>
            <p className="text-sm text-gray-200 font-mono break-all">
              {discriminant !== null && discriminant !== undefined ? discriminant : "Unknown"}
            </p>
            {is_square_discriminant !== null && is_square_discriminant !== undefined && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {is_square_discriminant ? (
                  <>
                    A perfect square in ℚ, so the Galois group lies inside{" "}
                    <MathDisplay inline>{`A_{${polynomial_degree ?? "n"}}`}</MathDisplay> (even permutations only).
                  </>
                ) : (
                  <>
                    Not a perfect square in ℚ, so the Galois group contains odd permutations and is not a
                    subgroup of <MathDisplay inline>{`A_{${polynomial_degree ?? "n"}}`}</MathDisplay>.
                  </>
                )}
              </p>
            )}
          </div>

          {transitive_label && (
            <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-800">
              <h4 className="font-semibold text-gray-100 text-sm mb-1.5">Transitive Group Classification</h4>
              <p className="text-sm text-gray-200 font-mono">{transitive_label}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Label from the transitive permutation group catalogue (degree T index), used to identify Galois
                groups of number fields.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
