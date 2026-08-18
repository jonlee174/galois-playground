import MathDisplay from "./math/MathDisplay";
import MathInput from "./math/MathInput";
import { Button, Card, CardContent } from "./ui/primitives";
import { WarningIcon } from "./icons";

export default function PolynomialForm({
  polynomial,
  onPolynomialChange,
  computeSplittingField,
  onComputeSplittingFieldChange,
  loading,
  onSubmit,
}) {
  return (
    <Card className="shadow-2xl border border-gray-800">
      <CardContent className="space-y-6 pt-8">
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-gray-100 mb-2">
            Enter a Polynomial over <MathDisplay inline>{"\\mathbb{Q}"}</MathDisplay>
          </label>
          <MathInput
            placeholder="e.g., x^2-2, x^3-8, x^4-16, x^2+1, 3x^2+2x+1"
            value={polynomial}
            onChange={(e) => onPolynomialChange(e.target.value)}
            className="text-lg"
          />

          <div className="mt-4 flex items-center">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="compute-splitting-field"
                checked={computeSplittingField}
                onChange={(e) => onComputeSplittingFieldChange(e.target.checked)}
                className="form-checkbox appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-gray-900 checked:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-0 cursor-pointer transition-colors duration-200"
                style={{
                  backgroundImage: computeSplittingField
                    ? "linear-gradient(to bottom right, #b78957, #875c34)"
                    : "none",
                  backgroundSize: "cover",
                }}
              />
              {computeSplittingField && (
                <svg
                  className="absolute pointer-events-none w-3 h-3 text-white left-1 top-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <label htmlFor="compute-splitting-field" className="ml-2 text-sm font-medium text-gray-300">
              Compute splitting field (may be time intensive for higher degree polynomials)
            </label>
          </div>

          <div className="bg-gray-900/70 rounded-lg p-4 border-l-4 border-accent-500 mt-4">
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <strong className="text-gray-100">Examples:</strong>{" "}
                <MathDisplay inline>{"x^2-2"}</MathDisplay>, <MathDisplay inline>{"x^3-2"}</MathDisplay>,{" "}
                <MathDisplay inline>{"x^4-10x^2+1"}</MathDisplay>, <MathDisplay inline>{"x^5-2"}</MathDisplay>,{" "}
                <MathDisplay inline>{"3x^2+2x+1"}</MathDisplay>
              </p>
              <p>
                <strong className="text-gray-100">Natural input:</strong> You can write{" "}
                <code className="bg-gray-800 px-1 rounded text-accent-300">3x^2+2x+1</code> instead of{" "}
                <code className="bg-gray-800 px-1 rounded text-accent-300">3*x^2+2*x+1</code> - multiplication
                signs are optional!
              </p>
              <p>
                <strong className="text-gray-100">Note:</strong> Spaces are optional - both "x^2-2" and "x^2 - 2"
                work perfectly!
              </p>
              <p>
                <strong className="text-gray-100">Supported:</strong> Any polynomial with rational coefficients,
                including:
              </p>
              <div className="ml-4 space-y-1">
                <p>
                  • Simple forms: <MathDisplay inline>{"x^n \\pm c"}</MathDisplay> (e.g.,{" "}
                  <MathDisplay inline>{"x^3-2, x^4+5"}</MathDisplay>)
                </p>
                <p>
                  • With coefficients: <MathDisplay inline>{"ax^n + bx^{n-1} + \\ldots"}</MathDisplay> (e.g.,{" "}
                  <MathDisplay inline>{"3x^3+2x^2-x+1"}</MathDisplay>)
                </p>
                <p>
                  • Quadratic-like: <MathDisplay inline>{"x^4 + ax^2 + b"}</MathDisplay> (e.g.,{" "}
                  <MathDisplay inline>{"x^4-10x^2+1"}</MathDisplay>)
                </p>
                <p className="text-accent-300 font-medium flex items-center gap-1.5">
                  <WarningIcon className="w-4 h-4 shrink-0" />
                  Polynomial must be irreducible over ℚ for Galois group computation
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={onSubmit} disabled={loading} className="w-full text-lg py-4">
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Computing Galois Group...</span>
            </div>
          ) : (
            "Compute Galois Group"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
