import os
import sys
import types

# Absolute paths
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
APP_DIR = os.path.join(BACKEND_DIR, "app")

# Ensure backend/app is cleanly recognized as the 'app' package
if 'app' not in sys.modules or not hasattr(sys.modules['app'], '__path__'):
    pkg = types.ModuleType('app')
    pkg.__path__ = [APP_DIR]
    pkg.__file__ = os.path.join(APP_DIR, '__init__.py')
    sys.modules['app'] = pkg

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Import the main FastAPI application
from app.main import app as fastapi_app
from fastapi.responses import FileResponse

# Embedded WebGL endpoint for Gradio / iframes
FRONTEND_DIST = os.environ.get("FRONTEND_DIST", "")
if not FRONTEND_DIST or not os.path.exists(FRONTEND_DIST):
    for candidate in [
        os.path.join(ROOT_DIR, "frontend", "dist"),
        os.path.join(BACKEND_DIR, "..", "frontend", "dist"),
        "/app/frontend/dist"
    ]:
        if os.path.exists(candidate):
            FRONTEND_DIST = candidate
            break

@fastapi_app.get("/app-view")
async def serve_embedded_ui():
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"status": "online", "message": "DepthWizard AI UI ready."}

# If running on Hugging Face Spaces (Gradio Free SDK)
try:
    import gradio as gr

    custom_css = """
    footer { display: none !important; }
    .gradio-container { padding: 0 !important; margin: 0 !important; max-width: 100% !important; height: 100vh !important; }
    body, html { margin: 0; padding: 0; overflow: hidden; width: 100%; height: 100%; background: #030712; }
    """

    with gr.Blocks(
        title="DepthWizard AI — Single-View Height Estimation & 3D Flythrough",
        css=custom_css,
        fill_width=True
    ) as demo:
        gr.HTML("""
            <iframe 
                src="/app-view" 
                style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; border: none; margin: 0; padding: 0; z-index: 9999;"
                allow="fullscreen; accelerometer; gyroscope"
            ></iframe>
        """)

    app = gr.mount_gradio_app(fastapi_app, demo, path="/")
except Exception:
    app = fastapi_app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
