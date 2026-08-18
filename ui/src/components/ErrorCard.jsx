import MathDisplay from "./math/MathDisplay";
import { Button, Card, CardContent } from "./ui/primitives";
import { ErrorIcon, OfflineIcon, WarningIcon } from "./icons";

export default function ErrorCard({ error, onDismiss }) {
  return (
    <Card className="shadow-2xl border-2 border-red-900/60 animate-fadeIn">
      <CardContent className="pt-8">
        <div className="text-center space-y-4">
          {error.type === "reducible" ? (
            <>
              <WarningIcon className="w-10 h-10 mx-auto text-accent-400" />
              <h2 className="text-2xl font-bold text-accent-300 mb-4">Reducible Polynomial Detected</h2>
              <div className="bg-gray-900/60 border-l-4 border-accent-500 p-6 rounded-lg text-left">
                <div className="space-y-3">
                  <div className="text-gray-200">
                    <strong className="text-gray-100">Input polynomial:</strong>
                    <div className="text-center p-2 bg-black/40 rounded border border-gray-800 mt-2">
                      <MathDisplay>{error.polynomial.replace(/\^(\d+)/g, "^{$1}")}</MathDisplay>
                    </div>
                  </div>
                  <div className="text-gray-200">
                    <strong className="text-gray-100">Degree:</strong> {error.degree}
                  </div>
                  <div className="text-gray-300 bg-gray-800/40 p-4 rounded border border-gray-700">
                    <p className="font-medium mb-2 text-gray-100">Why this matters:</p>
                    <p>{error.message}</p>
                    <p className="mt-2">
                      A reducible polynomial factors into smaller polynomials over ℚ. The concept of "the"
                      Galois group applies to irreducible polynomials. Try an irreducible polynomial like{" "}
                      <MathDisplay inline>{"x^2-2"}</MathDisplay>, <MathDisplay inline>{"x^3-2"}</MathDisplay>, or{" "}
                      <MathDisplay inline>{"x^4-10x^2+1"}</MathDisplay>.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : error.type === "computation" ? (
            <>
              <ErrorIcon className="w-10 h-10 mx-auto text-red-400" />
              <h2 className="text-2xl font-bold text-red-300 mb-4">Computation Error</h2>
              <div className="bg-red-950/40 border-l-4 border-red-700 p-6 rounded-lg text-left">
                <p className="text-red-200">{error.message}</p>
                <p className="text-red-300/80 mt-2 text-sm">Please check your polynomial syntax and try again.</p>
              </div>
            </>
          ) : (
            <>
              <OfflineIcon className="w-10 h-10 mx-auto text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-300 mb-4">Network Error</h2>
              <div className="bg-gray-800/40 border-l-4 border-gray-600 p-6 rounded-lg text-left">
                <p className="text-gray-200">{error.message}</p>
                <p className="text-gray-400 mt-2 text-sm">Please check your connection and try again.</p>
              </div>
            </>
          )}
          <Button onClick={onDismiss} className="mt-4">
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
