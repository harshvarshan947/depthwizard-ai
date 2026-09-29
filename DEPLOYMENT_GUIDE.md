# DEPTHWIZARD AI — Universal Cloud Deployment Guide
### Team PARALLAX // Smart India Hackathon (SIH)

This guide provides simple, step-by-step instructions to deploy **DepthWizard AI** to the cloud so that anyone across the globe can access and interact with the application 24/7 from their browser, phone, or tablet.

---

## 🌟 Comparison of Deployment Options

| Deployment Method | 24/7 Uptime (Laptop Off) | Free Tier | Setup Time | Best For |
|---|---|---|---|---|
| **1. Hugging Face Spaces (Docker)** | ✅ Yes (100% Cloud) | **Free Forever** (16 GB RAM) | ~3 minutes | **Recommended**: Ideal for PyTorch AI + WebGL |
| **2. Render.com (Docker Web Service)** | ✅ Yes (100% Cloud) | Free Tier (512 MB) | ~4 minutes | Quick GitHub 1-click deployment |
| **3. Cloudflare Quick Tunnel** | ⚠️ Only when laptop is ON | **Free Forever** | **Instant (0 min)** | Hackathon live demos & jury pitches |

---

## 🚀 METHOD 1: Hugging Face Spaces (Recommended — 100% Free 24/7)

Hugging Face Spaces is the premier free cloud hosting platform for AI applications. It gives you **16 GB RAM and 2 vCPUs completely free** with no credit card required.

### Step 1: Create a Hugging Face Account & New Space
1. Go to [https://huggingface.co](https://huggingface.co) and sign up (or log in).
2. Click on your profile icon in the top right and select **New Space** (or go to [https://huggingface.co/new-space](https://huggingface.co/new-space)).
3. Configure your Space:
   - **Space name:** `depthwizard-ai`
   - **License:** `mit`
   - **Space SDK:** Choose **Docker**
   - **Docker template:** Choose **Blank**
   - **Space hardware:** **Free CPU basic (2 vCPU · 16 GB RAM)**
   - **Visibility:** **Public**
4. Click **Create Space**.

### Step 2: Push the Code to Hugging Face
Open Windows PowerShell inside your project folder (`c:\antigravity project\happy_birthday`) and run:

```powershell
# 1. Initialize git
git init
git add .
git commit -m "feat: deploy DepthWizard AI full-stack application"

# 2. Add your Hugging Face Space repository as remote (replace YOUR_USERNAME with your actual Hugging Face username)
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/depthwizard-ai

# 3. Push to Hugging Face
git push -u hf main --force
```

*(When prompted for a password, enter your Hugging Face Access Token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)).*

### Step 3: Done!
- Hugging Face will read the root [`Dockerfile`](file:///c:/antigravity%20project/happy_birthday/Dockerfile), compile the React frontend, install PyTorch CPU, load Depth Anything V2, and start the app on port 7860.
- Your permanent live public link will be:
  ```
  https://YOUR_USERNAME-depthwizard-ai.hf.space
  ```
- Anyone in the world can now use DepthWizard AI 24 hours a day, 7 days a week!

---

## 🌐 METHOD 2: Render.com (1-Click GitHub Deploy)

Render allows you to deploy directly from a GitHub repository.

### Step 1: Push Project to GitHub
1. Create a new repository on [https://github.com/new](https://github.com/new) named `depthwizard-ai`.
2. In PowerShell, push your code:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit for DepthWizard AI"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/depthwizard-ai.git
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Log in to [https://render.com](https://render.com).
2. Click **New +** $\to$ **Web Service**.
3. Connect your `depthwizard-ai` GitHub repository.
4. Render will automatically detect the root [`render.yaml`](file:///c:/antigravity%20project/happy_birthday/render.yaml) and [`Dockerfile`](file:///c:/antigravity%20project/happy_birthday/Dockerfile).
5. Click **Create Web Service**.
6. Render builds the container and provides a permanent URL:
   ```
   https://depthwizard-ai.onrender.com
   ```

---

## ⚡ METHOD 3: Cloudflare Live Tunnel (Instant & Active Right Now)

If you need a public URL immediately for demonstration while your laptop is running:

1. Double-click [`start_public_live.bat`](file:///c:/antigravity%20project/happy_birthday/start_public_live.bat) in the project folder.
2. It launches both the production server and Cloudflare tunnel.
3. Your current active public link is:
   ```
   https://flowers-besides-downloading-seed.trycloudflare.com
   ```
4. Share this link with anyone — it connects directly to your laptop over secure HTTPS with full Depth Anything V2 neural inference enabled!
