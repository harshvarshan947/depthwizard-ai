# DEPTHWIZARD AI — DEPLOYMENT GUIDE
### Team PARALLAX | Smart India Hackathon

This guide covers all deployment strategies for **DEPTHWIZARD AI**, from one-command Docker containers to free cloud hosting and live hackathon judge presentation.

---

## 🚀 Deployment Strategy Overview

| Method | Best For | Complexity | Cost | GPU Support |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1: Docker Compose** | Cloud VPS / Any Server / Local Test | ⭐ Minimal (1 command) | Free / Server cost | Optional (NVIDIA Container Toolkit) |
| **Option 2: Cloud Managed (Render / Railway)** | Instant Public Link for Evaluation | ⭐⭐ Low | Free Tier Available | CPU / Paid GPU |
| **Option 3: Hugging Face Spaces + Vercel** | AI Hackathon Free Hosting | ⭐⭐ Low | **100% Free** | Free CPU / Paid T4 GPU |
| **Option 4: Linux Cloud VM (AWS / GCP / Ubuntu)** | Full Production & Custom Domain | ⭐⭐⭐ Medium | ~$10–$25/mo | Full CUDA Support |
| **Option 5: Live SIH Hackathon LAN / ngrok** | Live In-Person Jury Presentation | ⭐ Minimal | Free | Uses Laptop GPU |

---

## 🐳 Option 1: Docker Compose (Recommended)

Both `backend` and `frontend` have production Dockerfiles pre-configured in this repository.

### 1. Requirements
- Docker & Docker Compose installed ([Get Docker Desktop](https://www.docker.com/products/docker-desktop/))

### 2. Build & Launch
From the project root:

```bash
# Build and run all containers in the background
docker-compose up -d --build
```

### 3. Verify
- **Frontend Dashboard:** `http://localhost` (or `http://localhost:5173`)
- **Backend API:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`

To stop:
```bash
docker-compose down
```

---

## ☁️ Option 2: Free / Low-Cost Cloud Deployment (Render / Railway)

### Backend Deployment (Render or Railway)
1. Push your repository to **GitHub**.
2. Go to [Render.com](https://render.com) or [Railway.app](https://railway.app).
3. Create a **New Web Service**:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:**
     ```bash
     pip install --upgrade pip && pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements.txt && pip install transformers accelerate timm && python -m app.utils.generate_demos
     ```
   - **Start Command:**
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
4. Copy the assigned backend URL (e.g., `https://depthwizard-backend.onrender.com`).

### Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
1. In `frontend/src/services/api.ts`, update `BASE_URL`:
   ```typescript
   const BASE_URL = import.meta.env.VITE_API_URL || 'https://depthwizard-backend.onrender.com';
   ```
2. In `frontend/`:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add Environment Variable:
   - `VITE_API_URL` = `https://depthwizard-backend.onrender.com`
4. Deploy! Your frontend will be live on `https://depthwizard-ai.vercel.app`.

---

## 🤗 Option 3: Hugging Face Spaces (Ideal for SIH AI Projects)

Hugging Face Spaces provides free hosting with 16 GB RAM and optional GPU upgrades.

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) -> **Create new Space**.
2. Select **Docker** as the Space SDK.
3. Upload the `backend/` folder and `backend/Dockerfile`.
4. Hugging Face automatically detects PyTorch, downloads the Depth Anything V2 weights into cache, and provides an HTTPS endpoint with Swagger documentation.

---

## 🖥️ Option 4: Production Linux Cloud VM (AWS EC2 / GCP / Ubuntu 22.04 / 24.04)

### 1. Server Setup
SSH into your cloud server:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv git nginx certbot python3-certbot-nginx nodejs npm
```

### 2. Clone and Setup Backend
```bash
git clone <your-repo-url> /opt/depthwizard
cd /opt/depthwizard/backend

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install transformers accelerate timm
python -m app.utils.generate_demos
```

### 3. Create Systemd Service for Backend
Create `/etc/systemd/system/depthwizard.service`:

```ini
[Unit]
Description=DepthWizard AI FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/depthwizard/backend
ExecStart=/opt/depthwizard/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable depthwizard
sudo systemctl start depthwizard
```

### 4. Build Frontend
```bash
cd /opt/depthwizard/frontend
npm install
npm run build
sudo cp -r dist/* /var/www/depthwizard/
```

### 5. Configure Nginx
Create `/etc/nginx/sites-available/depthwizard`:

```nginx
server {
    listen 80;
    server_name your-domain.com; # Or your server's Public IP

    client_max_body_size 50M;

    location / {
        root /var/www/depthwizard;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8000/uploads/;
    }

    location /outputs/ {
        proxy_pass http://127.0.0.1:8000/outputs/;
    }

    location /demo_assets/ {
        proxy_pass http://127.0.0.1:8000/demo_assets/;
    }
}
```

Link and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/depthwizard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (HTTPS)
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 🎯 Option 5: Live SIH Hackathon Jury Presentation (Zero Setup / Instant Share)

When presenting to judges in person at the hackathon venue:

### Method A: Localhost on Laptop + External Projector
- Simply connect HDMI/DisplayPort to projector.
- Open `http://localhost:5173`.
- Press **`P`** key to enter **SIH PRESENTATION MODE**.
- The presentation mode maximizes visualizations for high-DPI projectors.

### Method B: Exposing to Judges' Mobile / Tablet via Local WiFi
Both servers are already configured with `--host 0.0.0.0` or `127.0.0.1`.
1. Find your laptop's local IP address:
   ```powershell
   ipconfig
   # Look for IPv4 Address e.g. 192.168.1.45
   ```
2. Start Vite with LAN exposure:
   ```bash
   npm run dev -- --host
   ```
3. Hand the judges your tablet or phone: open `http://192.168.1.45:5173` on the same WiFi!

### Method C: Instant Public Tunnel via ngrok or Cloudflare Tunnels
If the hackathon WiFi blocks peer-to-peer connections:
```bash
# In terminal:
npx localtunnel --port 5173
# Or using ngrok:
# ngrok http 5173
```
This generates an instant HTTPS URL (e.g., `https://depthwizard-demo.loca.lt`) that anyone in the room or judges can open on their laptops immediately.
