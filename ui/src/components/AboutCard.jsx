import { Card, CardContent, SectionTitle } from "./ui/primitives";
import { InfoIcon } from "./icons";

export default function AboutCard() {
  return (
    <Card>
      <CardContent>
        <SectionTitle icon={InfoIcon}>About Galois theory</SectionTitle>
        <p className="text-gray-400 leading-relaxed text-sm">
          Galois theory, developed by Évariste Galois, connects field extensions with group theory. The Galois group
          captures the symmetries of a polynomial's roots, and its subgroups match the intermediate fields of the
          splitting field one for one. That correspondence is what decides, via the Abel–Ruffini theorem, exactly
          when the roots can be expressed using radicals.
        </p>
      </CardContent>
    </Card>
  );
}
