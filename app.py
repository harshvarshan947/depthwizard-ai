import os
import sys

# Ensure backend folder is in Python import path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app as fastapi_app

# If running on Hugging Face Spaces (Gradio Free SDK), mount Gradio cleanly
try:
    import gradio as gr
    with gr.Blocks(title="DepthWizard AI") as demo:
        gr.Markdown("# DepthWizard AI — 3D Geospatial Reconstruction Engine")
    app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")
except Exception:
    app = fastapi_app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
