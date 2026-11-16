import { Rationals } from "./math/MathDisplay";

export default function Header() {
  return (
    <header className="border-b border-gray-800 md:pt-5 pb-6 text-center">
      <h1 className="font-title text-[6.4vw] md:text-7xl text-gray-50 uppercase tracking-[0.06em] leading-none">
        Correspondence
      </h1>
      <p className="mt-4 md:mt-3 text-gray-400 text-sm md:text-base">
        Galois groups, splitting fields and subfield lattices of polynomials over <Rationals />
      </p>
    </header>
  );
}
