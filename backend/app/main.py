import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.routes import router

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
DEMO_DIR = os.path.join(BASE_DIR, "demo_assets")

# Dynamic frontend dist discovery for local, Docker, Hugging Face Spaces, and Render
FRONTEND_DIST = os.environ.get("FRONTEND_DIST", "")
if not FRONTEND_DIST or not os.path.exists(FRONTEND_DIST):
    candidates = [
        os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist")),
        os.path.abspath(os.path.join(BASE_DIR, "frontend", "dist")),
        "/app/frontend/dist",
        os.path.join(BASE_DIR, "dist")
    ]
    for c in candidates:
        if os.path.exists(c):
            FRONTEND_DIST = c
            break

if not FRONTEND_DIST:
    FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))

ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DEMO_DIR, exist_ok=True)

app = FastAPI(
    title="DEPTHWIZARD AI API",
    description="Single-View Height Estimation & 3D Flythrough for Geospatial Intelligence — Team PARALLAX (Smart India Hackathon)",
    version="2.4.0"
)

# CORS configuration for full cross-origin local, LAN, and cloud domain access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file mounts
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")
app.mount("/demo_assets", StaticFiles(directory=DEMO_DIR), name="demo_assets")

# Include API routes FIRST so API endpoints take priority
app.include_router(router)

# Mount frontend compiled assets (/assets/index-*.js, /assets/index-*.css)
if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# Serve SPA index.html or public static files
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str = ""):
    # If specific static file exists in dist (e.g. favicon.svg, icons.svg)
    file_path = os.path.join(FRONTEND_DIST, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Default to SPA index.html for client-side routing (/dashboard, /upload, /flythrough, etc.)
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
        
    return {"status": "online", "message": "DEPTHWIZARD AI Core API ready. Frontend building."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
