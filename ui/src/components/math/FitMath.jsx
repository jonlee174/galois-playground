import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { typeset } from "./typeset";

// Splits "lhs = a + b - c" at the top-level "=" and at top-level + / -
// (outside braces), keeping each operator with the term that follows it.
function splitPolynomial(tex) {
  let depth = 0;
  let lhs = null;
  let current = "";
  const terms = [];
  for (const ch of tex) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0 && ch === "=" && lhs === null) {
      lhs = current.trim();
      current = "";
      continue;
    }
    if (depth === 0 && (ch === "+" || ch === "-") && current.trim()) {
      terms.push(current.trim());
      current = "";
    }
    current += ch;
  }
  if (current.trim()) terms.push(current.trim());
  return { lhs, terms };
}

// Lays the terms out over `lineCount` lines of near-equal length (13 terms on
// 4 lines is 4-3-3-3, not 4-4-4-1) in an aligned block, continuation lines
// indented under the right-hand side.
function brokenTex({ lhs, terms }, lineCount) {
  const lines = [];
  let start = 0;
  for (let k = 0; k < lineCount; k++) {
    const size = Math.floor(terms.length / lineCount) + (k < terms.length % lineCount ? 1 : 0);
    lines.push(terms.slice(start, start + size).join(" "));
    start += size;
  }
  const first = lhs !== null ? `${lhs} &= ${lines[0]}` : `& ${lines[0]}`;
  const rest = lines.slice(1).map((line) => `& \\quad {} ${line}`);
  return `\\begin{aligned} ${[first, ...rest].join(" \\\\ ")} \\end{aligned}`;
}

const MIN_SCALE = 0.5;

/**
 * Renders LaTeX that always fits its container without a scroll box:
 *   1. as is, if it fits;
 *   2. if `breakable` (polynomials), broken across lines at + / -;
 *   3. scaled down to fit, to at most MIN_SCALE;
 *   4. only then, horizontally scrollable (never vertically).
 * The container's width must not depend on the content (use w-full, flex-1
 * with min-w-0, or a minmax(0, 1fr) grid track), or fitting would feed back
 * into the width being fitted to.
 */
export default function FitMath({ children, display = false, breakable = false, align = "center", className = "" }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const run = useRef(0);
  const lastWidth = useRef(null);
  const [overflowing, setOverflowing] = useState(false);
  const tex = typeof children === "string" ? children : String(children ?? "");

  const fit = useCallback(async () => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const id = ++run.current;
    const avail = o.clientWidth;
    lastWidth.current = avail;

    const render = async (body) => {
      i.style.fontSize = "";
      i.innerHTML = display ? `$$${body}$$` : `$${body}$`;
      await typeset([i]);
      return i.getBoundingClientRect().width;
    };

    let width = await render(tex);
    if (id !== run.current) return;

    if (width > avail + 1 && breakable) {
      const parts = splitPolynomial(tex);
      for (let lines = 2; lines <= parts.terms.length && width > avail + 1; lines++) {
        width = await render(brokenTex(parts, lines));
        if (id !== run.current) return;
      }
    }

    if (width > avail + 1) {
      i.style.fontSize = `${Math.max(MIN_SCALE, avail / width) * 100}%`;
      width = i.getBoundingClientRect().width;
    }
    setOverflowing(width > avail + 1);
  }, [tex, display, breakable]);

  useLayoutEffect(() => {
    fit();
  }, [fit]);

  // Refit when the available width changes (not on height changes, which
  // fitting itself causes).
  useEffect(() => {
    const o = outer.current;
    if (!o) return undefined;
    const observer = new ResizeObserver(() => {
      if (o.clientWidth !== lastWidth.current) fit();
    });
    observer.observe(o);
    return () => observer.disconnect();
  }, [fit]);

  // When it still overflows, start-align: centred overflow spills past the left
  // edge, where it can't be scrolled to.
  // "end": left-aligned when stacked on phones, right-aligned from sm up.
  const justify = overflowing
    ? "justify-start"
    : { center: "justify-center", left: "justify-start", right: "justify-end", end: "justify-start sm:justify-end" }[align];
  return (
    <div
      ref={outer}
      className={`flex min-w-0 ${justify} ${overflowing ? "overflow-x-auto overflow-y-hidden py-1" : ""} ${className}`}
    >
      <div ref={inner} className="w-max shrink-0" />
    </div>
  );
}
