// Resolves once MathJax has loaded and finished its startup pass (which
// typesets whatever is already on the page).
function mathJaxReady() {
  const mj = window.MathJax;
  if (mj?.startup?.promise) return mj.startup.promise;
  const script = document.getElementById("MathJax-script");
  if (!script) return Promise.reject(new Error("MathJax script tag missing"));
  return new Promise((resolve) => {
    script.addEventListener("load", () => resolve(window.MathJax.startup.promise), { once: true });
  });
}

// Typesets MathJax inside the given elements only (not the whole document).
export function typeset(elements) {
  const els = elements.filter(Boolean);
  return mathJaxReady()
    .then(() => {
      window.MathJax.typesetClear(els);
      return window.MathJax.typesetPromise(els);
    })
    .catch((err) => console.error("MathJax typeset failed:", err));
}
