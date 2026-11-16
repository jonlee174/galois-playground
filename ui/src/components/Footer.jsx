import galoisImage from "../assets/galois.jpg";
import sageMathImage from "../assets/sage-math.jpg";
import { ExternalLinkIcon } from "./icons";

// Attribution chip: grayscale thumbnail plus a one-line name and credit. Both
// chips share the same fixed height and vertical centring so they line up.
const CreditChip = ({ image, alt, name, credit, href, align = "left" }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`group flex items-center gap-3 h-12 text-left ${align === "right" ? "sm:flex-row-reverse sm:text-right" : ""}`}
  >
    <div className="w-12 h-12 overflow-hidden border border-gray-700 group-hover:border-accent-400 transition-colors duration-150 shrink-0 bg-gray-900">
      <img src={image} alt={alt} className="w-full h-full object-cover grayscale contrast-125" />
    </div>
    <div className={`flex flex-col justify-center items-start leading-tight ${align === "right" ? "sm:items-end" : ""}`}>
      <span className="flex items-center gap-1 whitespace-nowrap text-sm text-gray-200 group-hover:text-accent-300 transition-colors duration-150">
        {name}
        <ExternalLinkIcon className="w-3 h-3 text-gray-500 group-hover:text-accent-400" />
      </span>
      <span className="whitespace-nowrap text-xs text-gray-500">{credit}</span>
    </div>
  </a>
);

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <CreditChip
        image={galoisImage}
        alt="Évariste Galois"
        name="Évariste Galois"
        credit="1811–1832"
        href="https://en.wikipedia.org/wiki/%C3%89variste_Galois"
      />
      <CreditChip
        image={sageMathImage}
        alt="SageMath"
        name="SageMath"
        credit="Computation engine"
        href="https://www.sagemath.org"
        align="right"
      />
    </footer>
  );
}
