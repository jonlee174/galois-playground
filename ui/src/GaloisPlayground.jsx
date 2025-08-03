import React, { useState } from "react";

// Simple UI components since @/components might not be available
const Input = ({ placeholder, value, onChange, className = "" }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Button = ({ onClick, disabled, children, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white shadow-md rounded-lg border ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export default function GaloisPlayground() {
  const [polynomial, setPolynomial] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!polynomial.trim()) {
      alert("Please enter a polynomial");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/galois", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ polynomial: polynomial }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error) {
      console.error("Error calling backend:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Galois Theory Playground</h1>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input
            placeholder="Enter a polynomial over ℚ (e.g. x^2-2, x^3-2, x^4-2)"
            value={polynomial}
            onChange={(e) => setPolynomial(e.target.value)}
          />
          <div className="text-sm text-gray-600">
            <p><strong>Examples:</strong> x^2-2, x^3-2, x^4-2, x^2+1, X^2-1, x^2-5, x^3-8, x^4-16</p>
            <p>Note: Spaces are optional, both x^2-2 and x^2 - 2 work</p>
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Computing..." : "Compute Galois Group"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div
          className="space-y-4 animate-fadeIn"
        >
          <Card>
            <CardContent className="pt-6 space-y-2">
              <p><strong>Polynomial:</strong> {result.polynomial}</p>
              <p><strong>Galois Group:</strong> {result.galoisGroup}</p>
              <p><strong>Structure:</strong> {result.structure}</p>
              <p><strong>Roots:</strong> {result.roots.join(", ")}</p>
              <p><strong>Field Extension Degree:</strong> {result.fieldDegree}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
