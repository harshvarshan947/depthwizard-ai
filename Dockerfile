# Multi-Stage Dockerfile for DepthWizard AI (Universal Cloud Deployment)
# Compatible with Hugging Face Spaces (Free 24/7), Render, Railway, Fly.io, and Docker Compose

# -------------------------------------------------------------
# STAGE 1: Compile React Frontend SPA
# -------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent || npm install
COPY frontend/ ./
RUN npm run build

# -------------------------------------------------------------
# STAGE 2: Python FastAPI + PyTorch AI Inference Backend
# -------------------------------------------------------------
FROM python:3.11-slim
WORKDIR /app

# System dependencies for OpenCV, Pillow, and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU wheel first for optimized image size & build caching
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ /app/

# Copy compiled frontend from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Pre-generate demo assets and create persistent storage directories
RUN python -m app.utils.generate_demos && \
    mkdir -p uploads outputs demo_assets

# Environment configuration
ENV PORT=7860
ENV FRONTEND_DIST=/app/frontend/dist
ENV PYTHONUNBUFFERED=1

# Expose standard cloud container ports (7860 for Hugging Face Spaces, 8000 for local, 10000 for Render)
EXPOSE 7860 8000 10000

# Start unified production server
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
