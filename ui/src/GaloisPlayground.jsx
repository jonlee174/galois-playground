import { useEffect, useState } from "react";
import AboutCard from "./components/AboutCard";
import ErrorCard from "./components/ErrorCard";
import Header from "./components/Header";
import PolynomialForm from "./components/PolynomialForm";
import ResultsCard from "./components/ResultsCard";

const SPLITTING_FIELD_POLL_INTERVAL_MS = 2000;

async function fetchSplittingField(polynomial) {
  const response = await fetch("/api/splitting-field", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ polynomial: polynomial.replace(/\\cdot/g, "*") }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Adds implicit multiplication signs so "3x^2+2x+1" parses like "3*x^2+2*x+1".
const preprocessPolynomial = (poly) =>
  poly
    .replace(/(\d)([a-zA-Z])/g, "$1*$2")
    .replace(/(\))([a-zA-Z])/g, "$1*$2")
    .replace(/([a-zA-Z])(\()/g, "$1*$2");

export default function GaloisPlayground() {
  const [polynomial, setPolynomial] = useState("");
  const [computeSplittingField, setComputeSplittingField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [splittingFieldLoading, setSplittingFieldLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isPollingForSplittingField, setIsPollingForSplittingField] = useState(false);

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

  const handleSubmit = async () => {
    if (!polynomial.trim()) {
      setError({ type: "computation", message: "Please enter a polynomial" });
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/galois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          polynomial: preprocessPolynomial(polynomial),
          compute_splitting_field: computeSplittingField,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.computation_successful) {
        if (data.error_type === "reducible_polynomial") {
          setError({
            type: "reducible",
            message: data.error,
            polynomial: data.polynomial,
            degree: data.degree,
          });
        } else {
          setError({ type: "computation", message: data.error || "Computation failed for unknown reason" });
        }
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("Error calling backend:", err);
      setError({ type: "network", message: `Network error: ${err.message}` });
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
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
            <AboutCard />
          </>
        )}
      </div>
    </div>
  );
}
