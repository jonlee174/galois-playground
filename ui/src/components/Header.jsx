import galoisImage from "../assets/galois.jpg";
import sageMathImage from "../assets/sage-math.jpg";
import { ExternalLinkIcon } from "./icons";

// Small attribution chip: a muted thumbnail (grayscale, so the source image's
// original colors never fight the theme) plus a name/credit line that links out.
const CreditChip = ({ image, alt, name, credit, href, align = "left" }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`group flex items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : "text-left"}`}
  >
    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-700 group-hover:border-accent-500/60 transition-colors duration-200 shrink-0 bg-gray-900">
      <img
        src={image}
        alt={alt}
        className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
      />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-200 group-hover:text-accent-300 transition-colors duration-200 flex items-center gap-1">
        {name}
        <ExternalLinkIcon className="w-3 h-3 text-gray-500 group-hover:text-accent-400 transition-colors duration-200" />
      </p>
      <p className="text-xs text-gray-500">{credit}</p>
    </div>
  </a>
);

export default function Header() {
  return (
    <div className="text-center space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <CreditChip
          image={galoisImage}
          alt="Évariste Galois"
          name="Évariste Galois"
          credit="Founder of Galois theory, 1811–1832"
          href="https://en.wikipedia.org/wiki/%C3%89variste_Galois"
        />

        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            Galois Theory <span className="text-accent-400">Playground</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Explore field extensions and Galois groups of polynomials over{" "}
            <span className="font-serif italic">ℚ</span>
          </p>
        </div>

        <CreditChip
          image={sageMathImage}
          alt="SageMath"
          name="SageMath"
          credit="Computation engine"
          href="https://www.sagemath.org"
          align="right"
        />
      </div>
    </div>
  );
}
