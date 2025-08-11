import React, { useState, useEffect } from "react";
import galoisImage from "./assets/galois.jpg";
import sageMathImage from "./assets/sage-math.jpg";

// LaTeX Math component for rendering mathematical expressions
const MathDisplay = ({ children, inline = false }) => {
  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (typeof children === 'string') {
      setContent(children);
    } else {
      setContent(String(children));
    }
  }, [children]);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [content]);

  if (inline) {
    return <span dangerouslySetInnerHTML={{ __html: `$${content}$` }} />;
  }
  
  return <div dangerouslySetInnerHTML={{ __html: `$$${content}$$` }} />;
};

// Enhanced Input component with LaTeX preview
const MathInput = ({ placeholder, value, onChange, className = "" }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  // Convert common input patterns to LaTeX
  const convertToLatex = (input) => {
    let latex = input
      .replace(/\^(\d+)/g, '^{$1}')  // x^2 -> x^{2}
      .replace(/\^([a-zA-Z]+)/g, '^{$1}')  // x^n -> x^{n}
      .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')  // sqrt(2) -> \sqrt{2}
      .replace(/\bpi\b/g, '\\pi')  // pi -> \pi
      .replace(/\balpha\b/g, '\\alpha')  // alpha -> \alpha
      .replace(/\bbeta\b/g, '\\beta')  // beta -> \beta
      .replace(/\btheta\b/g, '\\theta')  // theta -> \theta
      .replace(/\bomega\b/g, '\\omega')  // omega -> \omega
      .replace(/\*/g, ' \\cdot ')  // * -> \cdot
      .replace(/\+-/g, '\\pm')  // +- -> \pm
      .replace(/-\+/g, '\\mp');  // -+ -> \mp
    
    return latex;
  };

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
          className={`w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${className}`}
        />
        {showPreview && value && (
          <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-purple-50 border border-purple-200 rounded-lg shadow-lg z-10">
            <div className="text-sm text-purple-700 mb-1">Preview:</div>
            <div className="text-center bg-white p-2 rounded border">
              <MathDisplay>{convertToLatex(value)}</MathDisplay>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Input = ({ placeholder, value, onChange, className = "" }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${className}`}
  />
);

const Button = ({ onClick, disabled, children, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg font-semibold ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-purple-100 ${className}`}>
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
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!polynomial.trim()) {
      setError("Please enter a polynomial");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/galois", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ polynomial: polynomial }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);
      
      if (!data.computation_successful) {
        // Check for specific error types
        if (data.error_type === "reducible_polynomial") {
          setError({
            type: "reducible",
            message: data.error,
            polynomial: data.polynomial,
            degree: data.degree
          });
        } else {
          setError({
            type: "computation",
            message: data.error || "Computation failed for unknown reason"
          });
        }
        return;
      }

      setResult(data);
    } catch (error) {
      console.error("Error calling backend:", error);
      setError({
        type: "network",
        message: `Network error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        {/* Header with portraits */}
        <div className="text-center space-y-6">
          <div className="flex justify-center items-center space-x-8 mb-8">
            {/* Évariste Galois portrait */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src={galoisImage} 
                    alt="Évariste Galois"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      // If local image fails, show fallback
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-700 font-bold text-xl hidden border-2 border-purple-300">
                    ÉG
                  </div>
                </div>
              </div>
              <p className="text-purple-200 text-sm mt-2 font-medium text-center">Évariste Galois</p>
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent mb-2">
                Galois Theory Playground
              </h1>
              <p className="text-purple-300 text-lg">Explore the beautiful world of field extensions and Galois groups</p>
            </div>
            
            {/* SageMath logo */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src={sageMathImage} 
                    alt="SageMath"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      // If local image fails, show fallback
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg rounded-full shadow-inner hidden">
                    SAGE
                  </div>
                </div>
              </div>
              <p className="text-purple-200 text-sm mt-2 font-medium text-center">Powered by SageMath</p>
            </div>
          </div>
        </div>

        {/* Main computation card */}
        <Card className="shadow-2xl">
          <CardContent className="space-y-6 pt-8">
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-purple-800 mb-2">
                Enter a Polynomial over <MathDisplay inline>{"\\mathbb{Q}"}</MathDisplay>
              </label>
              <MathInput
                placeholder="e.g., x^2-2, x^3-8, x^4-16, x^2+1"
                value={polynomial}
                onChange={(e) => setPolynomial(e.target.value)}
                className="text-lg"
              />
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                <div className="text-sm text-purple-700 space-y-1">
                  <p><strong>Examples:</strong> <MathDisplay inline>{"x^2-2"}</MathDisplay>, <MathDisplay inline>{"x^3-2"}</MathDisplay>, <MathDisplay inline>{"x^4-10x^2+1"}</MathDisplay>, <MathDisplay inline>{"x^5-2"}</MathDisplay></p>
                  <p><strong>Note:</strong> Spaces are optional - both "x^2-2" and "x^2 - 2" work perfectly!</p>
                  <p><strong>Supported:</strong> Any polynomial with rational coefficients, including:</p>
                  <div className="ml-4 space-y-1">
                    <p>• Simple forms: <MathDisplay inline>{"x^n \\pm c"}</MathDisplay> (e.g., <MathDisplay inline>{"x^3-2, x^4+5"}</MathDisplay>)</p>
                    <p>• Quadratic-like: <MathDisplay inline>{"x^4 + ax^2 + b"}</MathDisplay> (e.g., <MathDisplay inline>{"x^4-10x^2+1"}</MathDisplay>)</p>
                    <p>• General polynomials: <MathDisplay inline>{"a_nx^n + \\ldots + a_1x + a_0"}</MathDisplay> with rational coefficients</p>
                    <p className="text-purple-600 font-medium">⚠️ Polynomial must be irreducible over ℚ for Galois group computation</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full text-lg py-4"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Computing Galois Group...</span>
                </div>
              ) : (
                "Compute Galois Group"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error display card */}
        {error && (
          <Card className="shadow-2xl border-2 border-red-200 animate-fadeIn">
            <CardContent className="pt-8">
              <div className="text-center space-y-4">
                {error.type === "reducible" ? (
                  <>
                    <div className="text-4xl mb-2">⚠️</div>
                    <h2 className="text-2xl font-bold text-orange-800 mb-4">
                      Reducible Polynomial Detected
                    </h2>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-lg text-left">
                      <div className="space-y-3">
                        <div className="text-orange-800">
                          <strong>Input polynomial:</strong> 
                          <div className="text-center p-2 bg-white rounded border mt-2">
                            <MathDisplay>{error.polynomial.replace(/\^(\d+)/g, '^{$1}')}</MathDisplay>
                          </div>
                        </div>
                        <div className="text-orange-800">
                          <strong>Degree:</strong> {error.degree}
                        </div>
                        <div className="text-orange-700 bg-orange-100 p-4 rounded border">
                          <p className="font-medium mb-2"> Why this matters:</p>
                          <p>{error.message}</p>
                          <p className="mt-2">
                            A reducible polynomial factors into smaller polynomials over ℚ. 
                            The concept of "the" Galois group applies to irreducible polynomials. 
                            Try an irreducible polynomial like <MathDisplay inline>{"x^2-2"}</MathDisplay>, <MathDisplay inline>{"x^3-2"}</MathDisplay>, or <MathDisplay inline>{"x^4-10x^2+1"}</MathDisplay>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : error.type === "computation" ? (
                  <>
                    <div className="text-4xl mb-2">❌</div>
                    <h2 className="text-2xl font-bold text-red-800 mb-4">
                      Computation Error
                    </h2>
                    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg text-left">
                      <p className="text-red-700">{error.message}</p>
                      <p className="text-red-600 mt-2 text-sm">
                        Please check your polynomial syntax and try again.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">🔌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Network Error
                    </h2>
                    <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-lg text-left">
                      <p className="text-gray-700">{error.message}</p>
                      <p className="text-gray-600 mt-2 text-sm">
                        Please check your connection and try again.
                      </p>
                    </div>
                  </>
                )}
                <Button 
                  onClick={() => setError(null)}
                  className="mt-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results card */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="shadow-2xl border-2 border-purple-200">
              <CardContent className="pt-8">
                <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">
                  Results
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">Polynomial</h3>
                      <div className="text-lg text-purple-900 text-center p-2 bg-white rounded border">
                        <MathDisplay>{result.polynomial.replace(/\^(\d+)/g, '^{$1}')}</MathDisplay>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">Galois Group</h3>
                      <div className="text-4xl font-bold text-purple-900 text-center p-4 bg-white rounded border shadow-inner">
                        <MathDisplay>{result.galois_group?.explicit || 'N/A'}</MathDisplay>
                      </div>
                      <div className="text-sm text-purple-700 text-center mt-2 font-medium">
                        Order: {result.galois_group?.order}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right column */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">Group Details</h3>
                      <div className="text-sm text-purple-900 text-center p-2 bg-white rounded border break-words">
                        {result.galois_group?.description || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">Field Degree</h3>
                      <div className="text-xl font-bold text-purple-900 text-center p-2 bg-white rounded border">
                        <MathDisplay>{`[\\mathbb{Q}(\\alpha) : \\mathbb{Q}] = ${result.degree || 'N/A'}`}</MathDisplay>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Roots section - full width */}
                <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-3 text-center">Roots in <MathDisplay inline>{"\\mathbb{C}"}</MathDisplay></h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {result.roots && result.roots.map((root, index) => (
                      <div 
                        key={index}
                        className="bg-white px-4 py-2 rounded-full border-2 border-purple-300 shadow-sm"
                      >
                        <MathDisplay inline>{root.replace(/√/g, '\\sqrt{').replace(/∛/g, '\\sqrt[3]{').replace(/⁴√/g, '\\sqrt[4]{').replace(/ω/g, '\\omega').replace(/²/g, '^2').replace(/α/g, '\\alpha').replace(/i/g, '\\mathrm{i}')}</MathDisplay>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Educational info */}
            <Card className="shadow-xl bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">💡 About Galois Theory</h3>
                <p className="text-purple-700 leading-relaxed">
                  Galois theory, developed by Évariste Galois, establishes a profound connection between 
                  field extensions and group theory. The Galois group captures the symmetries of the 
                  polynomial's roots, revealing deep mathematical structure in algebraic equations.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
