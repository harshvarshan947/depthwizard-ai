import numpy as np
from PIL import Image
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.cm as cm

def apply_colormap(data_2d: np.ndarray, cmap_name: str = 'turbo') -> Image.Image:
    """
    Applies a standard colormap (turbo, viridis, inferno, terrain, etc.)
    to a normalized 2D numpy array [0.0, 1.0] and returns a PIL RGBA Image.
    """
    # Ensure float in [0, 1]
    norm_data = np.clip(data_2d, 0.0, 1.0)
    
    # Get colormap
    try:
        colormap = matplotlib.colormaps[cmap_name]
    except Exception:
        colormap = cm.get_cmap('turbo')
        
    rgba = colormap(norm_data)
    rgba_uint8 = (rgba * 255).astype(np.uint8)
    return Image.fromarray(rgba_uint8, mode='RGBA')

def create_elevation_colormap(data_2d: np.ndarray) -> Image.Image:
    """
    Geospatial terrain elevation palette:
    Deep blue (sea/lowest) -> Green (lowlands) -> Yellow/Gold (midlands) -> Red/Orange (peaks) -> White/Snow.
    """
    norm_data = np.clip(data_2d, 0.0, 1.0)
    colormap = cm.get_cmap('gist_earth')
    rgba = colormap(norm_data)
    rgba_uint8 = (rgba * 255).astype(np.uint8)
    return Image.fromarray(rgba_uint8, mode='RGBA')

def array_to_grayscale_png_bytes(data_2d: np.ndarray) -> bytes:
    """Encodes normalized [0, 1] data into 16-bit or 8-bit grayscale PNG bytes."""
    data_uint8 = (np.clip(data_2d, 0.0, 1.0) * 255).astype(np.uint8)
    img = Image.fromarray(data_uint8, mode='L')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()
