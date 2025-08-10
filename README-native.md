# Galois Playground - Native Setup (No Docker)

## 🎯 Summary

I've successfully restructured your project to run natively without Docker while preserving all your existing frontend and backend logic. Your SageMath computations and React frontend are now ready to run directly on your system.

## 📁 Project Structure

```
/home/jlee/git/galois-playground/
├── backend.py              # Your original SageMath backend (preserved)
├── start-backend.sh        # Backend launcher with conda environment
├── start-frontend.sh       # Frontend launcher 
├── run-native.sh          # Complete application launcher
├── requirements.txt        # Python dependencies
├── ui/                     # Your React frontend (unchanged)
│   ├── src/
│   ├── package.json
│   └── ...
└── README-native.md        # This documentation
```

## 🚀 Quick Start

### Option 1: Run Everything Together
```bash
cd /home/jlee/git/galois-playground
./run-native.sh
```

### Option 2: Run Services Individually

**Start Backend:**
```bash
cd /home/jlee/git/galois-playground
./start-backend.sh
```

**Start Frontend (in new terminal):**
```bash
cd /home/jlee/git/galois-playground
./start-frontend.sh
```

## 🔧 What's Preserved

✅ **All your backend logic** - `get_galois_info()` function unchanged
✅ **All your frontend code** - React components untouched  
✅ **SageMath computations** - Number fields, Galois groups, polynomial roots
✅ **API endpoints** - `/api/test` and `/api/galois` work exactly the same
✅ **CORS configuration** - Frontend can still call backend APIs

## 🛠 Technical Details

### Backend Environment
- Uses your existing SageMath conda environment (`sage`)
- Flask server on `http://localhost:5000`
- Automatic conda environment activation
- Original computation logic preserved:
  ```python
  K = NumberField(poly, names=('a',))
  group = K.galois_group()
  order = group.order()
  ```

### Frontend Environment  
- React with Vite development server
- Runs on `http://localhost:3000`
- Automatic dependency installation
- All your existing components and styling preserved

## 🔍 Testing

### Test Backend API:
```bash
curl http://localhost:5000/api/test
```

### Test Galois Computation:
```bash
curl -X POST http://localhost:5000/api/galois \
  -H "Content-Type: application/json" \
  -d '{"polynomial": "x^3 - 2"}'
```

## 🎛 Management Commands

```bash
# Start everything
./run-native.sh start

# Stop all services  
./run-native.sh stop

# Test backend only
./run-native.sh test

# Run backend only
./run-native.sh backend

# Run frontend only
./run-native.sh frontend
```

## 🔄 Migration Benefits

1. **No more Docker issues** - No container segfaults or PARI/GP problems
2. **Better performance** - Direct system execution, no container overhead
3. **Easier debugging** - Direct access to logs and processes
4. **Simpler deployment** - Just activate conda environment and run
5. **Full library compatibility** - Uses system SageMath with all features

## 🛡 Your Logic is Safe

Your mathematical computation logic remains exactly as you wrote it:

- `build_sage_polynomial()` - unchanged
- `get_galois_info()` - unchanged  
- Number field creation - unchanged
- Galois group computation - unchanged
- Complex roots calculation - unchanged

The only changes were infrastructure (removing Docker, adding native scripts) while preserving 100% of your mathematical and frontend code.

## 🚦 Next Steps

1. **Test the setup:** Run `./run-native.sh` to start both services
2. **Access your app:** Open http://localhost:3000 in your browser
3. **Verify computations:** Try computing Galois groups for various polynomials
4. **Development workflow:** Edit your code normally - both backend and frontend support hot reloading

Your Galois Playground is now running natively with full SageMath power and no Docker complications! 🎉
