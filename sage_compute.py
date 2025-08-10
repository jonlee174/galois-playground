#!/usr/bin/env python3

"""
Isolated SageMath computation script
This runs in a separate process to avoid PARI         result = {
            "polynomial": polynomial_str,
            "degree": degree,
            "galois_group": {
                "order": order,
                "description": group_name,
                "structure": group_name,
                "explicit": explicit_group
            },
            "roots": roots,
            "number_field": str(K),
            "is_irreducible": is_irreducible,
            "computation_successful": True
        }flicts
"""

import sys
import json
import os

# Set single-threaded PARI before importing SageMath
os.environ['SAGE_NUM_THREADS'] = '1'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['PARI_SIZE'] = '50000000'

# Import SageMath at module level
from sage.all import * # type: ignore

def compute_galois_info(polynomial_str):
    """
    Compute Galois group information for the given polynomial.
    This is the exact same logic as in the original backend.
    """
    try:
        # Set up polynomial ring
        R = PolynomialRing(QQ, 'x')
        x = R.gen()
        
        # Parse the polynomial
        poly = sage_eval(polynomial_str, locals={'x': x})
        
        # Create number field
        K = NumberField(poly, names=('a',))
        
        # Get Galois group
        group = K.galois_group()
        
        # Get polynomial information
        order = int(group.order())
        group_name = str(group)
        
        # Extract explicit group notation (e.g., S3, C2, D4)
        def extract_group_notation(group_str, order):
            """Extract concise group notation from SageMath group description"""
            # Common patterns in SageMath Galois group descriptions
            if "S2" in group_str or (order == 2 and "2T1" in group_str):
                return "S₂"
            elif "S3" in group_str or (order == 6 and "3T2" in group_str):
                return "S₃"
            elif "S4" in group_str or (order == 24 and "4T5" in group_str):
                return "S₄"
            elif "S5" in group_str or (order == 120 and "5T5" in group_str):
                return "S₅"
            elif "C3" in group_str or (order == 3 and "3T1" in group_str):
                return "C₃"
            elif "C4" in group_str or (order == 4 and "4T1" in group_str):
                return "C₄"
            elif "C5" in group_str or (order == 5 and "5T1" in group_str):
                return "C₅"
            elif "D4" in group_str or (order == 8 and "4T3" in group_str):
                return "D₄"
            elif "D3" in group_str or (order == 6 and "3T2" in group_str):
                return "D₃"
            elif "A4" in group_str or (order == 12 and "4T4" in group_str):
                return "A₄"
            elif "A5" in group_str or (order == 60 and "5T4" in group_str):
                return "A₅"
            elif order == 1:
                return "C₁"
            elif order == 2:
                return "C₂"
            elif order == 4 and "V4" in group_str:
                return "V₄"  # Klein four-group
            elif order == 8 and "Q8" in group_str:
                return "Q₈"  # Quaternion group
            else:
                # Fall back to generic notation
                if order <= 12:
                    return f"G_{order}"
                else:
                    return f"G_{order}"
        
        explicit_group = extract_group_notation(group_name, order)
        
        # Get roots
        complex_roots = poly.complex_roots()
        
        # Format roots as strings for JSON serialization
        roots = []
        for root in complex_roots:
            try:
                # Convert to complex number for better representation
                complex_val = complex(root)
                if abs(complex_val.imag) < 1e-10:
                    # Essentially real
                    roots.append(f"{complex_val.real:.6f}")
                else:
                    roots.append(f"{complex_val.real:.6f} + {complex_val.imag:.6f}i")
            except:
                roots.append(str(root))
        
        # Get polynomial degree and other info
        degree = int(poly.degree())
        
        # Check if polynomial is irreducible
        try:
            is_irreducible = bool(poly.is_irreducible())
        except:
            is_irreducible = "Unknown"
        
        result = {
            "polynomial": polynomial_str,
            "degree": degree,
            "galois_group": {
                "order": order,
                "description": group_name,
                "structure": group_name,
                "explicit": explicit_group
            },
            "roots": roots,
            "number_field": str(K),
            "is_irreducible": is_irreducible,
            "computation_successful": True
        }
        
        return result
        
    except Exception as e:
        return {
            "polynomial": polynomial_str,
            "error": str(e),
            "computation_successful": False
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: sage_compute.py <polynomial>"}))
        sys.exit(1)
    
    polynomial_str = sys.argv[1]
    result = compute_galois_info(polynomial_str)
    print(json.dumps(result))
