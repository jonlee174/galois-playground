import React, { useState } from "react";

// Enhanced UI components with purple theming
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
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Evariste_galois.jpg/256px-Evariste_galois.jpg" 
                    alt="Évariste Galois"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg hidden">
                    ÉG
                  </div>
                </div>
              </div>
              <p className="text-purple-200 text-sm mt-2 font-medium">Évariste Galois</p>
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
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <img 
                    src="https://www.sagemath.org/pix/sage_logo_new.png" 
                    alt="SageMath"
                    className="w-18 h-18 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-18 h-18 bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg rounded hidden">
                    SAGE
                  </div>
                </div>
              </div>
              <p className="text-purple-200 text-sm mt-2 font-medium">Powered by SageMath</p>
            </div>
          </div>
        </div>

        {/* Main computation card */}
        <Card className="shadow-2xl">
          <CardContent className="space-y-6 pt-8">
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-purple-800 mb-2">
                Enter a Polynomial over ℚ
              </label>
              <Input
                placeholder="e.g., x^2-2, x^3-8, x^4-16, x^2+1"
                value={polynomial}
                onChange={(e) => setPolynomial(e.target.value)}
                className="text-lg"
              />
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                <div className="text-sm text-purple-700 space-y-1">
                  <p><strong>Examples:</strong> x^2-2, x^3-2, x^4-2, x^2+1, X^2-1, x^2-5, x^3-8, x^4-16</p>
                  <p><strong>Note:</strong> Spaces are optional - both "x^2-2" and "x^2 - 2" work perfectly!</p>
                  <p><strong>Supported:</strong> Any polynomial of the form x^n ± constant</p>
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
                "🔬 Compute Galois Group"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results card */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="shadow-2xl border-2 border-purple-200">
              <CardContent className="pt-8">
                <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">
                  🎯 Mathematical Results
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">📐 Polynomial</h3>
                      <p className="text-lg font-mono text-purple-900">{result.polynomial}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">🔗 Galois Group</h3>
                      <p className="text-xl font-bold text-purple-900">{result.galoisGroup}</p>
                    </div>
                  </div>
                  
                  {/* Right column */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">🏗️ Group Structure</h3>
                      <p className="text-purple-900">{result.structure}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">📊 Field Degree</h3>
                      <p className="text-xl font-bold text-purple-900">[ℚ(α) : ℚ] = {result.fieldDegree}</p>
                    </div>
                  </div>
                </div>
                
                {/* Roots section - full width */}
                <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-3 text-center">🌱 Roots in ℂ</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {result.roots.map((root, index) => (
                      <span 
                        key={index}
                        className="bg-white px-4 py-2 rounded-full border-2 border-purple-300 text-purple-800 font-mono text-lg shadow-sm"
                      >
                        {root}
                      </span>
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
