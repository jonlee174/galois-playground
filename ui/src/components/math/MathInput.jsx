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

export default function MathInput({ placeholder, value, onChange, className = "" }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setShowPreview(true)}
          onBlur={() => setTimeout(() => setShowPreview(false), 200)}
          className={`w-full px-4 py-3 border border-gray-700 bg-gray-900 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/60 focus:border-accent-500/60 transition-all duration-200 shadow-sm placeholder-gray-500 ${className}`}
        />
        {showPreview && value && (
          <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
            <div className="text-sm text-gray-400 mb-1">Preview:</div>
            <div className="text-center bg-black/40 p-2 rounded border border-gray-800">
              <MathDisplay>{convertToLatex(value)}</MathDisplay>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
