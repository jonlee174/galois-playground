#!/usr/bin/env python3

"""
Isolated SageMath computation script
This runs in a separate process to avoid PARI conflicts
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
"""

import sys
import json
import os

# Set single-threaded PARI before importing SageMath
os.environ['SAGE_NUM_THREADS'] = '1'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['PARI_SIZE'] = '2000000000'

from sage.all import * # type: ignore

def get_group_description_with_timeout(group, timeout=10):
    """
    Try to get the structure description with a timeout, falling back to pari_label
    """
    import signal
    
    def timeout_handler(signum, frame):
        raise TimeoutError("Structure description computation timed out")
    
    # Set up timeout
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(timeout)
    
    try:
        # Try to get structure description first
        desc = str(group.structure_description())
        signal.alarm(0)  # Cancel alarm
        return desc
    except (TimeoutError, Exception):
        # If timeout or any other error occurs, fall back to pari_label
        signal.alarm(0)  # Cancel alarm
        return str(group.pari_label())
    finally:
        signal.alarm(0)  # Ensure alarm is cancelled

def extract_group_notation(group, order):
    """
    Convert group structure description to proper LaTeX notation.
    Handles output from GAP's structure_description() which gives strings like:
    - "C2 x C2", "C3", "D8", "S4", "A5"
    - "C7 : C3" (semidirect products)
    - "Q8" (quaternion group)
    - "1" (trivial group)
    """
    import re
    
    # Get group description with timeout
    group_str = get_group_description_with_timeout(group)
    group_str = str(group_str).strip()
    
    # Handle trivial group
    if group_str == "1" or order == 1:
        return "C_1 \\cong \\{1\\}"
    
    # Replace common group notation patterns with LaTeX
    latex_str = group_str
    
    # Cyclic groups: C12 -> C_{12}
    latex_str = re.sub(r'\bC(\d+)\b', r'C_{\1}', latex_str)
    
    # Dihedral groups: D8 -> D_{8}
    latex_str = re.sub(r'\bD(\d+)\b', r'D_{\1}', latex_str)
    
    # Symmetric groups: S4 -> S_{4}
    latex_str = re.sub(r'\bS(\d+)\b', r'S_{\1}', latex_str)
    
    # Alternating groups: A5 -> A_{5}
    latex_str = re.sub(r'\bA(\d+)\b', r'A_{\1}', latex_str)
    
    # Quaternion groups: Q8 -> Q_{8}
    latex_str = re.sub(r'\bQ(\d+)\b', r'Q_{\1}', latex_str)
    
    # Direct products: " x " -> " \\times "
    latex_str = re.sub(r'\s+x\s+', r' \\times ', latex_str)
    
    # Semidirect products: " : " -> " \\rtimes "
    latex_str = re.sub(r'\s+:\s+', r' \\rtimes ', latex_str)
    
    # Handle Klein four-group specifically (often appears as C2 x C2)
    if order == 4 and ("C_2 \\times C_2" in latex_str or "C2 x C2" in group_str):
        return "V_4 \\cong C_2 \\times C_2"
    
    # Add isomorphism notation for simple cyclic groups
    cyclic_match = re.match(r'^C_\{(\d+)\}$', latex_str)
    if cyclic_match:
        n = cyclic_match.group(1)
        return f"C_{{{n}}} \\cong \\mathbb{{Z}}/{n}\\mathbb{{Z}}"
    
    special_cases = {
        "S_3": "S_3 \\cong D_3",
        "S_4": "S_4",
        "A_4": "A_4",
        "A_5": "A_5",
        "D_4": "D_4",
        "D_6": "D_6 \\cong S_3",
        "Q_8": "Q_8",
    }
    
    if latex_str in special_cases:
        return special_cases[latex_str]
    
    return latex_str if latex_str != group_str else f"G_{{{order}}}"

def compute_galois_info(polynomial_str):
    """
    Compute Galois group information for the given polynomial.
    """
    try:
        R = PolynomialRing(QQ, 'x')
        x = R.gen()
        
        poly = sage_eval(polynomial_str, locals={'x': x})

        if not poly.is_irreducible():
            return {
                "polynomial": polynomial_str,
                "degree": int(poly.degree()),
                "is_irreducible": False,
                "error": "This polynomial is reducible over Q and does not have a single Galois group. Consider its irreducible factors instead.",
                "error_type": "reducible_polynomial",
                "computation_successful": False
            }
        
        K = NumberField(poly, names=('a',))
        group = K.galois_group()
        order = int(group.order())
        group_name = str(group)
        explicit_group = extract_group_notation(group, order)
        complex_roots = poly.complex_roots()
        
        roots = []
        processed_indices = set()
        
        for i, root in enumerate(complex_roots):
            if i in processed_indices:
                continue
                
            try:
                complex_val = complex(root)
                
                if abs(complex_val.imag) < 1e-10:
                    real_val = complex_val.real
                    negative_index = None
                    for j, other_root in enumerate(complex_roots):
                        if j != i and j not in processed_indices:
                            other_complex = complex(other_root)
                            if (abs(other_complex.imag) < 1e-10 and 
                                abs(other_complex.real + real_val) < 1e-6):
                                negative_index = j
                                break
                    
                    if negative_index is not None:
                        abs_val = abs(real_val)
                        roots.append(f"\\pm {abs_val:.6f}")
                        processed_indices.add(negative_index)
                    else:
                        roots.append(f"{real_val:.6f}")
                        
                else:
                    conjugate_index = None
                    for j, other_root in enumerate(complex_roots):
                        if j != i and j not in processed_indices:
                            other_complex = complex(other_root)
                            if (abs(other_complex.real - complex_val.real) < 1e-6 and 
                                abs(other_complex.imag + complex_val.imag) < 1e-6):
                                conjugate_index = j
                                break
                    
                    if conjugate_index is not None:
                        real_part = complex_val.real
                        imag_part = abs(complex_val.imag)
                        
                        if abs(real_part) < 1e-10:
                            roots.append(f"\\pm {imag_part:.6f}i")
                        else:
                            roots.append(f"{real_part:.6f} \\pm {imag_part:.6f}i")
                        processed_indices.add(conjugate_index)
                    else:
                        if abs(complex_val.real) < 1e-10:
                            roots.append(f"{complex_val.imag:.6f}i")
                        else:
                            roots.append(f"{complex_val.real:.6f} + {complex_val.imag:.6f}i")
                        
            except Exception as e:
                roots.append(str(root))
            
            processed_indices.add(i)
        
        degree = int(poly.degree())
        
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
