import { useEffect, useRef, useState } from "react";

const FONT_SIZE_CLASSES = {
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

// Renders LaTeX and shrinks the font size until it fits maxWidth, so long
// group names (e.g. semidirect products) don't overflow the result card.
export default function DynamicSizeMath({ children, maxWidth = 300 }) {
  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState("4xl");
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
      temp.style.fontSize = "2.25rem"; // text-4xl equivalent
      temp.innerHTML = `$$${content}$$`;
      document.body.appendChild(temp);

      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise([temp])
          .then(() => {
            const width = temp.scrollWidth;
            document.body.removeChild(temp);

            if (width > maxWidth * 1.5) setFontSize("lg");
            else if (width > maxWidth * 1.2) setFontSize("xl");
            else if (width > maxWidth) setFontSize("2xl");
            else if (width > maxWidth * 0.8) setFontSize("3xl");
            else setFontSize("4xl");
          })
          .catch(() => {
            document.body.removeChild(temp);
            setFontSize("2xl");
          });
      } else {
        const width = temp.scrollWidth;
        document.body.removeChild(temp);
        setFontSize(width > maxWidth ? "2xl" : "4xl");
      }
    };

    const timer = setTimeout(measureText, 100);
    return () => clearTimeout(timer);
  }, [content, maxWidth]);

  useEffect(() => {
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [content, fontSize]);

  return (
    <div
      ref={containerRef}
      className={`${FONT_SIZE_CLASSES[fontSize] || "text-2xl"} font-bold text-gray-100 text-center`}
    >
      <div dangerouslySetInnerHTML={{ __html: `$$${content}$$` }} />
    </div>
  );
}
