import { SystemHealth, DemoPreset, PipelineResult, DepthResponse, HeightResponse, ObjectAnalysisResponse, MeshReconstructResponse } from '../types';

export const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

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
  if (!BASE_URL) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error('Failed to reach DepthWizard backend.');
    return res.json();
  },

  async getDemos(): Promise<{ demos: DemoPreset[] }> {
    const res = await fetch(`${BASE_URL}/api/demos`);
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
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
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
    if (params.reference_height_m !== undefined) {
      formData.append('reference_height_m', String(params.reference_height_m));
    }
    formData.append('exaggeration', String(params.exaggeration ?? 1.0));

    const res = await fetch(`${BASE_URL}/api/process`, {
      method: 'POST',
      body: formData,
    });
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
    const res = await fetch(`${BASE_URL}/api/depth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Depth estimation failed');
    return res.json();
  },

  async calculateHeight(payload: {
    image_id: string;
    calibration?: any;
    exaggeration: number;
    colormap: string;
  }): Promise<HeightResponse> {
    const res = await fetch(`${BASE_URL}/api/height`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Height calculation failed');
    return res.json();
  },

  async detectObjects(image_id: string): Promise<ObjectAnalysisResponse> {
    const res = await fetch(`${BASE_URL}/api/objects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_id })
    });
    if (!res.ok) throw new Error('Object detection failed');
    return res.json();
  },

  async reconstructMesh(payload: {
    image_id: string;
    resolution_downsample: number;
    height_exaggeration: number;
  }): Promise<MeshReconstructResponse> {
    const res = await fetch(`${BASE_URL}/api/reconstruct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Mesh reconstruction failed');
    return res.json();
  },

  getExportUrl(image_id: string, format: string): string {
    return `${BASE_URL}/api/export/${image_id}/${format}`;
  },

  getReportUrl(image_id: string): string {
    return `${BASE_URL}/api/report/${image_id}`;
  }
};
