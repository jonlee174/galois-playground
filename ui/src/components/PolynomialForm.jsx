import MathDisplay, { Rationals } from "./math/MathDisplay";
import MathInput from "./math/MathInput";
import { Button, Card, CardContent, Spinner } from "./ui/primitives";
import { WarningIcon } from "./icons";

const EXAMPLES = ["x^2-2", "x^3-2", "x^4-10x^2+1", "x^4-2", "x^5-2", "x^4-x-1", "x^8-2"];

const Code = ({ children }) => <code className="bg-gray-900 border border-gray-800 px-1 text-accent-300">{children}</code>;

export default function PolynomialForm({
  polynomial,
  onPolynomialChange,
  computeSplittingField,
  onComputeSplittingFieldChange,
  loading,
  onSubmit,
}) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <label className="block text-lg text-gray-50">
          Enter a polynomial over <Rationals />
        </label>

        <MathInput
          placeholder="e.g. x^3-2, x^4-10x^2+1, 3x^2+2x+1"
          value={polynomial}
          onChange={(e) => onPolynomialChange(e.target.value)}
          onSubmit={onSubmit}
          className="text-lg"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-gray-500 mr-1">Try</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onPolynomialChange(ex)}
              className="px-2 py-1 border border-gray-800 bg-black text-gray-200 hover:border-accent-400 hover:text-accent-300 transition-colors duration-100"
            >
              <MathDisplay inline>{ex.replace(/\^(\d+)/g, "^{$1}")}</MathDisplay>
            </button>
          ))}
        </div>

        <label htmlFor="compute-splitting-field" className="flex items-center gap-3 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            id="compute-splitting-field"
            checked={computeSplittingField}
            onChange={(e) => onComputeSplittingFieldChange(e.target.checked)}
            className="peer sr-only"
          />
          <span className="w-4 h-4 shrink-0 border border-gray-500 bg-black flex items-center justify-center peer-checked:border-accent-400 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-accent-400">
            {computeSplittingField && <span className="w-2 h-2 bg-accent-400" />}
          </span>
          <span className="text-sm text-gray-300">
            Also compute the splitting field (slow for higher degrees)
          </span>
        </label>

        <div className="border-l-2 border-accent-400 bg-black p-4 text-sm text-gray-300 space-y-1.5">
          <p>
            <span className="text-gray-100">Natural input:</span> <Code>3x^2+2x+1</Code> works as well as{" "}
            <Code>3*x^2+2*x+1</Code>, and spaces are optional.
          </p>
          <p>
            <span className="text-gray-100">Supported:</span> any polynomial with rational coefficients of degree at
            most 11, e.g. <MathDisplay inline>{"x^n \\pm c"}</MathDisplay>,{" "}
            <MathDisplay inline>{"x^4 + ax^2 + b"}</MathDisplay>,{" "}
            <MathDisplay inline>{"a_nx^n + \\cdots + a_0"}</MathDisplay>.
          </p>
          <p className="text-accent-300 flex items-center gap-1.5">
            <WarningIcon className="w-4 h-4 shrink-0" />
            <span>
              The polynomial must be irreducible over <Rationals />.
            </span>
          </p>
        </div>

        <Button onClick={onSubmit} disabled={loading} className="w-full text-xl py-4 text-heavy">
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <Spinner className="w-4 h-4" />
              Computing…
            </span>
          ) : (
            "Compute"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
