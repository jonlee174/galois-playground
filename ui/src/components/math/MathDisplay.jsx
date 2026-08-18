import { useEffect, useState } from "react";

// Renders a LaTeX string via MathJax. `inline` picks $...$ vs $$...$$.
export default function MathDisplay({ children, inline = false }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    setContent(typeof children === "string" ? children : String(children));
  }, [children]);

  useEffect(() => {
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [content]);

  if (inline) {
    return <span dangerouslySetInnerHTML={{ __html: `$${content}$` }} />;
  }

  return <div dangerouslySetInnerHTML={{ __html: `$$${content}$$` }} />;
}
