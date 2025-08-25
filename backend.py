#!/usr/bin/env python3

"""
Galois Playground Backend
This is the main backend using direct SageMath import for maximum speed
"""

import time
from typing import Dict, Any, Optional
from chm_label_to_tex import extract_group_notation

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
    compute_splitting_field: Optional[bool] = False

class SplittingFieldRequest(BaseModel):
    polynomial: str

class ComputationResponse(BaseModel):
    polynomial: str
    degree: Optional[int] = None
    galois_group: Optional[Dict[str, Any]] = None
    splitting_field: Optional[Dict[str, Any]] = None
    roots: Optional[list] = None
    number_field: Optional[str] = None
    is_irreducible: Any = None
    computation_successful: bool
    error: Optional[str] = None

class SplittingFieldResponse(BaseModel):
    polynomial: str
    splitting_field: Optional[Dict[str, Any]] = None
    computation_successful: bool
    error: Optional[str] = None


def compute_splitting_field(polynomial_str):
    """Compute splitting field information for the given polynomial."""
    try:
        R = PolynomialRing(QQ, 'x')
        x = R.gen()
        
        poly = sage_eval(polynomial_str, locals={'x': x})

        if not poly.is_irreducible():
            return {
                "polynomial": str(poly.factor()),
                "splitting_field": None,
                "error": "This polynomial is reducible over Q. Consider its irreducible factors instead.",
                "error_type": "reducible_polynomial",
                "computation_successful": False
            }
        
        if poly.degree() >= 12:
            return {
                "polynomial": str(poly.factor()),
                "splitting_field": None,
                "error": "Polynomials of degree 12 or higher are not supported for splitting field computation.",
                "error_type": "degree_too_high",
                "computation_successful": False
            }
        
        try:
            splitting_field = poly.splitting_field('b')
            
            field_str = str(splitting_field)
            field_degree = int(splitting_field.degree())
            
            try:
                if hasattr(splitting_field, 'defining_polynomial'):
                    defining_poly = str(splitting_field.defining_polynomial())
                else:
                    defining_poly = None
            except:
                defining_poly = None
            
            splitting_field_info = {
                "field": field_str,
                "degree": field_degree,
                "defining_polynomial": defining_poly,
                "description": f"The splitting field of {poly} over ℚ",
                "computed": True
            }
            
            return {
                "polynomial": str(poly.factor()),
                "splitting_field": splitting_field_info,
                "computation_successful": True
            }
            
        except Exception as e:
            return {
                "polynomial": str(poly.factor()),
                "splitting_field": None,
                "error": f"Failed to compute splitting field: {str(e)}",
                "computation_successful": False
            }
        
    except Exception as e:
        return {
            "polynomial": str(poly) if 'poly' in locals() else polynomial_str,
            "error": str(e),
            "computation_successful": False
        }


def compute_galois_info(polynomial_str, compute_splitting_field=False):
    """Compute Galois group information for the given polynomial."""
    try:
        R = PolynomialRing(QQ, 'x')
        x = R.gen()
        
        poly = sage_eval(polynomial_str, locals={'x': x})

        if not poly.is_irreducible():
            return {
                "polynomial": str(poly.factor()),
                "degree": int(poly.degree()),
                "is_irreducible": False,
                "error": "This polynomial is reducible over Q and does not have a single Galois group. Consider its irreducible factors instead.",
                "error_type": "reducible_polynomial",
                "computation_successful": False
            }
        
        if poly.degree() >= 12:
            return {
                "polynomial": str(poly.factor()),
                "degree": int(poly.degree()),
                "is_irreducible": True,
                "error": "Polynomials of degree 12 or higher are not supported. Galois group computations for high-degree polynomials can be extremely time-intensive. Please try a polynomial of degree 11 or lower.",
                "error_type": "degree_too_high",
                "computation_successful": False
            }

        K = NumberField(poly, names=('a',))
        group = K.galois_group()
        order = int(group.order())
        group_name = str(group)
        explicit_group = extract_group_notation(group, poly)
        
        degree = order
            
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
        
        try:
            is_irreducible = bool(poly.is_irreducible())
        except:
            is_irreducible = "Unknown"
        
        # Initialize result without splitting field info
        result = {
            "polynomial": str(poly.factor()),
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
        
        # Only compute splitting field if requested
        if compute_splitting_field:
            try:
                splitting_field = poly.splitting_field('b')
                
                field_str = str(splitting_field)
                field_degree = int(splitting_field.degree())
                
                try:
                    if hasattr(splitting_field, 'defining_polynomial'):
                        defining_poly = str(splitting_field.defining_polynomial())
                    else:
                        defining_poly = None
                except:
                    defining_poly = None
                
                splitting_field_info = {
                    "field": field_str,
                    "degree": field_degree,
                    "defining_polynomial": defining_poly,
                    "description": f"The splitting field of {poly} over ℚ",
                    "computed": True
                }
                
                result["splitting_field"] = splitting_field_info
                
            except Exception as e:
                # Fallback: provide some basic information even if splitting field computation fails
                splitting_field_info = {
                    "field": f"Splitting field computation failed",
                    "degree": degree,  # Use Galois group order as approximation
                    "defining_polynomial": None,
                    "description": f"Unable to compute splitting field. Error: {str(e)[:50]}...",
                    "computed": False,
                    "error": str(e)
                }
                
                result["splitting_field"] = splitting_field_info
        
        return result
        
    except Exception as e:
        return {
            "polynomial": str(poly) if 'poly' in locals() else polynomial_str,
            "error": str(e),
            "computation_successful": False
        }


# FastAPI app configuration
app = FastAPI(
    title="Galois Playground API",
    description="Mathematical computation API using SageMath",
    version="4.0.0"
)

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
        "version": "4.1.0",
        "backend": "FastAPI with Direct SageMath Import",
        "sage_ready": True,
        "max_polynomial_degree": 11,
        "supported_features": [
            "Galois group computation for irreducible polynomials",
            "Polynomial root calculation",
            "LaTeX group notation formatting",
            "Optional splitting field computation",
            "Separate API for splitting field calculations",
            "Degree 1-11 polynomials supported"
        ],
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
    compute_sf = request.compute_splitting_field if request.compute_splitting_field is not None else False
    
    if not poly_str:
        raise HTTPException(status_code=400, detail="Polynomial cannot be empty")
    
    try:
        start_time = time.time()
        
        result = compute_galois_info(poly_str, False)
        computation_time = time.time() - start_time
        
        if result.get("computation_successful"):
            result["computation_time_seconds"] = round(computation_time, 4)
            
            # If splitting field computation is requested, add a placeholder
            if compute_sf:
                result["splitting_field"] = {
                    "field": "Computing...",
                    "degree": None,
                    "defining_polynomial": None,
                    "description": "The splitting field computation is in progress",
                    "computed": False,
                    "computing": True
                }
        
        return ComputationResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Computation failed: {str(e)}"
        )


@app.post("/api/splitting-field")
async def compute_splitting_field_endpoint(request: SplittingFieldRequest) -> SplittingFieldResponse:
    """Compute splitting field information for a given polynomial."""
    poly_str = request.polynomial.strip()
    
    if not poly_str:
        raise HTTPException(status_code=400, detail="Polynomial cannot be empty")
    
    try:
        start_time = time.time()
        result = compute_splitting_field(poly_str)
        computation_time = time.time() - start_time
        
        if result.get("computation_successful"):
            result["computation_time_seconds"] = round(computation_time, 4)
        
        return SplittingFieldResponse(**result)
        
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

def test_sage_capabilities():
    R = PolynomialRing(QQ, 'x')
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
    explicit_group = extract_group_notation(group, poly)
    print(f"Explicit Group: {explicit_group}")
    complex_roots = poly.complex_roots()
    print(f"Complex Roots: {complex_roots}")

if __name__ == "__main__":
    print()
    print("Starting Galois Playground Backend")
    print("Backend: FastAPI with direct SageMath import")
    print("Server: http://localhost:8001")
    print("API Docs: http://localhost:8001/docs")
    
    uvicorn.run(
        "backend:app",
        host="0.0.0.0",
        port=8001,
        reload=False,  # Disable reload to keep SageMath imported
        workers=1,
        log_level="info"
    )
