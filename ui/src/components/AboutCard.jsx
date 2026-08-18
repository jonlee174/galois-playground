import { Card, CardContent } from "./ui/primitives";
import { InfoIcon } from "./icons";

export default function AboutCard() {
  return (
    <Card className="shadow-xl bg-gray-950/70 border border-gray-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <InfoIcon className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-gray-100">About Galois Theory</h3>
        </div>
        <p className="text-gray-400 leading-relaxed">
          Galois theory, developed by Évariste Galois, establishes a profound connection between field extensions
          and group theory. The Galois group captures the symmetries of the polynomial's roots, revealing deep
          mathematical structure in algebraic equations — including, via the Abel–Ruffini theorem, exactly when
          those roots can and cannot be expressed using radicals.
        </p>
      </CardContent>
    </Card>
  );
}
