#!/usr/bin/env python3

"""
Galois Playground Backend - Ultra Fast Main Backend
This is the main backend using direct SageMath import for maximum speed
"""

import time
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Set environment variables before importing SageMath
import os
os.environ['SAGE_NUM_THREADS'] = '1'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['PARI_SIZE'] = '2000000000'

# Import SageMath directly - this eliminates startup overhead completely
from sage.all import * # type: ignore


# Request/Response models
class PolynomialRequest(BaseModel):
    polynomial: str

class ComputationResponse(BaseModel):
    polynomial: str
    degree: Optional[int] = None
    galois_group: Optional[Dict[str, Any]] = None
    roots: Optional[list] = None
    number_field: Optional[str] = None
    is_irreducible: Any = None
    computation_successful: bool
    error: Optional[str] = None

def extract_group_notation(group, order):
    """
    Convert group pari_label to proper LaTeX notation.
    Handles pari_label formats like:
    - D({number}) for dihedral groups
    - {number}[x]{number} for direct products (like Klein four group)
    - {number}:{number} for semidirect products
    - C{number} for cyclic groups
    - S{number}, A{number} for symmetric/alternating groups
    - "1" for trivial group
    """
    import re

    # Get the pari_label
    group_str = re.findall(r'\(([^)]+)\)', str(group))
    if group_str:
        group_str = group_str[0]
    else:
        group_str = ""

    # Clean up the pari_label string (remove any prefix like "4T2=")
    if '=' in group_str:
        group_str = group_str.split('=')[1].strip()
    else:
        group_str = group_str.strip()
    
    # Handle trivial group
    if group_str == "1" or order == 1:
        return "C_1 \\cong \\{1\\}"
    
    # Special case: S2 is isomorphic to C2
    if group_str == 'S2':
        return 'C_2 \\cong \\mathbb{Z}/2\\mathbb{Z}'
    
    latex_str = group_str
    
    latex_str = re.sub(r'D\((\d+)\)', r'D_{\1}', latex_str)
    
    direct_product_match = re.match(r'^(\d+)\[x\](\d+)$', latex_str)
    if direct_product_match:
        n, m = direct_product_match.groups()
        if n == m == '2':
            return "V_4 \\cong C_2 \\times C_2"  # Klein four group
        else:
            return f"C_{{{n}}} \\times C_{{{m}}}"

    if '[x]' in latex_str:
        factors = re.findall(r'\d+', latex_str)
        if len(factors) >= 2:
            cyclic_factors = [f"C_{{{f}}}" for f in factors]
            latex_str = " \\times ".join(cyclic_factors)
    
    semidirect_match = re.match(r'^(\d+):(\d+)$', latex_str)
    if semidirect_match:
        n, m = semidirect_match.groups()
        return f"C_{{{n}}} \\rtimes C_{{{m}}}"
    
    cyclic_match = re.match(r'^C(\d+)$', latex_str)
    if cyclic_match:
        n = cyclic_match.group(1)
        return f"C_{{{n}}} \\cong \\mathbb{{Z}}/{n}\\mathbb{{Z}}"
    
    
    # Symmetric groups: Sn -> S_{n}
    latex_str = re.sub(r'\bS(\d+)\b', r'S_{\1}', latex_str)
    
    # Alternating groups: An -> A_{n}
    latex_str = re.sub(r'\bA(\d+)\b', r'A_{\1}', latex_str)
    
    # Quaternion groups: Qn -> Q_{n}
    latex_str = re.sub(r'\bQ(\d+)\b', r'Q_{\1}', latex_str)
    
    # Handle remaining generic patterns:
    
    # Direct products with 'x': "A x B" -> "A \\times B"
    latex_str = re.sub(r'\s+x\s+', r' \\times ', latex_str)
    
    # Semidirect products with ':': "A : B" -> "A \\rtimes B"
    latex_str = re.sub(r'\s+:\s+', r' \\rtimes ', latex_str)
    
    # Special well-known group cases
    special_cases = {
        "S_3": "S_3 \\cong D_3",
        "S_4": "S_4",
        "A_4": "A_4",
        "A_5": "A_5",
        "D_4": "D_4",
        "D_6": "D_6 \\cong S_3",
        "Q_8": "Q_8",
        "V_4": "V_4 \\cong C_2 \\times C_2",
    }
    
    if latex_str in special_cases:
        return special_cases[latex_str]
    
    # If no specific pattern matched, return the processed string or fallback
    return latex_str if latex_str != group_str else f"G_{{{order}}}"


def compute_galois_info(polynomial_str):
    """Compute Galois group information for the given polynomial."""
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
        
        if group.is_galois():
            degree = order
        else:
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


# FastAPI app configuration
app = FastAPI(
    title="Galois Playground API",
    description="Mathematical computation API using SageMath",
    version="4.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint with basic info."""
    return {
        "message": "Galois Playground Backend API",
        "version": "4.0.0",
        "backend": "FastAPI with Direct SageMath Import",
        "sage_ready": True,
        "docs": "/docs"
    }


@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify the backend is running."""
    try:
        # Test with a simple polynomial computation
        start_time = time.time()
        result = compute_galois_info("x^2 - 2")
        computation_time = time.time() - start_time
        
        if result.get("computation_successful"):
            return {
                "status": "Backend is running",
                "sage_test": "SageMath computation successful",
                "backend_type": "FastAPI with Direct SageMath Import",
                "computation_time_seconds": round(computation_time, 4),
                "test_result": result
            }
        else:
            return {
                "status": "Backend running but SageMath test failed",
                "error": result.get("error"),
                "backend_type": "FastAPI with Direct SageMath Import"
            }
            
    except Exception as e:
        return {
            "status": "Backend running but SageMath unavailable",
            "error": str(e),
            "backend_type": "FastAPI with Direct SageMath Import"
        }


@app.post("/api/galois")
async def compute_galois_endpoint(request: PolynomialRequest) -> ComputationResponse:
    """Compute Galois group information for a given polynomial using direct SageMath import."""
    poly_str = request.polynomial.strip()
    
    if not poly_str:
        raise HTTPException(status_code=400, detail="Polynomial cannot be empty")
    
    try:
        # Run the computation directly - no subprocess overhead!
        start_time = time.time()
        result = compute_galois_info(poly_str)
        computation_time = time.time() - start_time
        
        # Add timing information for debugging
        if result.get("computation_successful"):
            result["computation_time_seconds"] = round(computation_time, 4)
        
        # Return the result
        return ComputationResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Computation failed: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy", 
        "backend": "FastAPI Direct SageMath",
        "sage_imported": True
    }


if __name__ == "__main__":
    print()
    print("Starting Galois Playground Backend")
    print("Backend: FastAPI with direct SageMath import")
    print("SageMath: Imported directly for maximum speed!")
    print("Server: http://localhost:8001")
    print("API Docs: http://localhost:8001/docs")
    print("Optimized: No subprocess overhead - ultra fast computations!")
    
    # Run with uvicorn
    uvicorn.run(
        "backend:app",
        host="0.0.0.0",
        port=8001,
        reload=False,  # Disable reload to keep SageMath imported
        workers=1,
        log_level="info"
    )
    '''R = PolynomialRing(QQ, 'x')
    x = R.gen()

    poly = sage_eval(input("Enter a polynomial in x: "), locals={'x': x})
    print(poly)
    K = NumberField(poly, names=('a',))
    print(K)
    group = K.galois_group()
    print(group)
    order = int(group.order())
    print(f"Order: {order}")
    group_name = str(group)
    print(f"Group Name: {group_name}")
    explicit_group = extract_group_notation(group, order)
    print(f"Explicit Group: {explicit_group}")
    complex_roots = poly.complex_roots()
    print(f"Complex Roots: {complex_roots}")'''