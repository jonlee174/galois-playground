import DynamicSizeMath from "./math/DynamicSizeMath";
import MathDisplay from "./math/MathDisplay";
import WrappingPolynomialDisplay from "./math/WrappingPolynomialDisplay";
import { Button, Card, CardContent } from "./ui/primitives";
import GroupPropertiesCard from "./GroupPropertiesCard";

// Cleans up SageMath's root formatting into LaTeX (surds, integer roots, etc).
const formatRootForDisplay = (root) =>
  root
    .replace(/(\d+)\.0+(?!\d)/g, "$1")
    .replace(/(\d+\.\d*?)0+(?!\d)/g, "$1")
    .replace(/\s\\pm\s(\d+)\.0+i/g, " \\pm $1i")
    .replace(/(\d+)\.0+i/g, "$1i")
    .replace(/(?:^|\s)1i(?:$|\s)/g, "i")
    .replace(/\s\\pm\s1i/g, " \\pm i")
    .replace(/√/g, "\\sqrt{")
    .replace(/∛/g, "\\sqrt[3]{")
    .replace(/⁴√/g, "\\sqrt[4]{")
    .replace(/ω/g, "\\omega")
    .replace(/²/g, "^2")
    .replace(/α/g, "\\alpha")
    .replace(/i/g, "\\mathrm{i}");

const SplittingFieldPanel = ({ result, splittingFieldLoading, isPollingForSplittingField, onCompute }) => {
  const isComputing =
    splittingFieldLoading || (result.splitting_field && result.splitting_field.computing) || isPollingForSplittingField;

  if (isComputing) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mb-2"></div>
        <p className="text-gray-300">Computing splitting field...</p>
        <p className="text-xs text-gray-500 mt-1">This may take some time for higher degree polynomials</p>
      </div>
    );
  }

  if (result.splitting_field && result.splitting_field.computed) {
    const sf = result.splitting_field;
    return (
      <div className="space-y-2 text-left">
        <div>
          <strong className="text-gray-100">Field:</strong>
          <div className="mt-1 text-xs font-mono bg-black/40 p-2 rounded">{sf.field || "N/A"}</div>
        </div>
        <div>
          <strong className="text-gray-100">Degree:</strong>{" "}
          <span className="ml-2">
            <MathDisplay>{`[\\mathbb{Q}(\\alpha) : \\mathbb{Q}] = ${sf.degree || "N/A"}`}</MathDisplay>
          </span>
        </div>
        {sf.defining_polynomial && (
          <div>
            <strong className="text-gray-100">Defining Polynomial:</strong>
            <div className="mt-1 text-xs font-mono bg-black/40 p-2 rounded">{sf.defining_polynomial}</div>
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2 italic">
          {sf.description || "The field containing all roots of the polynomial"}
        </div>
        {sf.error && <div className="text-xs text-red-400 mt-2">Error: {sf.error}</div>}
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <p className="text-gray-500 mb-4">Splitting field data not computed</p>
      <Button onClick={onCompute} className="px-4 py-2 text-sm">
        Compute Splitting Field
      </Button>
      <p className="text-xs text-gray-600 mt-2">This computation may be time-intensive for higher degree polynomials</p>
    </div>
  );
};

export default function ResultsCard({
  result,
  splittingFieldLoading,
  isPollingForSplittingField,
  onComputeSplittingField,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className="shadow-2xl border-2 border-accent-800/50">
        <CardContent className="pt-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">Results</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-800">
                <h3 className="font-semibold text-gray-100 mb-2">Polynomial</h3>
                <div className="p-2 bg-black/40 rounded border border-gray-800 min-h-[50px] flex items-center justify-center">
                  <div className="text-center max-w-full">
                    <WrappingPolynomialDisplay maxWidth={280}>
                      {result.polynomial.replace(/\^(\d+)/g, "^{$1}").replace(/\*/g, "")}
                    </WrappingPolynomialDisplay>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-800">
                <h3 className="font-semibold text-gray-100 mb-2">Galois Group</h3>
                <div className="p-4 bg-black/40 rounded border border-gray-800 shadow-inner min-h-[80px] flex items-center justify-center">
                  <DynamicSizeMath maxWidth={250}>{result.galois_group?.explicit || "N/A"}</DynamicSizeMath>
                </div>
                <div className="text-sm text-gray-400 text-center mt-2 font-medium">
                  Order: {result.galois_group?.order}
                </div>
              </div>

              <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-800">
                <h3 className="font-semibold text-gray-100 mb-2">Group Details</h3>
                <div className="text-sm text-gray-300 text-center p-2 bg-black/40 rounded border border-gray-800 break-words">
                  {result.galois_group?.description || "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-800">
                <h3 className="font-semibold text-gray-100 mb-2">Splitting Field</h3>
                <div className="text-sm text-gray-300 text-center p-2 bg-black/40 rounded border border-gray-800 break-words">
                  <SplittingFieldPanel
                    result={result}
                    splittingFieldLoading={splittingFieldLoading}
                    isPollingForSplittingField={isPollingForSplittingField}
                    onCompute={onComputeSplittingField}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-900/70 rounded-lg p-6 border border-gray-800">
            <h3 className="font-semibold text-gray-100 mb-3 text-center">
              Roots in <MathDisplay inline>{"\\mathbb{C}"}</MathDisplay>
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {result.roots &&
                result.roots.map((root, index) => (
                  <div key={index} className="bg-black/40 px-4 py-2 rounded-full border-2 border-accent-700/60 shadow-sm">
                    <MathDisplay inline>{formatRootForDisplay(root)}</MathDisplay>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <GroupPropertiesCard galoisGroup={result.galois_group} />
    </div>
  );
}
