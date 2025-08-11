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
        
        # Check if polynomial is irreducible first
        if not poly.is_irreducible():
            # For reducible polynomials, we can't create a simple number field
            # Instead, we'll return a specific error message
            return {
                "polynomial": polynomial_str,
                "degree": int(poly.degree()),
                "is_irreducible": False,
                "error": "This polynomial is reducible over Q and does not have a single Galois group. Consider its irreducible factors instead.",
                "error_type": "reducible_polynomial",
                "computation_successful": False
            }
        
        # Create number field (only for irreducible polynomials)
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
            if order == 1:
                return "C_1\\cong\\mathbb{Z}/1\\mathbb{Z}"
            elif order == 2:
                return "C_2\\cong\\mathbb{Z}/2\\mathbb{Z}"
            elif "(S" in group_str:
                group_num = group_str.split("(S")[1].split(")")[0]
                return f"S_{group_num}"
            elif "(C" in group_str or (order == 3 and "3T1" in group_str):
                group_num = group_str.split("(C")[1].split(")")[0]
                return "C_" + group_num +"\\cong\\mathbb{Z}/" + group_num +"\\mathbb{Z}"
            elif "D4" in group_str or (order == 8 and "4T3" in group_str):
                return "D_4"
            elif "D3" in group_str or (order == 6 and "3T2" in group_str):
                return "D_3"
            elif "A4" in group_str or (order == 12 and "4T4" in group_str):
                return "A_4"
            elif "A5" in group_str or (order == 60 and "5T4" in group_str):
                return "A_5"
            elif order == 4 and "4T2" in group_str:
                return "V_4\\cong\\mathbb{Z}/2\\times\\mathbb{Z}/2"
            elif order == 8 and "Q8" in group_str:
                return "Q_8"
            # Check for semidirect product pattern ({number}:{number})
            elif "(" in group_str and ":" in group_str and ")" in group_str:
                import re
                semidirect_pattern = r'\((\d+):(\d+)\)'
                match = re.search(semidirect_pattern, group_str)
                if match:
                    n1, n2 = match.groups()
                    return f"C_{{{n1}}}\\rtimes C_{{{n2}}}"
            else:
                return "G_{" + str(order) + "}"

        explicit_group = extract_group_notation(group_name, order)
        
        # Get roots
        complex_roots = poly.complex_roots()
        
        # Format roots as strings for JSON serialization with +- notation
        roots = []
        processed_indices = set()
        
        for i, root in enumerate(complex_roots):
            if i in processed_indices:
                continue
                
            try:
                # Convert to complex number for better representation
                complex_val = complex(root)
                
                if abs(complex_val.imag) < 1e-10:
                    # Real root
                    real_val = complex_val.real
                    
                    # Look for the negative counterpart
                    negative_index = None
                    for j, other_root in enumerate(complex_roots):
                        if j != i and j not in processed_indices:
                            other_complex = complex(other_root)
                            if (abs(other_complex.imag) < 1e-10 and 
                                abs(other_complex.real + real_val) < 1e-6):
                                negative_index = j
                                break
                    
                    if negative_index is not None:
                        # Found a ± pair
                        abs_val = abs(real_val)
                        roots.append(f"\\pm {abs_val:.6f}")
                        processed_indices.add(negative_index)
                    else:
                        # Single root
                        roots.append(f"{real_val:.6f}")
                        
                else:
                    # Complex root - look for conjugate
                    conjugate_index = None
                    for j, other_root in enumerate(complex_roots):
                        if j != i and j not in processed_indices:
                            other_complex = complex(other_root)
                            if (abs(other_complex.real - complex_val.real) < 1e-6 and 
                                abs(other_complex.imag + complex_val.imag) < 1e-6):
                                conjugate_index = j
                                break
                    
                    if conjugate_index is not None:
                        # Found a conjugate pair
                        real_part = complex_val.real
                        imag_part = abs(complex_val.imag)
                        
                        if abs(real_part) < 1e-10:
                            roots.append(f"\\pm {imag_part:.6f}i")
                        else:
                            roots.append(f"{real_part:.6f} \\pm {imag_part:.6f}i")
                        processed_indices.add(conjugate_index)
                    else:
                        # Single complex root
                        if abs(complex_val.real) < 1e-10:
                            roots.append(f"{complex_val.imag:.6f}i")
                        else:
                            roots.append(f"{complex_val.real:.6f} + {complex_val.imag:.6f}i")
                        
            except Exception as e:
                roots.append(str(root))
            
            processed_indices.add(i)
        
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
