import { useEffect, useRef, useState } from "react";
import AboutCard from "./components/AboutCard";
import ErrorCard from "./components/ErrorCard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LatticeCard from "./components/LatticeCard";
import PolynomialForm from "./components/PolynomialForm";
import ResultsCard from "./components/ResultsCard";

const SPLITTING_FIELD_POLL_INTERVAL_MS = 2000;

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

const fetchSplittingField = (polynomial) =>
  postJson("/api/splitting-field", { polynomial: polynomial.replace(/\\cdot/g, "*") });

// Adds implicit multiplication signs so "3x^2+2x+1" parses like "3*x^2+2*x+1".
const preprocessPolynomial = (poly) =>
  poly
    .replace(/(\d)([a-zA-Z])/g, "$1*$2")
    .replace(/(\))([a-zA-Z])/g, "$1*$2")
    .replace(/([a-zA-Z])(\()/g, "$1*$2");

export default function App() {
  const [polynomial, setPolynomial] = useState("");
  const [computeSplittingField, setComputeSplittingField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [splittingFieldLoading, setSplittingFieldLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isPollingForSplittingField, setIsPollingForSplittingField] = useState(false);
  const [lattice, setLattice] = useState(null);
  const [latticeLoading, setLatticeLoading] = useState(false);
  const [latticeError, setLatticeError] = useState(null);
  const requestId = useRef(0);

  // Poll for the splitting field once the main computation has kicked it off.
  useEffect(() => {
    if (!result?.splitting_field?.computing) return;

    setIsPollingForSplittingField(true);
    const pollInterval = setInterval(async () => {
      try {
        const data = await fetchSplittingField(result.polynomial);
        if (data.computation_successful && data.splitting_field) {
          clearInterval(pollInterval);
          setIsPollingForSplittingField(false);
          setResult((prevResult) => ({
            ...prevResult,
            splitting_field: { ...data.splitting_field, computing: false, computed: true },
          }));
        }
      } catch (err) {
        console.error("Error polling for splitting field:", err);
      }
    }, SPLITTING_FIELD_POLL_INTERVAL_MS);

    return () => clearInterval(pollInterval);
  }, [result]);

  const loadLattice = async (poly, id) => {
    setLatticeLoading(true);
    try {
      const data = await postJson("/api/lattice", { polynomial: poly });
      if (requestId.current === id) setLattice(data);
    } catch (err) {
      if (requestId.current === id) setLatticeError(err.message);
    } finally {
      if (requestId.current === id) setLatticeLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!polynomial.trim()) {
      setError({ type: "computation", message: "Please enter a polynomial" });
      return;
    }

    const id = ++requestId.current;
    const poly = preprocessPolynomial(polynomial);
    setLoading(true);
    setResult(null);
    setError(null);
    setLattice(null);
    setLatticeError(null);
    setLatticeLoading(false);

    try {
      const data = await postJson("/api/galois", { polynomial: poly, compute_splitting_field: computeSplittingField });
      if (requestId.current !== id) return;

      if (!data.computation_successful) {
        if (data.error_type === "reducible_polynomial") {
          setError({ type: "reducible", message: data.error, polynomial: data.polynomial, degree: data.degree });
        } else {
          setError({ type: "computation", message: data.error || "Computation failed for unknown reason" });
        }
        return;
      }

      setResult(data);
      loadLattice(poly, id);
    } catch (err) {
      console.error("Error calling backend:", err);
      setError({ type: "network", message: `Network error: ${err.message}` });
    } finally {
      if (requestId.current === id) setLoading(false);
    }
  };

  const loadSplittingField = async () => {
    if (!result?.polynomial) return;

    setSplittingFieldLoading(true);
    try {
      const data = await fetchSplittingField(result.polynomial);
      if (data.computation_successful && data.splitting_field) {
        setResult((prevResult) => ({ ...prevResult, splitting_field: data.splitting_field }));
      } else {
        console.error("Splitting field computation failed:", data.error);
      }
    } catch (err) {
      console.error("Error computing splitting field:", err);
    } finally {
      setSplittingFieldLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Faint square grid backdrop */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#c19d6c 1px, transparent 1px), linear-gradient(90deg, #c19d6c 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:p-8 space-y-6">
        <Header />

        <PolynomialForm
          polynomial={polynomial}
          onPolynomialChange={setPolynomial}
          computeSplittingField={computeSplittingField}
          onComputeSplittingFieldChange={setComputeSplittingField}
          loading={loading}
          onSubmit={handleSubmit}
        />

        {error && <ErrorCard error={error} onDismiss={() => setError(null)} />}

        {result && (
          <>
            <ResultsCard
              result={result}
              splittingFieldLoading={splittingFieldLoading}
              isPollingForSplittingField={isPollingForSplittingField}
              onComputeSplittingField={loadSplittingField}
            />
            <LatticeCard key={result.polynomial} lattice={lattice} loading={latticeLoading} error={latticeError} />
            <AboutCard />
          </>
        )}

        <Footer />
      </main>
    </div>
  );
}
