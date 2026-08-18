import { useEffect, useRef, useState } from "react";

// Renders a LaTeX polynomial, breaking it across lines at + / - operators
// when it's too wide for maxWidth, so long polynomials don't overflow.
export default function WrappingPolynomialDisplay({ children, maxWidth = 280 }) {
  const containerRef = useRef(null);
  const [shouldWrap, setShouldWrap] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    setContent(typeof children === "string" ? children : String(children));
  }, [children]);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    const measureText = () => {
      const temp = document.createElement("div");
      temp.style.visibility = "hidden";
      temp.style.position = "absolute";
      temp.style.top = "-1000px";
      temp.style.fontSize = "1.125rem"; // text-lg equivalent
      temp.innerHTML = `$$${content}$$`;
      document.body.appendChild(temp);

      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise([temp])
          .then(() => {
            const width = temp.scrollWidth;
            document.body.removeChild(temp);
            setShouldWrap(width > maxWidth);
          })
          .catch(() => {
            document.body.removeChild(temp);
            setShouldWrap(content.length > 25);
          });
      } else {
        const width = temp.scrollWidth;
        document.body.removeChild(temp);
        setShouldWrap(width > maxWidth);
      }
    };

    const timer = setTimeout(measureText, 100);
    return () => clearTimeout(timer);
  }, [content, maxWidth]);

  const formatPolynomialForWrapping = (poly) => {
    if (!shouldWrap) return [poly];

    // Break at + and - operators, keeping the operator with the following term.
    const parts = poly.split(/(?=[+-])/g).filter((part) => part.trim());
    if (parts.length <= 1) return [poly];

    const lines = [];
    for (let i = 0; i < parts.length; i += 3) {
      lines.push(parts.slice(i, i + 3).join("").trim());
    }
    return lines.length > 0 ? lines : [poly];
  };

  useEffect(() => {
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [content, shouldWrap]);

  const lines = formatPolynomialForWrapping(content);

  return (
    <div ref={containerRef} className="text-lg text-gray-100">
      {lines.map((line, index) => (
        <div key={index} className="text-center" style={{ lineHeight: "1.2" }}>
          <div dangerouslySetInnerHTML={{ __html: `$$${line}$$` }} />
        </div>
      ))}
    </div>
  );
}
