# Backend Dockerfile for DepthWizard AI
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install PyTorch CPU first for reliable caching
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir transformers accelerate timm

# Copy application source
COPY . .

# Generate demo assets on build
RUN python -m app.utils.generate_demos

# Create upload and output directories
RUN mkdir -p uploads outputs models demo_assets

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000 10000 7860

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
