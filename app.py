import os
import sys
import types

# Absolute directory paths
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
APP_DIR = os.path.join(BACKEND_DIR, "app")

# Ensure backend/app is cleanly recognized as the 'app' package in Python
if 'app' not in sys.modules or not hasattr(sys.modules['app'], '__path__'):
    pkg = types.ModuleType('app')
    pkg.__path__ = [APP_DIR]
    pkg.__file__ = os.path.join(APP_DIR, '__init__.py')
    sys.modules['app'] = pkg

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Import the primary FastAPI application instance
from app.main import app

if __name__ == "__main__":
    import uvicorn
    # Render assigns dynamic port via $PORT (defaults to 10000 on Render, 8000 locally)
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting DepthWizard AI production server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
