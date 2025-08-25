# Galois Theory Playground

A modern web application for exploring Galois theory and field extensions. Input polynomials with rational coefficients and discover their Galois groups, splitting fields, roots, and mathematical properties through an intuitive interface powered by SageMath.

## Features

- **Interactive Polynomial Input**: Enter polynomials with real-time LaTeX preview
- **Galois Group Computation**: Calculate Galois groups for irreducible polynomials over ℚ
- **Splitting Field Analysis**: Compute splitting fields with defining polynomials (optional)
- **Root Visualization**: Display polynomial roots with elegant ± notation for conjugate pairs
- **Mathematical Notation**: Beautiful LaTeX rendering with MathJax
- **Error Handling**: Clear feedback for reducible polynomials and computation errors
- **Fast Computation**: Direct SageMath integration for rapid results

## Supported Polynomials

The application supports polynomials with rational coefficients up to **degree 11**:

- **Simple forms**: x^n ± c (e.g., x^3-2, x^4+5)
- **Quadratic-like**: x^4 + ax^2 + b (e.g., x^4-10x^2+1)
- **General polynomials**: a_n*x^n + ... + a_1*x + a_0 with rational coefficients

**Important restrictions:**
- Polynomials must be **irreducible over ℚ** for Galois group computation
- **Maximum degree is 11** - higher degree polynomials are computationally prohibitive
- Splitting field computation is optional and may be time-intensive for higher degrees
- The application will detect and notify you if a polynomial is reducible or too high degree

## Technology Stack

### Backend
- **Python 3.12+** with SageMath
- **FastAPI** for REST API endpoints
- **Direct SageMath import** for maximum performance (no subprocess overhead)
- **Uvicorn** ASGI server
- **Asynchronous computation** for splitting fields

### Frontend
- **React 18** with modern hooks
- **Vite** for development and building
- **Tailwind CSS** for responsive styling
- **MathJax** for LaTeX rendering
- **Polling mechanism** for long-running computations

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
- Backend on http://localhost:8001
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

### Using the Application

1. Enter a polynomial in the input field (e.g., `x^4-10*x^2+1`)
2. Optionally select "Compute splitting field" for detailed field information
3. Click "Compute Galois Group"
4. View results including:
   - Galois group with mathematical notation
   - Polynomial roots displayed with elegant ± notation
   - Splitting field information (if requested)
   - Group details and order

### API Usage

The backend provides a REST API at `http://localhost:8001`:

#### Compute Galois Group

```bash
curl -X POST "http://localhost:8001/api/galois" \
     -H "Content-Type: application/json" \
     -d '{"polynomial": "x^4-10*x^2+1", "compute_splitting_field": false}'
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

#### Compute Splitting Field Separately

```bash
curl -X POST "http://localhost:8001/api/splitting-field" \
     -H "Content-Type: application/json" \
     -d '{"polynomial": "x^4-10*x^2+1"}'
```

**Response example:**
```json
{
  "polynomial": "x^4 - 10*x^2 + 1",
  "splitting_field": {
    "field": "Number Field in b with defining polynomial x^4 - 10*x^2 + 1",
    "degree": 4,
    "defining_polynomial": "x^4 - 10*x^2 + 1",
    "description": "The splitting field of x^4 - 10*x^2 + 1 over ℚ",
    "computed": true
  },
  "computation_successful": true,
  "computation_time_seconds": 0.0234
}
```

## Examples

### Classic Polynomials (Degree ≤ 11)

| Polynomial | Degree | Galois Group | Description |
|------------|--------|--------------|-------------|
| x^2 - 2 | 2 | C_2 | Cyclic group of order 2 |
| x^3 - 2 | 3 | S_3 | Symmetric group on 3 elements |
| x^4 - 10x^2 + 1 | 4 | V_4 | Klein four-group |
| x^5 - 2 | 5 | F_5 | Frobenius group of order 20 |
| x^5 - x - 1 | 5 | S_5 | Symmetric group on 5 elements |
| x^6 - 3x^3 + 1 | 6 | D_6 | Dihedral group of order 12 |
| x^8 - 2 | 8 | (C_2×C_2×C_2)⋊C_7 | Affine group |
| x^11 - 1 | 11 | C_10 | Cyclic group of order 10 |

**Note**: Polynomials of degree 12 or higher are not supported due to computational complexity.

### Input Formats
- Standard: `x^2-2`, `x^3-8`, `x^4-16`
- With spaces: `x^2 - 2`, `x^3 - 8`
- With coefficients: `3x^2+2x+1` (multiplication signs are optional)
- Complex: `x^4 - 10*x^2 + 1`, `x^6 + 3*x^3 - 1`

### Displaying Roots
The application uses elegant mathematical notation for roots:
- Conjugate pairs shown as `a ± bi` instead of separate entries
- Real pairs shown as `±c` instead of separate entries
- Individual roots in decimal format with 6 decimal places

## Architecture

### Direct SageMath Integration
The application uses direct SageMath imports within the FastAPI process for maximum performance, eliminating the subprocess startup overhead that would otherwise be present. This results in much faster computation times.

### Asynchronous Splitting Field Computation
- **Two-phase computation**: Galois group is computed and returned quickly, with splitting field computed separately
- **Optional computation**: Users can choose whether to compute the potentially time-intensive splitting field
- **Polling mechanism**: Frontend polls the backend for splitting field results when requested

### Error Handling
- **Reducible polynomials**: Clear explanation that Galois groups apply to irreducible polynomials
- **High degree polynomials**: Polynomials of degree ≥12 are rejected with an informative message
- **Syntax errors**: Helpful feedback for invalid polynomial syntax
- **Computation timeouts**: Graceful handling of complex computations

### User Interface Features
- **LaTeX Preview**: Real-time preview of polynomial inputs with LaTeX formatting
- **Dynamic sizing**: Automatic sizing adjustment for complex mathematical expressions
- **Responsive design**: Works well on different screen sizes
- **Loading states**: Clear indication when computations are in progress

## Development

### Project Structure
```
galois-playground/
├── backend.py                # FastAPI backend with direct SageMath import
├── chm_label_to_tex.py       # LaTeX notation for Galois groups
├── start-backend.sh          # Backend startup script
├── ui/                       # React frontend
│   ├── src/
│   │   ├── GaloisPlayground.jsx # Main React component
│   │   ├── main.jsx          # Entry point
│   │   ├── index.css         # Styles
│   │   └── assets/           # Images and assets
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── postcss.config.js     # PostCSS configuration
│   └── tailwind.config.js    # Tailwind CSS configuration
└── README.md
```

### API Endpoints
- `GET /` - Server information and capabilities
- `GET /api/test` - Backend health check and SageMath verification
- `POST /api/galois` - Compute Galois group information
- `POST /api/splitting-field` - Compute splitting field information
- `GET /health` - Service health status

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Mathematical Background

This application explores **Galois theory**, which establishes a fundamental connection between field extensions and group theory. Key concepts:

- **Galois Group**: The group of field automorphisms of a splitting field that preserve the base field
- **Irreducible Polynomials**: Polynomials that cannot be factored over the rational numbers ℚ
- **Field Extensions**: Larger fields containing the rational numbers ℚ
- **Splitting Fields**: The smallest field extension containing all roots of a polynomial
- **Automorphisms**: Structure-preserving bijections from a field to itself

The Galois group reveals deep properties about the polynomial and its roots, including:
- Whether the polynomial can be solved by radicals
- The structure of the field extension created by adjoining the roots
- Symmetries among the roots of the polynomial

## Performance Considerations

- **Galois Group Computation**: Typically fast for polynomials up to degree 11
- **Splitting Field Computation**: Can be more time-consuming, especially for higher degrees
- **Memory Usage**: Direct SageMath import uses more memory than subprocess calls
- **Polynomial Degree**: Computation time grows exponentially with degree
- **User Experience**: Asynchronous design ensures responsive interface even for complex computations

## License

This project is open source. See the repository for license details.

## Acknowledgments

- **Évariste Galois** (1811-1832) - For the foundational mathematical theory
- **SageMath** - For providing the computational mathematics framework
- **React and FastAPI communities** - For excellent development tools
- **MathJax** - For beautiful mathematical typesetting
