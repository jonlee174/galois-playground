import FitMath from "./math/FitMath";
import MathDisplay, { MathText } from "./math/MathDisplay";
import RootList from "./math/RootList";
import { Button, Card, CardContent, Panel, SectionTitle, Spinner } from "./ui/primitives";
import GroupPropertiesCard from "./GroupPropertiesCard";

const toLatexPoly = (poly) => poly.replace(/\^(\d+)/g, "^{$1}").replace(/\*/g, "");

const SplittingFieldPanel = ({ result, splittingFieldLoading, isPollingForSplittingField, onCompute }) => {
  const sf = result.splitting_field;
  const isComputing = splittingFieldLoading || sf?.computing || isPollingForSplittingField;

  if (isComputing) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-2 text-accent-400">
        <Spinner className="w-6 h-6" />
        <p className="text-gray-300">Computing splitting field…</p>
        <p className="text-xs text-gray-500">This may take a while for higher degree polynomials</p>
      </div>
    );
  }

  if (sf?.computed) {
    return (
      <div className="space-y-3">
        <div className="text-gray-100">
          <MathDisplay>{`[L : \\mathbb{Q}] = ${sf.degree ?? "?"}`}</MathDisplay>
        </div>
        {(sf.defining_polynomial_latex || sf.defining_polynomial) && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              Defining polynomial of <MathDisplay inline>{"L = \\mathbb{Q}(\\beta)"}</MathDisplay>
            </p>
            <div className="bg-gray-950 border border-gray-800 p-2 text-sm">
              <FitMath display breakable>
                {sf.defining_polynomial_latex || toLatexPoly(sf.defining_polynomial)}
              </FitMath>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500">
          <MathText>{sf.description || "The smallest field containing all roots of the polynomial."}</MathText>
        </p>
        {sf.error && <p className="text-xs text-red-400">Error: {sf.error}</p>}
      </div>
    );
  }

  return (
    <div className="text-center py-4 space-y-3">
      <p className="text-gray-500">Not computed yet</p>
      <Button onClick={onCompute} variant="secondary" className="px-4 py-2 text-sm">
        Compute splitting field
      </Button>
      <p className="text-xs text-gray-600">May be slow for higher degree polynomials</p>
    </div>
  );
};

export default function ResultsCard({
  result,
  splittingFieldLoading,
  isPollingForSplittingField,
  onComputeSplittingField,
}) {
  const group = result.galois_group;

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className="border-t-2 border-t-accent-400">
        <CardContent>
          <SectionTitle>Results</SectionTitle>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-3">
              <Panel>
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Polynomial</h4>
                <FitMath display breakable className="text-lg text-gray-50">
                  {`f(x) = ${result.polynomial_latex || toLatexPoly(result.polynomial)}`}
                </FitMath>
              </Panel>

              <Panel>
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Galois group</h4>
                <div className="min-h-[72px] flex items-center">
                  <FitMath display className="w-full text-4xl text-gray-50">
                    {group?.explicit || "?"}
                  </FitMath>
                </div>
                <div className="flex justify-between items-baseline text-sm mt-2 pt-2 border-t border-gray-800">
                  <span className="text-gray-400">
                    <MathDisplay inline>{`|\\mathrm{Gal}(L/\\mathbb{Q})| = ${group?.order ?? "?"}`}</MathDisplay>
                  </span>
                  {group?.transitive_label && <span className="text-accent-300 tracking-wider">{group.transitive_label}</span>}
                </div>
              </Panel>
            </div>

            <Panel>
              <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Splitting field</h4>
              <SplittingFieldPanel
                result={result}
                splittingFieldLoading={splittingFieldLoading}
                isPollingForSplittingField={isPollingForSplittingField}
                onCompute={onComputeSplittingField}
              />
            </Panel>
          </div>

          <Panel className="mt-3">
            <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
              Roots in <MathDisplay inline>{"\\mathbb{C}"}</MathDisplay>
            </h4>
            <RootList roots={result.roots} notes={result.root_notes} />
            {result.roots?.some((r) => !r.latex) && (
              <p className="text-xs text-gray-500 mt-2">
                {group?.is_solvable === false
                  ? "No closed form: the Galois group isn't solvable, so these roots can't be written with radicals at all."
                  : "Roots without a closed form are expressible in radicals, but not in a form short enough to be readable."}
              </p>
            )}
          </Panel>
        </CardContent>
      </Card>

      <GroupPropertiesCard galoisGroup={group} />
    </div>
  );
}
