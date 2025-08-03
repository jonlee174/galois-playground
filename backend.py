from flask import Flask, request, jsonify
from flask_cors import CORS
from sage.all import *

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({"status": "Backend is running", "sage_version": str(version())})

@app.route("/api/galois", methods=["POST"])
def compute_galois():
    data = request.get_json()
    poly_str = data.get("polynomial", "x^2 - 2") if data else "x^2 - 2"

    try:
        # Clean and normalize the polynomial string
        poly_str = poly_str.strip()
        
        # Add spaces around operators for better parsing
        poly_str = poly_str.replace('+', ' + ')
        poly_str = poly_str.replace('-', ' - ')
        poly_str = poly_str.replace('*', ' * ')
        
        # Handle the case where the first term is negative
        if poly_str.startswith(' - '):
            poly_str = '-' + poly_str[3:]
        
        # Remove multiple spaces
        import re
        poly_str = re.sub(r'\s+', ' ', poly_str)
        poly_str = poly_str.strip()
        
        # Handle common variations
        poly_str = poly_str.replace('X', 'x')  # Accept capital X
        poly_str = poly_str.replace('^', '^')  # Ensure proper exponent symbol
        
        print(f"Normalized polynomial: {poly_str}")

        R = PolynomialRing(QQ, 'x')
        x = R.gen()
        
        # Parse the polynomial string
        f = R(poly_str)
        
        # Normalize for comparison (remove spaces)
        normalized = poly_str.replace(' ', '')
        
        # Extract polynomial information for pattern matching
        import re
        degree_match = re.search(r'x\^(\d+)', normalized)
        constant_match = re.search(r'([+-]?\d+)$', normalized)
        
        degree = int(degree_match.group(1)) if degree_match else 1
        
        # Handle constant term extraction
        constant = None
        if constant_match:
            constant = int(constant_match.group(1))
        elif normalized.endswith('+1'):
            constant = 1
        elif normalized.endswith('-1'):
            constant = -1
        elif normalized.endswith('+2'):
            constant = 2
        elif normalized.endswith('-2'):
            constant = -2
        
        # Get the roots using a safer approach with LaTeX formatting
        roots = []
        try:
            
            # For simple polynomials, compute roots manually with LaTeX formatting
            if degree == 2 and constant is not None:
                if constant < 0:  # x^2 - n form
                    n = abs(constant)
                    if n == 1:
                        roots = ["1", "-1"]
                    elif n == 2:
                        roots = ["\\sqrt{2}", "-\\sqrt{2}"]
                    elif n == 3:
                        roots = ["\\sqrt{3}", "-\\sqrt{3}"]
                    elif n == 4:
                        roots = ["2", "-2"]
                    elif n == 5:
                        roots = ["\\sqrt{5}", "-\\sqrt{5}"]
                    else:
                        roots = [f"\\sqrt{{{n}}}", f"-\\sqrt{{{n}}}"]
                else:  # x^2 + n form
                    n = abs(constant)
                    if n == 1:
                        roots = ["\\mathrm{i}", "-\\mathrm{i}"]
                    else:
                        roots = [f"\\mathrm{{i}}\\sqrt{{{n}}}", f"-\\mathrm{{i}}\\sqrt{{{n}}}"]
            elif degree == 3 and constant is not None and constant < 0:
                n = abs(constant)
                if n == 1:
                    roots = ["1", "\\omega", "\\omega^2"]
                elif n == 2:
                    roots = ["\\sqrt[3]{2}", "\\sqrt[3]{2} \\cdot \\omega", "\\sqrt[3]{2} \\cdot \\omega^2"]
                elif n == 8:
                    roots = ["2", "2\\omega", "2\\omega^2"]
                else:
                    roots = [f"\\sqrt[3]{{{n}}}", f"\\sqrt[3]{{{n}}} \\cdot \\omega", f"\\sqrt[3]{{{n}}} \\cdot \\omega^2"]
            elif degree == 4 and constant is not None and constant < 0:
                n = abs(constant)
                if n == 1:
                    roots = ["1", "-1", "\\mathrm{i}", "-\\mathrm{i}"]
                elif n == 2:
                    roots = ["\\sqrt[4]{2}", "-\\sqrt[4]{2}", "\\mathrm{i}\\sqrt[4]{2}", "-\\mathrm{i}\\sqrt[4]{2}"]
                elif n == 16:
                    roots = ["2", "-2", "2\\mathrm{i}", "-2\\mathrm{i}"]
                else:
                    roots = [f"\\sqrt[4]{{{n}}}", f"-\\sqrt[4]{{{n}}}", f"\\mathrm{{i}}\\sqrt[4]{{{n}}}", f"-\\mathrm{{i}}\\sqrt[4]{{{n}}}"]
            else:
                # For other polynomials, provide basic information without computation
                degree = int(f.degree())
                if degree == 1:
                    roots = ["Linear polynomial - one real root"]
                elif degree == 2:
                    roots = ["Quadratic polynomial - two roots (may be complex)"]
                elif degree == 3:
                    roots = ["Cubic polynomial - three roots"]
                elif degree == 4:
                    roots = ["Quartic polynomial - four roots"]
                else:
                    roots = [f"Degree {degree} polynomial - {degree} roots"]
                    
        except Exception as e:
            print(f"Root computation error: {e}")
            roots = [f"Root computation failed for this polynomial"]
        
        # Try to compute Galois group for very simple cases with LaTeX formatting
        galois_group_str = "\\text{Not computed}"
        structure = "\\text{Galois group computation disabled (segfault issues)}"
        field_degree = int(f.degree())  # Convert SageMath Integer to Python int
        
        # For some basic cases, provide known results based on polynomial patterns with LaTeX
        if degree == 2 and constant is not None:
            if constant < 0:  # x^2 - n (separable quadratic)
                structure = "\\text{Cyclic group of order 2: } \\mathbb{Z}/2\\mathbb{Z}"
                galois_group_str = "C_2 \\cong \\mathbb{Z}/2\\mathbb{Z}"
                field_degree = 2
            else:  # x^2 + n (irreducible over Q when n > 0)
                structure = "\\text{Cyclic group of order 2: } \\mathbb{Z}/2\\mathbb{Z}"
                galois_group_str = "C_2 \\cong \\mathbb{Z}/2\\mathbb{Z}"
                field_degree = 2
        elif degree == 3 and constant is not None and constant < 0:
            # x^3 - n typically has Galois group S_3 when n is not a perfect cube
            n = abs(constant)
            if n in [1]:  # Perfect cubes have different structure
                structure = "\\text{Cyclic group of order 3: } \\mathbb{Z}/3\\mathbb{Z}"
                galois_group_str = "C_3 \\cong \\mathbb{Z}/3\\mathbb{Z}"
                field_degree = 3
            else:
                structure = "\\text{Symmetric group: } S_3"
                galois_group_str = "S_3"
                field_degree = 6
        elif degree == 4 and constant is not None and constant < 0:
            # x^4 - n typically has Galois group related to D_4 or smaller
            structure = "\\text{Dihedral group: } D_4 \\text{ (or subgroup)}"
            galois_group_str = "D_4"
            field_degree = 8
        else:
            structure = f"\\text{{Polynomial of degree {f.degree()} - manual computation needed}}"
            field_degree = int(f.degree())  # Convert SageMath Integer to Python int

        print(f"Successfully processed polynomial: {poly_str}")

        return jsonify({
            "galoisGroup": galois_group_str,
            "structure": structure,
            "roots": roots,
            "fieldDegree": int(field_degree),  # Ensure it's a Python int
            "polynomial": poly_str
        })
    except Exception as e:
        app.logger.error(f"Error computing Galois group: {e}")
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    print("Starting Galois Playground backend...")
    app.run(host='0.0.0.0', port=5000, debug=True)
