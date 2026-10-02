import { SystemHealth, DemoPreset, PipelineResult, DepthResponse, HeightResponse, ObjectAnalysisResponse, MeshReconstructResponse } from '../types';

export const cleanApiUrl = (url: string): string => {
  let clean = url.trim();
  if (!clean) return '';
  clean = clean.replace(/\/+$/, '');
  clean = clean.replace(/\/api\/health$/, '');
  clean = clean.replace(/\/health$/, '');
  clean = clean.replace(/\/api$/, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    if (clean.startsWith('localhost') || clean.startsWith('127.0.0.1')) {
      clean = `http://${clean}`;
    } else {
      clean = `https://${clean}`;
    }
  }
  return clean;
};

export const getStoredApiUrl = (): string => {
  try {
    const saved = localStorage.getItem('depthwizard_api_url');
    if (saved && saved.trim()) return cleanApiUrl(saved);
  } catch (e) {}
  return cleanApiUrl(import.meta.env.VITE_API_URL || '');
};

export const setStoredApiUrl = (url: string) => {
  try {
    const clean = cleanApiUrl(url);
    if (clean) {
      localStorage.setItem('depthwizard_api_url', clean);
    } else {
      localStorage.removeItem('depthwizard_api_url');
    }
  } catch (e) {}
};

export const getApiBaseUrl = (): string => getStoredApiUrl();

// Legacy export for backwards compatibility
export const BASE_URL = getStoredApiUrl();

export const resolveApiUrl = (path?: string | null): string => {
  if (!path) return '';
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('data:') || 
    path.startsWith('blob:')
  ) {
    return path;
  }
  // If path is a demo asset, resolve from frontend's own public static files
  if (path.startsWith('/demo_assets/') || path.startsWith('demo_assets/')) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs: number = 60000): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s. The backend may be cold-starting on Render's free tier (takes ~50s). Please try again shortly.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const baseUrl = getApiBaseUrl();
    const targetUrl = baseUrl ? `${baseUrl}/api/health` : '/api/health';
    const res = await fetchWithTimeout(targetUrl, {}, 45000);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  },

  async getDemos(): Promise<{ demos: DemoPreset[] }> {
    const baseUrl = getApiBaseUrl();
    const targetUrl = baseUrl ? `${baseUrl}/api/demos` : '/api/demos';
    const res = await fetchWithTimeout(targetUrl, {}, 15000);
    if (!res.ok) throw new Error('Failed to fetch demo catalog.');
    return res.json();
  },

  async uploadImage(file: File): Promise<{
    image_id: string;
    filename: string;
    image_url: string;
    resolution: [number, number];
    file_size_kb: number;
    format: string;
    status: string;
  }> {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      // Alert user if API URL is missing on remote host
      console.warn('[DepthWizard] No backend API URL configured.');
    }
    const formData = new FormData();
    formData.append('file', file);
    const targetUrl = baseUrl ? `${baseUrl}/api/upload` : '/api/upload';
    const res = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      body: formData,
    }, 60000);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async runPipeline(params: {
    image_id: string;
    contrast?: number;
    scale?: number;
    invert?: boolean;
    colormap?: string;
    use_ai?: boolean;
    is_calibrated?: boolean;
    camera_altitude_m?: number;
    ground_sampling_distance_cm?: number;
    reference_height_m?: number;
    exaggeration?: number;
  }): Promise<PipelineResult> {
    const formData = new FormData();
    formData.append('image_id', params.image_id);
    formData.append('contrast', String(params.contrast ?? 1.0));
    formData.append('scale', String(params.scale ?? 1.0));
    formData.append('invert', String(params.invert ?? false));
    formData.append('colormap', params.colormap ?? 'turbo');
    formData.append('use_ai', String(params.use_ai ?? true));
    formData.append('is_calibrated', String(params.is_calibrated ?? false));
    formData.append('camera_altitude_m', String(params.camera_altitude_m ?? 500.0));
    formData.append('ground_sampling_distance_cm', String(params.ground_sampling_distance_cm ?? 15.0));
    if (params.reference_height_m !== undefined && params.reference_height_m !== null) {
      formData.append('reference_height_m', String(params.reference_height_m));
    }
    formData.append('exaggeration', String(params.exaggeration ?? 1.0));

    const baseUrl = getApiBaseUrl();
    const targetUrl = baseUrl ? `${baseUrl}/api/process` : '/api/process';
    const res = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      body: formData,
    }, 90000);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Pipeline execution failed' }));
      throw new Error(err.detail || 'Pipeline execution failed');
    }
    return res.json();
  },

  async estimateDepth(payload: {
    image_id: string;
    contrast: number;
    scale: number;
    invert: boolean;
    colormap: string;
    use_ai_model: boolean;
  }): Promise<DepthResponse> {
    const baseUrl = getApiBaseUrl();
    const targetUrl = baseUrl ? `${baseUrl}/api/depth` : '/api/depth';
    const res = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 60000);
    if (!res.ok) throw new Error('Depth estimation failed');
    return res.json();
  },

  async calculateHeight(payload: {
    image_id: string;
    calibration?: any;
    exaggeration: number;
    colormap: string;
  }): Promise<HeightResponse> {
    const baseUrl = getApiBaseUrl();
    const targetUrl = baseUrl ? `${baseUrl}/api/height` : '/api/height';
    const res = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 60000);
    if (!res.ok) throw new Error('Height calculation failed');
    return res.json();
  },

  async detectObjects(image_id: string): Promise<ObjectAnalysisResponse> {
    const baseUrl = getApiBaseUrl();
    const targetUrl = baseUrl ? `${baseUrl}/api/objects` : '/api/objects';
    const res = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_id })
    }, 30000);
    if (!res.ok) throw new Error('Object detection failed');
    return res.json();
  },

  async reconstructMesh(payload: {
    image_id: string;
    resolution_downsample: number;
    height_exaggeration: number;
  }): Promise<MeshReconstructResponse> {
    const baseUrl = getApiBaseUrl();
    const targetUrl = baseUrl ? `${baseUrl}/api/reconstruct` : '/api/reconstruct';
    const res = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 60000);
    if (!res.ok) throw new Error('Mesh reconstruction failed');
    return res.json();
  },

  getExportUrl(image_id: string, format: string): string {
    const baseUrl = getApiBaseUrl();
    return baseUrl ? `${baseUrl}/api/export/${image_id}/${format}` : `/api/export/${image_id}/${format}`;
  },

  getReportUrl(image_id: string): string {
    const baseUrl = getApiBaseUrl();
    return baseUrl ? `${baseUrl}/api/report/${image_id}` : `/api/report/${image_id}`;
  }
};
