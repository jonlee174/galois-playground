from flask import Flask, request, jsonify
from flask_cors import CORS
from sage.all import *
from sage.rings.number_field.galois_group import GaloisGroup_v2
import signal
import time
import threading
from queue import Queue, Empty

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
        
        # Handle common variations
        poly_str = poly_str.replace('X', 'x')  # Accept capital X
        
        # Remove extra spaces but preserve structure
        import re
        poly_str = re.sub(r'\s+', ' ', poly_str).strip()
        
        print(f"Processing polynomial: {poly_str}")

        # Create polynomial ring and parse
        R = PolynomialRing(QQ, 'x')
        x = R.gen()
        
        try:
            # Try direct parsing first
            f = R(poly_str)
        except:
            # If that fails, try with sage_eval
            f = sage_eval(poly_str, locals={'x': x})
            f = R(f)
        
        print(f"Parsed polynomial: {f}")
        
        # Ensure polynomial is irreducible for meaningful Galois group
        if not f.is_irreducible():
            print(f"Warning: polynomial {f} is not irreducible")
        
        field_degree = int(f.degree())

        return jsonify({
            "galoisGroup": f.galois_group(),
            "structure": f.galois_group().structure(),
            "roots": f.roots(),
            "fieldDegree": field_degree,
            "polynomial": str(f),
            "galoisOrder": f.galois_group().order()
        })
        
    except Exception as e:
        print(f"Error in compute_galois: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    print("Starting Galois Playground backend...")
    R = ZZ['x']; (x,) = R._first_ngens(1)
    x = polygen(ZZ, 'x')
    K = NumberField(x**Integer(3) - Integer(2), names=('a',)); (a,) = K._first_ngens(1)
    G = K.galois_group(type='pari')

    print(f"Is Galois: {G.is_galois()}\nGroup order: {G.order()}\nGroup structure: {G}\nRoots: {x.roots()}\nField degree: {K.degree()}")
    #app.run(host='0.0.0.0', port=5000, debug=True)
