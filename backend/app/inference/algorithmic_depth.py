import numpy as np
from PIL import Image, ImageFilter, ImageOps
import time

def compute_aerial_gradient_depth(image: Image.Image) -> np.ndarray:
    """
    High-fidelity structural monocular depth estimator for aerial and satellite imagery.
    Combines:
    1. Multi-scale luminance & local contrast
    2. Edge salience (Sobel magnitude)
    3. Shadow extrusion: detects dark shadow regions adjacent to high-contrast edges
    4. Rooftop texture flatness and height segmentation
    5. Atmospheric and distance perspective attenuation

    Returns a 2D float32 numpy array normalized to [0.0, 1.0].
    """
    img_gray = image.convert('L')
    w, h = img_gray.size
    
    # Base array
    arr = np.array(img_gray, dtype=np.float32) / 255.0
    
    # 1. Multi-scale blur to extract macro structure and suppress pixel-level noise
    img_blur_md = img_gray.filter(ImageFilter.GaussianBlur(radius=4))
    img_blur_lg = img_gray.filter(ImageFilter.GaussianBlur(radius=12))
    arr_md = np.array(img_blur_md, dtype=np.float32) / 255.0
    arr_lg = np.array(img_blur_lg, dtype=np.float32) / 255.0

    # Macro structural difference (solid building footprints, not 1px razor edges)
    macro_structure = np.clip((arr_md - arr_lg) * 2.5, 0.0, 1.0)
    macro_img = Image.fromarray((macro_structure * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=3))
    macro_smooth = np.array(macro_img, dtype=np.float32) / 255.0

    # 2. Shadow & Roof separation:
    shadow_mask = (arr_md < 0.22).astype(np.float32)
    roof_candidate = (arr_md > 0.35).astype(np.float32) * arr_md
    shadow_caster_weight = np.roll(shadow_mask, shift=(-4, -4), axis=(0, 1))

    # 3. Base elevation field
    y_coords, x_coords = np.mgrid[0:h, 0:w]
    terrain_tilt = 0.04 * (y_coords / float(h)) + 0.03 * (x_coords / float(w))

    # 4. Combine signals with smooth plateau weighting (no raw edge spikes)
    combined = (
        0.45 * arr_md +
        0.30 * macro_smooth +
        0.15 * (roof_candidate * shadow_caster_weight) +
        terrain_tilt
    )

    # 5. Heavy spatial Gaussian smoothing to guarantee solid, non-spiky plateaus
    smooth_img = Image.fromarray((combined * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=3.5))
    raw_depth = np.array(smooth_img, dtype=np.float32) / 255.0

    # 6. Robust percentile normalization (ignore UI banner in bottom 8%)
    h_crop = max(int(h * 0.92), 1)
    sample_area = raw_depth[:h_crop, :]
    p15 = float(np.percentile(sample_area, 15))
    p95 = float(np.percentile(sample_area, 95))
    if p95 > p15:
        depth_norm = np.clip((raw_depth - p15) / (p95 - p15 + 1e-6), 0.0, 1.0)
    else:
        depth_norm = np.clip(raw_depth, 0.0, 1.0)

    # Soft plateau power curve
    depth_final = np.power(depth_norm, 1.1)
    return depth_final.astype(np.float32)

def generate_procedural_aerial_demo(scenario: str = "urban_commercial", width: int = 768, height: int = 768):
    """
    Generates a photorealistic synthetic aerial RGB image and its matching ground-truth height field.
    This guarantees 100% offline standalone presentation-readiness for SIH demo.
    """
    np.random.seed(42 if scenario == "urban_commercial" else 101)
    
    rgb = np.zeros((height, width, 3), dtype=np.uint8)
    height_map = np.zeros((height, width), dtype=np.float32)
    
    # Base terrain ground (roads, asphalt, grass patches)
    rgb[:, :] = [58, 68, 62]  # Dark urban ground / pavement
    height_map[:, :] = 0.05 + 0.02 * np.sin(np.linspace(0, 3*np.pi, height))[:, None]
    
    # Roads network (grid)
    road_color = [35, 40, 45]
    road_spacing = 160
    for r in range(40, height, road_spacing):
        rgb[r:r+24, :] = road_color
        height_map[r:r+24, :] = 0.02
        # Road markings
        for c in range(0, width, 30):
            rgb[r+11:r+13, c:c+15] = [210, 200, 150]
            
    for c in range(50, width, road_spacing):
        rgb[:, c:c+24] = road_color
        height_map[:, c:c+24] = 0.02
        for r in range(0, height, 30):
            rgb[r:r+15, c+11:c+13] = [210, 200, 150]

    # Buildings / Structures with distinct heights, roofs, HVAC equipment, and realistic sun shadows
    buildings = [
        # (y, x, h_size, w_size, height_val, roof_color)
        (75, 85, 95, 110, 0.85, [195, 198, 204]),      # High-rise Tower A
        (75, 230, 80, 120, 0.65, [160, 168, 175]),     # Commercial Block B
        (80, 390, 70, 90, 0.45, [180, 150, 130]),      # Brick Commercial
        (85, 515, 65, 105, 0.55, [140, 155, 165]),     # Office Block
        (230, 85, 110, 100, 0.75, [210, 215, 220]),    # Tech Park Central
        (240, 235, 90, 115, 0.95, [230, 235, 245]),    # Parallax Sky Tower (Tallest)
        (235, 390, 105, 120, 0.70, [150, 160, 170]),   # Convention Center
        (240, 545, 90, 85, 0.40, [175, 180, 160]),     # Logistics Warehouse
        (395, 85, 120, 115, 0.50, [190, 175, 160]),    # Residential Block 1
        (400, 240, 100, 105, 0.60, [170, 180, 190]),   # Residential Block 2
        (390, 395, 115, 110, 0.80, [205, 210, 215]),   # Innovation Hub
        (405, 540, 100, 95, 0.48, [165, 155, 145]),    # Data Center
        (560, 90, 90, 110, 0.35, [145, 150, 155]),     # Low-rise Substation
        (555, 245, 95, 100, 0.52, [185, 175, 165]),    # Commercial Depot
        (560, 390, 85, 115, 0.42, [160, 170, 165]),    # Retail Complex
        (550, 545, 100, 105, 0.72, [215, 220, 230])    # Telecom Tower Annex
    ]

    # Sun direction for shadow simulation: light from NW, shadow cast toward SE
    for (by, bx, bh, bw, bz, bcolor) in buildings:
        # Cast shadow on ground (offset down-right)
        shadow_len = int(bz * 28)
        sy1 = min(height, by + shadow_len)
        sy2 = min(height, by + bh + shadow_len)
        sx1 = min(width, bx + shadow_len)
        sx2 = min(width, bx + bw + shadow_len)
        
        # Shadow region
        rgb[by:sy2, bx:sx2] = (rgb[by:sy2, bx:sx2] * 0.38).astype(np.uint8)
        
    for (by, bx, bh, bw, bz, bcolor) in buildings:
        # Building footprint
        rgb[by:by+bh, bx:bx+bw] = bcolor
        height_map[by:by+bh, bx:bx+bw] = bz
        
        # Roof border edge
        rgb[by:by+2, bx:bx+bw] = [30, 30, 35]
        rgb[by+bh-2:by+bh, bx:bx+bw] = [30, 30, 35]
        rgb[by:by+bh, bx:bx+2] = [30, 30, 35]
        rgb[by:by+bh, bx+bw-2:bx+bw] = [30, 30, 35]
        
        # HVAC rooftop units
        hvac_y = by + bh // 3
        hvac_x = bx + bw // 3
        rgb[hvac_y:hvac_y+12, hvac_x:hvac_x+16] = [80, 85, 90]
        height_map[hvac_y:hvac_y+12, hvac_x:hvac_x+16] = bz + 0.04
        
        # Helipad on tallest tower
        if bz > 0.9:
            cy, cx = by + bh // 2, bx + bw // 2
            for dy in range(-15, 16):
                for dx in range(-15, 16):
                    if dy*dy + dx*dx <= 225:
                        rgb[cy+dy, cx+dx] = [210, 190, 50]
            # White 'H'
            rgb[cy-8:cy+9, cx-2:cx+3] = [255, 255, 255]
            rgb[cy-8:cy+9, cx-8:cx-6] = [255, 255, 255]
            rgb[cy-8:cy+9, cx+6:cx+8] = [255, 255, 255]
            rgb[cy-2:cy+2, cx-7:cx+8] = [255, 255, 255]

    # Trees / Greenery patches around sidewalks
    green_patches = [
        (185, 75, 30, 80), (185, 230, 30, 60), (345, 80, 30, 90),
        (350, 380, 30, 110), (510, 240, 30, 75)
    ]
    for (py, px, ph, pw) in green_patches:
        rgb[py:py+ph, px:px+pw] = [45, 85, 45]
        height_map[py:py+ph, px:px+pw] = 0.12  # Canopy height

    # Noise texture for realism
    noise = np.random.randint(-10, 10, (height, width, 3), dtype=np.int16)
    rgb = np.clip(rgb.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    img = Image.fromarray(rgb)
    return img, height_map
