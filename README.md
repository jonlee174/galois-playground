# Correspondence

Correspondence computes the Galois group, roots, splitting field and Galois correspondence lattice of an irreducible polynomial over $\mathbb{Q}$ of degree at most 11. The mathematics runs on SageMath behind a FastAPI backend, with a React frontend.

## Requirements

[pixi](https://pixi.sh) installs everything else (Python, SageMath and Node.js) inside the project folder. Install it with `brew install pixi`. macOS and Linux are supported, and Windows works through WSL.

## Setup

```bash
git clone https://github.com/jonlee174/galois-playground.git
cd galois-playground
pixi install
```

The first install downloads SageMath and takes a few minutes.

The interface is set in Modern No. 20, which ships with Microsoft Office and is not included in the repository. On a Mac with Office installed, copy it in with

```bash
cp "/Applications/Microsoft Word.app/Contents/Resources/DFonts/ModernNo.20.ttf" ui/public/fonts/ModernNo20.ttf
```

Without it the interface falls back to Georgia.

## Running

```bash
./start-all.sh
```

This starts the backend on port 8001 and the frontend on port 3000, which is the address to open in a browser. To run them in separate terminals instead, use `pixi run backend` and `pixi run frontend`.

## Tests

```bash
pixi run test
```

## License

Released under the MIT License, see [LICENSE](LICENSE).
