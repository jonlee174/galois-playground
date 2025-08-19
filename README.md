# Galois Theory Playground

A modern web application for exploring Galois theory and field extensions. Input polynomials with rational coefficients and discover their Galois groups, roots, and mathematical properties through an intuitive interface powered by SageMath.

## Features

- **Interactive Polynomial Input**: Enter polynomials with LaTeX preview
- **Galois Group Computation**: Calculate Galois groups for irreducible polynomials over Q
- **Root Analysis**: Display polynomial roots with elegant ± notation for conjugate pairs
- **Mathematical Notation**: Beautiful LaTeX rendering with MathJax
- **Error Handling**: Clear feedback for reducible polynomials and computation errors
- **Real-time Results**: Ultra-fast computation using direct SageMath import (< 1 second)

## Supported Polynomials

The application supports polynomials with rational coefficients up to **degree 11**:

- **Simple forms**: x^n ± c (e.g., x^3-2, x^4+5)
- **Quadratic-like**: x^4 + ax^2 + b (e.g., x^4-10x^2+1)
- **General polynomials**: a_n*x^n + ... + a_1*x + a_0 with rational coefficients

**Important restrictions:**
- Polynomials must be **irreducible over Q** for Galois group computation
- **Maximum degree is 11** - higher degree polynomials are computationally prohibitive
- The application will detect and notify you if a polynomial is reducible or too high degree

## Technology Stack

### Backend
- **Python 3.12+** with SageMath
- **FastAPI** for REST API
- **Direct SageMath import** for maximum performance (no subprocess overhead)
- **Uvicorn** ASGI server

### Frontend
- **React 18** with modern hooks
- **Vite** for development and building
- **Tailwind CSS** for styling
- **MathJax** for LaTeX rendering

## Installation

### Prerequisites
- Python 3.12 or higher
- Node.js 16 or higher
- SageMath (via conda)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jonlee174/galois-playground.git
   cd galois-playground
   ```

2. **Set up SageMath environment**
   ```bash
   conda create -n sage sage python=3.12
   conda activate sage
   ```

3. **Install Python dependencies**
   ```bash
   pip install fastapi uvicorn
   ```

4. **Install frontend dependencies**
   ```bash
   cd ui
   npm install
   cd ..
   ```

## Usage

### Quick Start (Recommended)
Start the backend and frontend:
```bash
# Start backend
./start-backend.sh

# In another terminal, start frontend
cd ui
npm run dev
```

This will start:
- Backend on http://localhost:8001 (optimized, < 1 second response time)
- Frontend on http://localhost:3000

### Manual Start

**Start the backend:**
```bash
./start-backend.sh
```

**Or manually:**
```bash
conda activate sage
python backend.py
```

**Start the frontend:**
```bash
cd ui
npm run dev
```

### API Usage

The backend provides a REST API at `http://localhost:8001`:

**Compute Galois group:**
```bash
curl -X POST "http://localhost:8001/api/galois" \
     -H "Content-Type: application/json" \
     -d '{"polynomial": "x^4-10*x^2+1"}'
```

**Response example:**
```json
{
  "polynomial": "x^4-10*x^2+1",
  "degree": 4,
  "galois_group": {
    "order": 4,
    "description": "Galois group 4T2 (2[x]2) with order 4 of x^4 - 10*x^2 + 1",
    "structure": "Galois group 4T2 (2[x]2) with order 4 of x^4 - 10*x^2 + 1",
    "explicit": "V_4\\cong\\mathbb{Z}/2\\times\\mathbb{Z}/2"
  },
  "roots": ["±3.146264", "±0.317837"],
  "number_field": "Number Field in a with defining polynomial x^4 - 10*x^2 + 1",
  "is_irreducible": true,
  "computation_successful": true
}
```

## Examples

### Classic Polynomials (Degree ≤ 11)

| Polynomial | Degree | Galois Group | Description |
|------------|--------|--------------|-------------|
| x^2 - 2 | 2 | C_2 | Cyclic group of order 2 |
| x^3 - 2 | 3 | S_3 | Symmetric group on 3 elements |
| x^4 - 10x^2 + 1 | 4 | V_4 | Klein four-group |
| x^5 - 2 | 5 | D_5 | Dihedral group of order 10 |
| x^6 + 3x + 3 | 6 | S_6 | Symmetric group (if irreducible) |

**Note**: Polynomials of degree 12 or higher are not supported due to computational complexity.

### Input Formats
- Standard: `x^2-2`, `x^3-8`, `x^4-16`
- With spaces: `x^2 - 2`, `x^3 - 8`
- Complex: `x^4 - 10*x^2 + 1`, `x^6 + 3*x^3 - 1`

## Architecture

### Direct SageMath Integration
The application uses direct SageMath imports within the FastAPI process for maximum performance, eliminating the 5-7 second subprocess startup overhead that was present in previous versions. This results in computation times under 1 second.

### Error Handling
- **Reducible polynomials**: Clear explanation that Galois groups apply to irreducible polynomials
- **High degree polynomials**: Polynomials of degree ≥12 are rejected with an informative message
- **Syntax errors**: Helpful feedback for invalid polynomial syntax
- **Computation timeouts**: Graceful handling of complex computations

### Root Display
Roots are displayed with mathematical elegance:
- Conjugate pairs: `a ± bi` instead of listing both `a + bi` and `a - bi`
- Real pairs: `±c` instead of listing both `c` and `-c`
- Individual roots: Standard decimal or complex notation

## Development

### Project Structure
```
galois-playground/
├── backend.py                # FastAPI backend with direct SageMath import
├── start-backend.sh          # Backend startup script
├── ui/                       # React frontend
│   ├── src/
│   │   ├── GaloisPlayground.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

### API Endpoints
- `GET /` - Server information
- `GET /api/test` - Backend health check
- `POST /api/galois` - Compute Galois group
- `GET /health` - Health status

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Mathematical Background

This application explores **Galois theory**, which establishes a fundamental connection between field extensions and group theory. Key concepts:

- **Galois Group**: The group of field automorphisms of a splitting field
- **Irreducible Polynomials**: Polynomials that cannot be factored over the rational numbers
- **Field Extensions**: Larger fields containing the rational numbers Q
- **Splitting Fields**: The smallest field extension containing all roots of a polynomial

## License

This project is open source. See the repository for license details.

## Acknowledgments

- **Évariste Galois** - For the foundational mathematical theory
- **SageMath** - For providing the computational mathematics framework
- **React and FastAPI communities** - For excellent development tools
