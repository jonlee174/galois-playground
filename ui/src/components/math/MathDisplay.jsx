import { useLayoutEffect, useRef } from "react";
import { typeset } from "./typeset";

// Renders a LaTeX string via MathJax. `inline` picks $...$ vs $$...$$.
export default function MathDisplay({ children, inline = false, className = "" }) {
  const ref = useRef(null);
  const content = typeof children === "string" ? children : String(children ?? "");
  const html = inline ? `$${content}$` : `$$${content}$$`;

  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = html;
    typeset([ref.current]);
  }, [html]);

  const Tag = inline ? "span" : "div";
  return <Tag ref={ref} className={className} />;
}

// \mathbb{Q}, for use inside running text.
export const Rationals = () => <MathDisplay inline>{"\\mathbb{Q}"}</MathDisplay>;

// Renders a string that mixes plain text with $...$ LaTeX segments
// (e.g. backend messages like "reducible over $\mathbb{Q}$").
export function MathText({ children }) {
  const text = String(children ?? "");
  const parts = text.split(/(\$[^$]+\$)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("$") && part.endsWith("$") && part.length > 2 ? (
          <MathDisplay key={i} inline>
            {part.slice(1, -1)}
          </MathDisplay>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
