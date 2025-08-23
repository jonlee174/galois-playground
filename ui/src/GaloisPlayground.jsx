import React, { useState, useEffect, useRef } from "react";
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

// Dynamic sizing component for Galois Group display
const DynamicSizeMath = ({ children, maxWidth = 300 }) => {
  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState('4xl');
  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (typeof children === 'string') {
      setContent(children);
    } else {
      setContent(String(children));
    }
  }, [children]);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    const measureText = () => {
      // Create a temporary element to measure the rendered LaTeX
      const temp = document.createElement('div');
      temp.style.visibility = 'hidden';
      temp.style.position = 'absolute';
      temp.style.top = '-1000px';
      temp.style.fontSize = '2.25rem'; // Start with text-4xl equivalent
      temp.innerHTML = `$$${content}$$`;
      document.body.appendChild(temp);

      // Trigger MathJax rendering
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([temp]).then(() => {
          const width = temp.scrollWidth;
          document.body.removeChild(temp);
          
          // Adjust font size based on content width
          if (width > maxWidth * 1.5) {
            setFontSize('lg'); // Smallest
          } else if (width > maxWidth * 1.2) {
            setFontSize('xl');
          } else if (width > maxWidth) {
            setFontSize('2xl');
          } else if (width > maxWidth * 0.8) {
            setFontSize('3xl');
          } else {
            setFontSize('4xl'); // Original size
          }
        }).catch(() => {
          // Fallback if MathJax fails
          document.body.removeChild(temp);
          setFontSize('2xl');
        });
      } else {
        // Fallback without MathJax
        const width = temp.scrollWidth;
        document.body.removeChild(temp);
        
        if (width > maxWidth) {
          setFontSize('2xl');
        } else {
          setFontSize('4xl');
        }
      }
    };

    // Delay measurement to ensure MathJax has rendered
    const timer = setTimeout(measureText, 100);
    return () => clearTimeout(timer);
  }, [content, maxWidth]);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [content, fontSize]);

  const fontSizeClass = {
    'lg': 'text-lg',
    'xl': 'text-xl', 
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }[fontSize] || 'text-2xl';

  return (
    <div ref={containerRef} className={`${fontSizeClass} font-bold text-gray-200 text-center`}>
      <div dangerouslySetInnerHTML={{ __html: `$$${content}$$` }} />
    </div>
  );
};

// Wrapping polynomial display component with minimal padding
const WrappingPolynomialDisplay = ({ children, maxWidth = 280 }) => {
  const containerRef = useRef(null);
  const [shouldWrap, setShouldWrap] = useState(false);
  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (typeof children === 'string') {
      setContent(children);
    } else {
      setContent(String(children));
    }
  }, [children]);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    const measureText = () => {
      // Create a temporary element to measure the rendered LaTeX
      const temp = document.createElement('div');
      temp.style.visibility = 'hidden';
      temp.style.position = 'absolute';
      temp.style.top = '-1000px';
      temp.style.fontSize = '1.125rem'; // text-lg equivalent
      temp.innerHTML = `$$${content}$$`;
      document.body.appendChild(temp);

      // Trigger MathJax rendering
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([temp]).then(() => {
          const width = temp.scrollWidth;
          document.body.removeChild(temp);
          setShouldWrap(width > maxWidth);
        }).catch(() => {
          document.body.removeChild(temp);
          setShouldWrap(content.length > 25); // Reduced from 30 for earlier wrapping
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
    
    // Break polynomial at + and - operators, keeping the operators with the following term
    const parts = poly.split(/(?=[+-])/g).filter(part => part.trim());
    
    if (parts.length <= 1) return [poly];
    
    // Group parts into lines without overlap - each part goes on only one line
    const lines = [];
    for (let i = 0; i < parts.length; i += 3) { // Increment by 3 to avoid overlap
      const line = parts.slice(i, i + 3).join(''); // Take exactly 3 terms (or remaining)
      lines.push(line.trim());
    }
    
    return lines.length > 0 ? lines : [poly];
  };

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [content, shouldWrap]);

  const lines = formatPolynomialForWrapping(content);

  return (
    <div ref={containerRef} className="text-lg text-gray-200">
      {lines.map((line, index) => (
        <div key={index} className="text-center" style={{ lineHeight: '1.2' }}>
          <div dangerouslySetInnerHTML={{ __html: `$$${line}$$` }} />
        </div>
      ))}
    </div>
  );
};

// Enhanced Input component with LaTeX preview
const MathInput = ({ placeholder, value, onChange, className = "" }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  // Convert common input patterns to LaTeX
  const convertToLatex = (input) => {
    let latex = input
      // Apply conversions without showing implicit multiplication
      .replace(/\^(\d+)/g, '^{$1}')  // x^2 -> x^{2}
      .replace(/\^([a-zA-Z]+)/g, '^{$1}')  // x^n -> x^{n}
      .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')  // sqrt(2) -> \sqrt{2}
      .replace(/\bpi\b/g, '\\pi')  // pi -> \pi
      .replace(/\balpha\b/g, '\\alpha')  // alpha -> \alpha
      .replace(/\bbeta\b/g, '\\beta')  // beta -> \beta
      .replace(/\btheta\b/g, '\\theta')  // theta -> \theta
      .replace(/\bomega\b/g, '\\omega')  // omega -> \omega
      .replace(/\*/g, ' \\cdot ')  // * -> \cdot (only explicit multiplication)
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
          className={`w-full px-4 py-3 border-2 border-gray-600 bg-gray-800 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm placeholder-gray-400 ${className}`}
        />
        {showPreview && value && (
          <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
            <div className="text-sm text-gray-300 mb-1">Preview:</div>
            <div className="text-center bg-gray-900 p-2 rounded border border-gray-700">
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
    className={`px-6 py-3 bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 active:from-gray-700 active:to-gray-800 text-white rounded-lg disabled:from-gray-800 disabled:to-gray-900 disabled:cursor-not-allowed transform transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl active:shadow-md font-semibold border border-gray-500 hover:border-purple-400 active:border-gray-600 ring-0 hover:ring-2 hover:ring-purple-500/30 ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-900/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-700 ${className}`}>
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

    // Preprocess polynomial to add implicit multiplication signs
    const preprocessPolynomial = (poly) => {
      return poly
        // Add * between number and variable: 3x -> 3*x, 15y -> 15*y
        .replace(/(\d)([a-zA-Z])/g, '$1*$2')
        // Add * between closing parenthesis and variable: )x -> )*x
        .replace(/(\))([a-zA-Z])/g, '$1*$2')
        // Add * between variable and opening parenthesis: x( -> x*(
        .replace(/([a-zA-Z])(\()/g, '$1*$2')
    };

    const processedPolynomial = preprocessPolynomial(polynomial);

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/galois", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ polynomial: processedPolynomial }),
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        {/* Header with portraits */}
        <div className="text-center space-y-6">
          <div className="flex justify-center items-center space-x-8 mb-8">
            {/* Évariste Galois portrait */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
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
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-gray-200 font-bold text-xl hidden border-2 border-gray-600">
                    ÉG
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-2 font-medium text-center">Évariste Galois</p>
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-100 to-purple-300 bg-clip-text text-transparent mb-2">
                Galois Theory Playground
              </h1>
              <p className="text-gray-400 text-lg">Explore the mathematical foundations of field extensions and Galois groups</p>
            </div>
            
            {/* SageMath logo */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
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
              <p className="text-gray-300 text-sm mt-2 font-medium text-center">Powered by SageMath</p>
            </div>
          </div>
        </div>

        {/* Main computation card */}
        <Card className="shadow-2xl border border-gray-700">
          <CardContent className="space-y-6 pt-8">
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-200 mb-2">
                Enter a Polynomial over <MathDisplay inline>{"\\mathbb{Q}"}</MathDisplay>
              </label>
              <MathInput
                placeholder="e.g., x^2-2, x^3-8, x^4-16, x^2+1, 3x^2+2x+1"
                value={polynomial}
                onChange={(e) => setPolynomial(e.target.value)}
                className="text-lg"
              />
              <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="text-sm text-gray-300 space-y-1">
                  <p><strong className="text-gray-200">Examples:</strong> <MathDisplay inline>{"x^2-2"}</MathDisplay>, <MathDisplay inline>{"x^3-2"}</MathDisplay>, <MathDisplay inline>{"x^4-10x^2+1"}</MathDisplay>, <MathDisplay inline>{"x^5-2"}</MathDisplay>, <MathDisplay inline>{"3x^2+2x+1"}</MathDisplay></p>
                  <p><strong className="text-gray-200">Natural input:</strong> You can write <code className="bg-gray-700 px-1 rounded text-purple-300">3x^2+2x+1</code> instead of <code className="bg-gray-700 px-1 rounded text-purple-300">3*x^2+2*x+1</code> - multiplication signs are optional!</p>
                  <p><strong className="text-gray-200">Note:</strong> Spaces are optional - both "x^2-2" and "x^2 - 2" work perfectly!</p>
                  <p><strong className="text-gray-200">Supported:</strong> Any polynomial with rational coefficients, including:</p>
                  <div className="ml-4 space-y-1">
                    <p>• Simple forms: <MathDisplay inline>{"x^n \\pm c"}</MathDisplay> (e.g., <MathDisplay inline>{"x^3-2, x^4+5"}</MathDisplay>)</p>
                    <p>• With coefficients: <MathDisplay inline>{"ax^n + bx^{n-1} + \\ldots"}</MathDisplay> (e.g., <MathDisplay inline>{"3x^3+2x^2-x+1"}</MathDisplay>)</p>
                    <p>• Quadratic-like: <MathDisplay inline>{"x^4 + ax^2 + b"}</MathDisplay> (e.g., <MathDisplay inline>{"x^4-10x^2+1"}</MathDisplay>)</p>
                    <p className="text-purple-300 font-medium">⚠️ Polynomial must be irreducible over ℚ for Galois group computation</p>
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
          <Card className="shadow-2xl border-2 border-red-600 animate-fadeIn">
            <CardContent className="pt-8">
              <div className="text-center space-y-4">
                {error.type === "reducible" ? (
                  <>
                    <div className="text-4xl mb-2">⚠️</div>
                    <h2 className="text-2xl font-bold text-orange-300 mb-4">
                      Reducible Polynomial Detected
                    </h2>
                    <div className="bg-orange-900/50 border-l-4 border-orange-500 p-6 rounded-lg text-left">
                      <div className="space-y-3">
                        <div className="text-orange-200">
                          <strong>Input polynomial:</strong> 
                          <div className="text-center p-2 bg-gray-800 rounded border border-gray-600 mt-2">
                            <MathDisplay>{error.polynomial.replace(/\^(\d+)/g, '^{$1}')}</MathDisplay>
                          </div>
                        </div>
                        <div className="text-orange-200">
                          <strong>Degree:</strong> {error.degree}
                        </div>
                        <div className="text-orange-100 bg-orange-800/30 p-4 rounded border border-orange-600">
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
                    <h2 className="text-2xl font-bold text-red-300 mb-4">
                      Computation Error
                    </h2>
                    <div className="bg-red-900/50 border-l-4 border-red-500 p-6 rounded-lg text-left">
                      <p className="text-red-200">{error.message}</p>
                      <p className="text-red-300 mt-2 text-sm">
                        Please check your polynomial syntax and try again.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">🔌</div>
                    <h2 className="text-2xl font-bold text-gray-300 mb-4">
                      Network Error
                    </h2>
                    <div className="bg-gray-800/50 border-l-4 border-gray-500 p-6 rounded-lg text-left">
                      <p className="text-gray-200">{error.message}</p>
                      <p className="text-gray-400 mt-2 text-sm">
                        Please check your connection and try again.
                      </p>
                    </div>
                  </>
                )}
                <Button 
                  onClick={() => setError(null)}
                  className="mt-4 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400"
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
            <Card className="shadow-2xl border-2 border-purple-500/50">
              <CardContent className="pt-8">
                <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">
                  Results
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
                      <h3 className="font-semibold text-gray-200 mb-2">Polynomial</h3>
                      <div className="p-2 bg-gray-900 rounded border border-gray-700 min-h-[50px] flex items-center justify-center">
                        <div className="text-center max-w-full">
                          <WrappingPolynomialDisplay maxWidth={280}>
                            {result.polynomial.replace(/\^(\d+)/g, '^{$1}').replace(/\*/g, '')}
                          </WrappingPolynomialDisplay>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600">
                      <h3 className="font-semibold text-gray-200 mb-2">Galois Group</h3>
                      <div className="p-4 bg-gray-900 rounded border border-gray-700 shadow-inner min-h-[80px] flex items-center justify-center">
                        <DynamicSizeMath maxWidth={250}>
                          {result.galois_group?.explicit || 'N/A'}
                        </DynamicSizeMath>
                      </div>
                      <div className="text-sm text-gray-300 text-center mt-2 font-medium">
                        Order: {result.galois_group?.order}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
                      <h3 className="font-semibold text-gray-200 mb-2">Group Details</h3>
                      <div className="text-sm text-gray-300 text-center p-2 bg-gray-900 rounded border border-gray-700 break-words">
                        {result.galois_group?.description || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right column */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
                      <h3 className="font-semibold text-gray-200 mb-2">Splitting Field</h3>
                      <div className="text-sm text-gray-300 text-center p-2 bg-gray-900 rounded border border-gray-700 break-words">
                        {result.splitting_field ? (
                          <div className="space-y-2 text-left">
                            <div>
                              <strong className="text-gray-200">Field:</strong>
                              <div className="mt-1 text-xs font-mono bg-gray-800 p-2 rounded">
                                {result.splitting_field.field || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <strong className="text-gray-200">Degree:</strong> 
                              <span className="ml-2">
                                <MathDisplay>{`[\\mathbb{Q}(\\alpha) : \\mathbb{Q}] = ${result.splitting_field.degree || 'N/A'}`}</MathDisplay>
                              </span>
                            </div>
                            {result.splitting_field.defining_polynomial && (
                              <div>
                                <strong className="text-gray-200">Defining Polynomial:</strong>
                                <div className="mt-1 text-xs font-mono bg-gray-800 p-2 rounded">
                                  {result.splitting_field.defining_polynomial}
                                </div>
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-2 italic">
                              {result.splitting_field.description || 'The field containing all roots of the polynomial'}
                            </div>
                            {result.splitting_field.error && (
                              <div className="text-xs text-red-400 mt-2">
                                Error: {result.splitting_field.error}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">Splitting field data not available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Roots section - full width */}
                <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
                  <h3 className="font-semibold text-gray-200 mb-3 text-center">Roots in <MathDisplay inline>{"\\mathbb{C}"}</MathDisplay></h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {result.roots && result.roots.map((root, index) => (
                      <div 
                        key={index}
                        className="bg-gray-900 px-4 py-2 rounded-full border-2 border-purple-500 shadow-sm"
                      >
                        <MathDisplay inline>{root.replace(/√/g, '\\sqrt{').replace(/∛/g, '\\sqrt[3]{').replace(/⁴√/g, '\\sqrt[4]{').replace(/ω/g, '\\omega').replace(/²/g, '^2').replace(/α/g, '\\alpha').replace(/i/g, '\\mathrm{i}')}</MathDisplay>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Educational info */}
            <Card className="shadow-xl bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">💡 About Galois Theory</h3>
                <p className="text-gray-400 leading-relaxed">
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
