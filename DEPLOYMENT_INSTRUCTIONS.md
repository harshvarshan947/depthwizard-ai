# DepthWizard AI — Production Deployment Guide
**Smart India Hackathon (SIH) | Team PARALLAX**

This document provides step-by-step instructions for deploying **DepthWizard AI** to production with a separated architecture:
- **Frontend:** React + Vite + Three.js deployed on **Vercel**
- **Backend:** FastAPI + PyTorch + Depth Anything V2 deployed on **Render** (Native Python / Free tier) or **Hugging Face Spaces**

---

## 🏛️ Architecture Overview

```
                      +---------------------------------------+
                      |         User Web Browser              |
                      +-------------------+-------------------+
                                          |
                        HTTPS (HTML/JS/Three.js assets)
                                          v
                      +---------------------------------------+
                      |        Vercel (Frontend SPA)          |
                      |   Root Directory: "frontend"          |
                      |   Build: `npm run build`              |
                      |   Env: VITE_API_URL                   |
                      +-------------------+-------------------+
                                          |
                         REST API Requests & Static Assets
                          (CORS with allow_origin_regex)
                                          v
                      +---------------------------------------+
                      |        Render / Cloud Host (Backend)  |
                      |   FastAPI + PyTorch ViT-Small         |
                      |   Dynamic $PORT (10000 / 8000)        |
                      |   Automatic HuggingFace weights cache |
                      +---------------------------------------+
```

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Push Repository to GitHub](#2-step-1-push-repository-to-github)
3. [Step 2: Deploy Backend to Render.com](#3-step-2-deploy-backend-to-rendercom)
4. [Step 3: Deploy Frontend to Vercel](#4-step-3-deploy-frontend-to-vercel)
5. [Step 4: Update CORS & Test Production Endpoints](#5-step-4-update-cors--test-production-endpoints)
6. [Alternative: Hugging Face Spaces Backend](#6-alternative-hugging-face-spaces-backend)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [AI Model Weights & GPU Specs](#8-ai-model-weights--gpu-specs)
9. [How to Redeploy & Update](#9-how-to-redeploy--update)

---

## 1. Prerequisites
- A free **[GitHub account](https://github.com/)**
- A free **[Vercel account](https://vercel.com/)** (sign in with GitHub)
- A free **[Render.com account](https://render.com/)** (or Hugging Face account)

---

## 2. Step 1: Push Repository to GitHub

Open your terminal in `c:\antigravity project\happy_birthday` and link your GitHub repository:

```bash
# 1. Create a new repository on https://github.com/new (e.g. depthwizard-ai)
# 2. Add remote origin (replace YOUR_USERNAME and YOUR_REPO with your actual GitHub path)
git remote add origin https://github.com/YOUR_USERNAME/depthwizard-ai.git

# 3. Rename branch to main if not already
git branch -M main

# 4. Push code to GitHub
git push -u origin main
```

---

## 3. Step 2: Deploy Backend to Render.com

Render provides free hosting for native Python Web Services.

1. Go to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** > **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `depthwizard-ai` GitHub repository.
4. Configure the service settings:
   - **Name:** `depthwizard-api`
   - **Region:** Any (e.g., *Frankfurt (EU)* or *Oregon (US)*)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank for root, or set to `backend`)*
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && python -m backend.app.utils.generate_demos
     ```
     *(If Root Directory is set to `backend`, use: `pip install -r requirements.txt && python -m app.utils.generate_demos`)*
   - **Start Command:**
     ```bash
     python app.py
     ```
     *(Or if Root Directory is `backend`: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)*
   - **Instance Type:** `Free` (0.1 CPU, 512 MB RAM)

5. **Environment Variables** in Render:
   Click **Advanced** > **Add Environment Variable**:
   - `PYTHONUNBUFFERED` = `1`
   - `ALLOWED_ORIGINS` = `https://*.vercel.app,http://localhost:5173`

6. Click **Create Web Service**.
   - Render will build the environment, install CPU PyTorch wheels, and launch the service.
   - Once complete, copy your public backend URL (e.g., `https://depthwizard-api.onrender.com`).
   - Test it by opening: `https://depthwizard-api.onrender.com/api/health`.

---

## 4. Step 3: Deploy Frontend to Vercel

1. Log into your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **Add New...** > **Project**.
3. Import your `depthwizard-ai` repository from GitHub.
4. In the **Configure Project** screen:
   - **Project Name:** `depthwizard-ai` (or your preferred name)
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `frontend`
   - **Build Command:** `npm run build` (detected automatically)
   - **Output Directory:** `dist` (detected automatically)
5. Expand **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://depthwizard-api.onrender.com` *(use your actual backend URL from Step 2, no trailing slash)*
6. Click **Deploy**.
   - Vercel will compile the React 18 TypeScript code into optimized production bundles.
   - In ~30-45 seconds, your production dashboard will be live at `https://depthwizard-ai.vercel.app`.

---

## 5. Step 4: Update CORS & Test Production Endpoints

Once you have your final Vercel URL (e.g., `https://depthwizard-ai.vercel.app`):

1. **Verify CORS:**
   `backend/app/main.py` is pre-configured with `allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|http://localhost:\d+"`.
   This means **any Vercel preview or production domain is automatically permitted out of the box**!
   If you use a custom domain (e.g. `https://depthwizard.com`), simply add it to the `ALLOWED_ORIGINS` environment variable in Render.

2. **Verify Live Endpoints:**
   - **Health Check:** `https://your-backend.onrender.com/api/health`
   - **Demo Presets:** `https://your-backend.onrender.com/api/demos`
   - **Frontend App:** Open `https://your-frontend.vercel.app` in your browser.
   - Click any benchmark demo preset (*Metropolitan CBD*, *Open-Pit Quarry*, etc.) to verify instant AI depth estimation, height contour reconstruction, Three.js 3D viewport, and First-Person Flythrough navigation!

---

## 6. Alternative: Hugging Face Spaces Backend

If you prefer 24/7 uptime without cold starts, you can host the backend on Hugging Face Spaces:

1. Go to **[huggingface.co/new-space](https://huggingface.co/new-space)**.
2. Choose **Space SDK: Docker** (Blank template).
3. Set Space visibility to **Public**.
4. Clone the space repo or connect your GitHub repository.
5. Push the repository containing `Dockerfile` to the space.
6. The container will build and expose port `7860`.
7. Your Hugging Face API URL will be: `https://YOUR_USERNAME-YOUR_SPACE.hf.space`.
8. Point `VITE_API_URL` on Vercel to `https://YOUR_USERNAME-YOUR_SPACE.hf.space`.

---

## 7. Environment Variables Reference

### Frontend (`frontend/.env.production` or Vercel UI)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of deployed FastAPI backend | `https://depthwizard-api.onrender.com` |

### Backend (`backend/.env` or Render/Railway UI)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Web server listening port | Assigned by host (`10000` / `8000`) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `https://*.vercel.app,http://localhost:5173` |
| `USE_TORCH_MODEL` | Enable Depth Anything V2 neural inference | `True` |
| `MODEL_WEIGHTS_PATH` | Path to cached weights | `./models/depth_anything_v2_vits.pth` |
| `DEFAULT_GROUND_SAMPLING_DISTANCE_CM` | Default GSD for calibration | `15.0` |

---

## 8. AI Model Weights & GPU Specs

### Model Architecture
- **Engine:** `Depth Anything V2`
- **Backbone:** Vision Transformer ViT-Small (`vits`)
- **Weights Source:** Official Hugging Face Hub (`depth-anything/Depth-Anything-V2-Small-hf`)
- **Parameters:** 24.8M parameters (~95MB uncompressed)

### Hardware Requirements
- **CPU Inference:** ~300–450 ms per image (Runs smoothly on free-tier 512MB RAM cloud instances).
- **GPU Inference (Optional):** NVIDIA CUDA 11.8+ / 12.1+ (~35 ms per image).
- **Memory Footprint:** ~320 MB RSS memory.
- **Fail-Safe Mode:** If external network access to Hugging Face Hub is restricted or timed out, the backend automatically falls back to the high-precision algorithmic aerial gradient estimator with zero crash risk.

---

## 9. How to Redeploy & Update

Both Vercel and Render feature continuous integration via Git webhooks:

```bash
# Make any modifications, then commit and push:
git add .
git commit -m "Update feature or style"
git push origin main
```

- **Vercel:** Automatically detects commits to `frontend/` and redeploys the static site in <45s.
- **Render:** Automatically triggers a new build and rolling update with zero downtime.
