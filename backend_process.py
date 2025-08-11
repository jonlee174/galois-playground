#!/usr/bin/env python3

"""
Galois Playground Backend - FastAPI with Process Isolation
This version runs SageMath computations in separate processes to avoid PARI threading conflicts
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn


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


# FastAPI app configuration
app = FastAPI(
    title="Galois Playground API",
    description="Mathematical computation API using SageMath for Galois theory",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


async def run_sage_computation(polynomial_str: str, timeout: int = 30) -> Dict[str, Any]:
    """
    Run SageMath computation in a separate process to avoid threading issues.
    """
    try:
        # Get the path to our SageMath computation script
        script_path = Path(__file__).parent / "sage_compute.py"
        
        # Use sage directly with the computation script
        sage_command = [
            "/bin/bash", "-c", 
            f"source ~/miniforge3/etc/profile.d/conda.sh && conda activate sage && python {script_path} '{polynomial_str}'"
        ]
        
        # Run the computation in a subprocess
        process = await asyncio.create_subprocess_exec(
            *sage_command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        try:
            # Wait for completion with timeout
            stdout, stderr = await asyncio.wait_for(
                process.communicate(), 
                timeout=timeout
            )
            
            if process.returncode == 0:
                # Parse the JSON result
                result = json.loads(stdout.decode())
                return result
            else:
                error_msg = stderr.decode() if stderr else "Unknown error"
                return {
                    "polynomial": polynomial_str,
                    "error": f"Computation failed: {error_msg}",
                    "computation_successful": False
                }
                
        except asyncio.TimeoutError:
            # Kill the process if it times out
            process.kill()
            await process.wait()
            return {
                "polynomial": polynomial_str,
                "error": f"Computation timed out after {timeout} seconds",
                "computation_successful": False
            }
            
    except Exception as e:
        return {
            "polynomial": polynomial_str,
            "error": f"Process execution failed: {str(e)}",
            "computation_successful": False
        }


@app.get("/")
async def root():
    """Root endpoint with basic info."""
    return {
        "message": "Galois Playground Backend API",
        "version": "2.0.0",
        "backend": "FastAPI with Process Isolation",
        "docs": "/docs"
    }


@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify the backend is running."""
    try:
        # Test with a simple polynomial computation
        result = await run_sage_computation("x^2 - 2", timeout=10)
        
        if result.get("computation_successful"):
            return {
                "status": "Backend is running",
                "sage_test": "SageMath computation successful",
                "backend_type": "FastAPI with Process Isolation",
                "test_result": result
            }
        else:
            return {
                "status": "Backend running but SageMath test failed",
                "error": result.get("error"),
                "backend_type": "FastAPI with Process Isolation"
            }
            
    except Exception as e:
        return {
            "status": "Backend running but SageMath unavailable",
            "error": str(e),
            "backend_type": "FastAPI with Process Isolation"
        }


@app.post("/api/galois")
async def compute_galois_endpoint(request: PolynomialRequest) -> ComputationResponse:
    """
    Compute Galois group information for a given polynomial.
    """
    poly_str = request.polynomial.strip()
    
    if not poly_str:
        raise HTTPException(status_code=400, detail="Polynomial cannot be empty")
    
    try:
        # Run the computation in an isolated process
        result = await run_sage_computation(poly_str, timeout=30)
        
        # Return the result (FastAPI will automatically convert to JSON)
        return ComputationResponse(**result)
        
    except Exception as e:
        # Handle any unexpected errors
        raise HTTPException(
            status_code=500, 
            detail=f"Computation failed: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "backend": "FastAPI Process Isolation"}


if __name__ == "__main__":
    print()
    print("Starting Galois Playground Backend (FastAPI + Process Isolation)")
    print("Backend: FastAPI with isolated SageMath processes")
    print("SageMath: Process-isolated computations")
    print("Server: http://localhost:8001")
    print("API Docs: http://localhost:8001/docs")
    
    # Run with uvicorn (FastAPI's recommended server)
    uvicorn.run(
        "backend_process:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        workers=1,  # Single worker to keep things simple
        log_level="info"
    )
