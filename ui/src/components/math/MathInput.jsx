import { useState } from "react";
import MathDisplay from "./MathDisplay";

// Converts common shorthand (x^2, sqrt(2), pi, +-, ...) into LaTeX for preview.
const convertToLatex = (input) =>
  input
    .replace(/\^(\d+)/g, "^{$1}")
    .replace(/\^([a-zA-Z]+)/g, "^{$1}")
    .replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}")
    .replace(/\bpi\b/g, "\\pi")
    .replace(/\balpha\b/g, "\\alpha")
    .replace(/\bbeta\b/g, "\\beta")
    .replace(/\btheta\b/g, "\\theta")
    .replace(/\bomega\b/g, "\\omega")
    .replace(/\*/g, " \\cdot ")
    .replace(/\+-/g, "\\pm")
    .replace(/-\+/g, "\\mp");

export default function MathInput({ placeholder, value, onChange, onSubmit, className = "" }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={(e) => e.key === "Enter" && onSubmit?.()}
        onFocus={() => setShowPreview(true)}
        onBlur={() => setTimeout(() => setShowPreview(false), 200)}
        spellCheck={false}
        className={`w-full px-4 py-3 border border-gray-700 bg-black text-gray-50 focus:outline-none focus:border-accent-400 transition-colors duration-150 placeholder-gray-600 ${className}`}
      />
      {showPreview && value && (
        <div className="absolute top-full left-0 right-0 -mt-px p-3 bg-gray-950 border border-accent-400 z-20">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Preview</div>
          <MathDisplay>{convertToLatex(value)}</MathDisplay>
        </div>
      )}
    </div>
  );
}
