---
title: DepthWizard AI
emoji: 🛰️
colorFrom: blue
colorTo: cyan
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: Single-View Height Estimation & 3D Flythrough for Geospatial Intelligence
---

# DEPTHWIZARD AI
### Single-View Height Estimation & 3D Flythrough
**Team:** PARALLAX  
**Problem Statement:** Smart India Hackathon (SIH) — *DepthWizard: Single-View Height Estimation and 3D Flythrough*

---

## 🛰️ 1. Project Overview

**DEPTHWIZARD AI** is an advanced, production-grade geospatial artificial intelligence system engineered to transform **a single satellite or aerial electro-optical (EO) image** into:

1. **AI Monocular Relative Depth Field** (Depth Anything V2 foundation model)
2. **Normalized Depth Raster** (Affine-invariant gradient & shadow extrusion processing)
3. **Calibrated Height Elevation Model** (Photogrammetric Ground Sampling Distance & vertical datum calibration)
4. **Interactive 3D Terrain & Building Mesh** (Hardware-accelerated WebGL / Three.js vertex displacement)
5. **Morphological Structure Inventory** (Building footprint segmentation, 3D centroids, elevation tiers)
6. **First-Person 6-DOF Flythrough Navigation** (Simulated drone flight controls)
7. **Comprehensive Export Suite & SIH Audit Reports** (OBJ, PLY point clouds, PNG heatmaps, JSON metadata, Markdown reports)

---

## 🏛️ 2. Architectural Blueprint

```
INPUT AERIAL IMAGE (JPG, PNG, WEBP, TIFF)
       ↓
[STEP 01] Multi-band Radiance Preprocessing & Normalization
       ↓
[STEP 02] AI Monocular Depth Estimation (Depth Anything V2)
       ↓
[STEP 03] Depth Field Inversion & Gradient Calibration
       ↓
[STEP 04] Photogrammetric Height Reconstruction (GSD & Altitude Calibration)
       ↓
[STEP 05] Morphological Structure Clustering & Elevation Tiering
       ↓
[STEP 06] 3D Height-Field Surface Generation & Point Cloud Synthesis
       ↓
[STEP 07] WebGL 2.0 Dynamic Rendering & 6-DOF First-Person Flythrough
```

---

## ⚖️ 3. Scientific Honesty & Limitations Disclosure

> **CRITICAL SCIENTIFIC PRINCIPLE**  
> Monocular depth models (such as Depth Anything V2) compute **RELATIVE DEPTH**, not absolute metric altitude. A neural network observing a single 2D projection cannot know whether an object is a 3-meter model or a 300-meter skyscraper without scene calibration.

DEPTHWIZARD AI enforces scientific integrity:
- **Uncalibrated Mode:** Displays heights in `rel-units` (0–100 relative elevation scale) with prominent disclosures: *"Relative height estimate: Absolute height requires scene calibration or elevation reference data."*
- **Calibrated Mode:** Enables users to input **Sensor Altitude ($A_{sensor}$)**, **Ground Sampling Distance (GSD in cm/px)**, or a **Known Landmark Anchor Height ($H_{ref}$)** to calculate real metric meters ($m$) according to rigorous photogrammetric equations:
  $$H = \frac{H_{ref}}{\Delta d_{ref}} \cdot \Delta d_{obj} \quad \text{or} \quad H \approx A_{sensor} \cdot \left(\frac{\Delta d}{1 + \Delta d}\right)$$

---

## ⚡ 4. Rapid Setup & Execution

### Prerequisites
- **Node.js** >= 18.x (v24+ supported) & **npm** >= 9.x
- **Python** >= 3.10 (Python 3.11–3.14 supported)

---

### Step A: Backend Setup

```bash
cd backend

# 1. Create and activate a virtual environment
# Windows:
python -m venv venv
venv\Scripts\activate

# Linux / macOS:
# python3 -m venv venv
# source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Generate initial offline demo assets (automated during startup or via script)
python -m app.utils.generate_demos

# 4. Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now active at: `http://127.0.0.1:8000` (Interactive Docs: `http://127.0.0.1:8000/docs`).

---

### Step B: Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Launch Vite development server
npm run dev
```
The web dashboard is now accessible at: `http://localhost:5173`.

---

## 🧠 5. AI Model Setup (Depth Anything V2)

DEPTHWIZARD AI provides dual-engine inference:
1. **Live Neural Inference:** When PyTorch and model weights are installed.
2. **Scientific High-Precision Aerial Estimator:** An algorithmic structural gradient and shadow extrusion engine that runs 100% offline out-of-the-box on any CPU without external downloads.

### Downloading Depth Anything V2 Weights:
To run the full PyTorch Depth Anything V2 neural network:
1. Download the ViT-Small or ViT-Base checkpoint from Hugging Face:
   - [Depth-Anything-V2-Small](https://huggingface.co/depth-anything/Depth-Anything-V2-Small/tree/main)
   - Filename: `depth_anything_v2_vits.pth`
2. Place the downloaded `.pth` file into:
   ```
   backend/models/depth_anything_v2_vits.pth
   ```
3. Install PyTorch and Transformers in the backend virtualenv:
   ```bash
   pip install torch torchvision transformers
   ```
4. Restart the backend server. The AI Engine status badge will automatically update to `PyTorch / Depth Anything V2`.

---

## 🎮 6. Interactive Flythrough Controls

Click **[ENTER FLYTHROUGH]** on any 3D viewport or navigate to `/flythrough`:

| Key / Input | Action |
| :--- | :--- |
| **W** | Move Forward |
| **S** | Move Backward |
| **A** | Strafe Left |
| **D** | Strafe Right |
| **Space** | Ascend / Gain Altitude |
| **Ctrl / C** | Descend / Lower Altitude |
| **Shift** | Sprint / High-Speed Cruise Boost |
| **Mouse Drag** | 360° Look Around & Pitch Control |
| **0.5x / 1x / 2x / 5x** | Adjust Cruise Speed Multiplier |

---

## 📐 7. 3D Geospatial Measurement Tool

1. Click **[Measure]** on the 3D viewport toolbar.
2. Click **Point A** on any structure or terrain surface (blue marker appears).
3. Click **Point B** on a second structure or ground baseline (green marker appears).
4. The system calculates:
   - **Euclidean 3D Distance** ($\Delta X, \Delta Y, \Delta Z$)
   - **Vertical Relief Difference** ($\Delta Z$ height step)
   - Formatted in metric meters if calibrated, or relative units if uncalibrated.

---

## 🏆 8. SIH Presentation Mode

Press the **[SIH PRESENTATION MODE]** button in the sidebar or hit the **P** hotkey on your keyboard:
- Hides administrative UI chrome and maximizes projector visualizations.
- Sequentially guides evaluators through 5 pipeline stages:
  - **Key 1:** Source Aerial Satellite Image
  - **Key 2:** AI Depth Map (Depth Anything V2)
  - **Key 3:** Hypsometric Elevation Heatmap
  - **Key 4:** 3D Reconstructed Mesh
  - **Key 5:** Real-time 6-DOF Drone Flythrough

---

## 📁 9. Project Structure

```
depthwizard-ai/
├── README.md                  # This file
├── .env.example               # Environment variable template
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point & CORS configuration
│   │   ├── api/
│   │   │   └── routes.py      # REST endpoints (depth, height, objects, reconstruct, export)
│   │   ├── models/
│   │   │   └── schemas.py     # Pydantic request/response data contracts
│   │   ├── services/
│   │   │   ├── depth_service.py
│   │   │   ├── height_service.py
│   │   │   ├── object_service.py
│   │   │   ├── reconstruction_service.py
│   │   │   └── report_service.py
│   │   ├── inference/
│   │   │   ├── depth_anything.py       # Depth Anything V2 wrapper
│   │   │   └── algorithmic_depth.py    # Spatial gradient & shadow estimator
│   │   └── utils/
│   │       ├── colormaps.py            # Turbo, Viridis, Inferno elevation ramps
│   │       └── generate_demos.py       # Offline sample aerial generators
│   ├── demo_assets/           # 3 built-in aerial datasets
│   ├── uploads/               # User ingested images
│   ├── outputs/               # Computed depth, OBJ meshes, PLY point clouds
│   ├── models/                # Local neural weights (.pth)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.tsx            # Shell routing & layout
    │   ├── context/
    │   │   └── AppContext.tsx # Centralized reactive state
    │   ├── services/
    │   │   └── api.ts         # Backend API client
    │   ├── types/
    │   │   └── index.ts       # TypeScript type definitions
    │   ├── pages/
    │   │   ├── LandingPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── UploadPage.tsx
    │   │   ├── DepthPage.tsx
    │   │   ├── HeightPage.tsx
    │   │   ├── ReconstructionPage.tsx
    │   │   ├── FlythroughPage.tsx
    │   │   ├── ObjectPage.tsx
    │   │   ├── ExportPage.tsx
    │   │   └── SettingsPage.tsx
    │   └── components/
    │       ├── 3d/
    │       │   ├── ThreeDViewport.tsx
    │       │   ├── TerrainMesh.tsx
    │       │   ├── FlythroughController.tsx
    │       │   └── MeasurementOverlay.tsx
    │       ├── layout/
    │       │   ├── Sidebar.tsx
    │       │   └── Topbar.tsx
    │       ├── pipeline/
    │       │   └── ProcessingPipeline.tsx
    │       ├── presentation/
    │       │   └── PresentationMode.tsx
    │       └── common/
    │           ├── CalibrationPanel.tsx
    │           └── HeightLegend.tsx
    ├── tailwind.config.js
    ├── vite.config.ts
    └── package.json
```

---

## 🛠️ 10. Troubleshooting & FAQ

### WebGL Hardware Acceleration
If the 3D viewport reports performance throttling:
- Ensure Hardware Acceleration is enabled in your browser: `chrome://settings/system` -> *Use graphics acceleration when available*.
- DepthWizard uses standard Three.js WebGL 2.0 with fallback buffers.

### CORS or Port Issues
- The Vite development server is pre-configured with reverse-proxy routes in `vite.config.ts` mapping `/api`, `/outputs`, `/uploads`, and `/demo_assets` directly to `http://127.0.0.1:8000`.

---

## 🚀 11. Future Roadmap
1. Multi-view bundle adjustment fusion (when multiple passes are available).
2. Direct OpenStreetMap / Mapbox satellite vector extrusion overlay.
3. GeoTIFF DSM/DTM real-time raster differential subtraction.
4. OpenUSD export for NVIDIA Omniverse spatial digital twins.

---
*Developed with pride by Team PARALLAX for Smart India Hackathon.*
