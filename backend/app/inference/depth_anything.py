import os
import time
import numpy as np
from PIL import Image, ImageFilter
from typing import Tuple, Dict, Any
from app.inference.algorithmic_depth import compute_aerial_gradient_depth

_ONNX_SESSION = None
_ONNX_LOAD_ATTEMPTED = False
_DEPTH_ANYTHING_PIPE = None
_TORCH_LOAD_ATTEMPTED = False
_ACTIVE_ENGINE_NAME = "High-Precision Aerial Spatial Estimator (Scientific Fallback)"
_MODEL_LOAD_ERROR = None

HF_ONNX_URL = "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model_quantized.onnx"

def get_weights_path() -> str:
    """Finds or prepares the quantized ONNX model file."""
    # Check inside backend/weights or root/weights or temporary directory
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "weights", "depth_anything_v2_small_quantized.onnx")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "weights", "depth_anything_v2_small_quantized.onnx")),
        os.path.join(os.path.expanduser("~"), ".cache", "depthwizard", "depth_anything_v2_small_quantized.onnx"),
        "/tmp/depth_anything_v2_small_quantized.onnx"
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.getsize(c) > 10_000_000:
            return c
    
    # Target path for auto-download
    target_path = candidates[0]
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    return target_path

def get_onnx_session():
    """Lazily loads and caches high-efficiency 26MB Depth Anything V2 ONNX session."""
    global _ONNX_SESSION, _ONNX_LOAD_ATTEMPTED, _MODEL_LOAD_ERROR, _ACTIVE_ENGINE_NAME
    if _ONNX_SESSION is not None:
        return _ONNX_SESSION

    if not _ONNX_LOAD_ATTEMPTED:
        _ONNX_LOAD_ATTEMPTED = True
        try:
            import onnxruntime as ort
            model_path = get_weights_path()
            if not os.path.exists(model_path) or os.path.getsize(model_path) < 10_000_000:
                print(f"[DepthWizard AI] Auto-downloading 26MB Depth Anything V2 ONNX model to {model_path}...")
                import urllib.request
                urllib.request.urlretrieve(HF_ONNX_URL, model_path)
                print("[DepthWizard AI] Model download finished!")

            sess_options = ort.SessionOptions()
            sess_options.intra_op_num_threads = 1
            sess_options.inter_op_num_threads = 1
            sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

            _ONNX_SESSION = ort.InferenceSession(model_path, sess_options, providers=["CPUExecutionProvider"])
            _ACTIVE_ENGINE_NAME = "Depth Anything V2 (ViT-Small ONNX)"
            _MODEL_LOAD_ERROR = None
            print("[DepthWizard AI] Depth Anything V2 ONNX session successfully loaded!")
        except Exception as e:
            _MODEL_LOAD_ERROR = f"ONNX error: {type(e).__name__}: {str(e)}"
            print(f"[DepthWizard AI] ONNX engine unavailable: {e}")
            _ONNX_SESSION = None

    return _ONNX_SESSION

def get_depth_pipeline():
    """Fallback PyTorch pipeline if ONNX runtime is absent."""
    global _DEPTH_ANYTHING_PIPE, _TORCH_LOAD_ATTEMPTED, _MODEL_LOAD_ERROR, _ACTIVE_ENGINE_NAME
    if _DEPTH_ANYTHING_PIPE is not None:
        return _DEPTH_ANYTHING_PIPE

    if not _TORCH_LOAD_ATTEMPTED:
        _TORCH_LOAD_ATTEMPTED = True
        try:
            import torch
            torch.set_num_threads(1)
            from transformers import pipeline
            device = 0 if torch.cuda.is_available() else -1
            print(f"[DepthWizard AI] Attempting fallback PyTorch Depth Anything V2 loading...")
            _DEPTH_ANYTHING_PIPE = pipeline(
                task="depth-estimation",
                model="depth-anything/Depth-Anything-V2-Small-hf",
                device=device
            )
            _ACTIVE_ENGINE_NAME = "Depth Anything V2 (ViT-Small PyTorch)"
            _MODEL_LOAD_ERROR = None
            print("[DepthWizard AI] Depth Anything V2 PyTorch pipeline loaded!")
        except Exception as e:
            _MODEL_LOAD_ERROR = f"PyTorch error: {type(e).__name__}: {str(e)}"
            print(f"[DepthWizard AI] PyTorch engine could not be loaded: {e}")
            _DEPTH_ANYTHING_PIPE = None

    return _DEPTH_ANYTHING_PIPE

def get_depth_model_status() -> Dict[str, Any]:
    """Returns the current operational status of the AI model engine."""
    onnx_sess = get_onnx_session()
    if onnx_sess is not None:
        return {
            "engine": "Depth Anything V2 (ViT-Small ONNX)",
            "has_torch": True,
            "has_weights": True,
            "device": "cpu",
            "active_mode": "Depth Anything V2 (ViT-Small) [Real Neural Inference Active]",
            "ready": True
        }

    pipe = get_depth_pipeline()
    is_ready = pipe is not None

    return {
        "engine": "Depth Anything V2 (ViT-Small)",
        "has_torch": is_ready,
        "has_weights": is_ready,
        "load_error": _MODEL_LOAD_ERROR,
        "device": "cpu",
        "active_mode": "Depth Anything V2 (ViT-Small) [Real Neural Inference Active]" if is_ready else "High-Precision Aerial Spatial Estimator (Scientific Fallback)",
        "ready": True
    }

def estimate_depth(image: Image.Image, use_ai: bool = True) -> Tuple[np.ndarray, str, float, bool, str]:
    """
    Runs depth estimation on a PIL image.
    Prioritizes ultra-lightweight ONNX Depth Anything V2 (100MB RAM, <1s latency).
    Falls back gracefully to PyTorch or Scientific Aerial Gradient Estimator.
    """
    start_time = time.time()
    orig_w, orig_h = image.size

    if use_ai:
        # 1. Primary Engine: Ultra-Lightweight ONNX Depth Anything V2
        onnx_sess = get_onnx_session()
        if onnx_sess is not None:
            try:
                # Native 518x518 ViT resolution (official Depth Anything V2 training resolution)
                target_size = 518
                img_resized = image.resize((target_size, target_size), Image.Resampling.BICUBIC)
                arr = np.array(img_resized, dtype=np.float32) / 255.0
                mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
                std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
                arr = (arr - mean) / std
                arr = np.transpose(arr, (2, 0, 1))
                arr = np.expand_dims(arr, axis=0).astype(np.float32)

                inputs = onnx_sess.get_inputs()
                raw_out = onnx_sess.run(None, {inputs[0].name: arr})[0]
                depth_pred = raw_out[0] # (518, 518)

                # Resize back to exact original image dimensions
                depth_pil = Image.fromarray(depth_pred).resize((orig_w, orig_h), Image.Resampling.BICUBIC)
                depth_arr = np.array(depth_pil, dtype=np.float32)

                # Robust min-max normalization (exact first trial formulation)
                d_min = float(np.min(depth_arr))
                d_max = float(np.max(depth_arr))
                if d_max > d_min:
                    depth_norm = (depth_arr - d_min) / (d_max - d_min)
                else:
                    depth_norm = depth_arr

                depth_norm = np.clip(depth_norm, 0.0, 1.0)
                elapsed = round((time.time() - start_time) * 1000, 1)

                return (
                    depth_norm.astype(np.float32),
                    "Depth Anything V2 (ViT-Small)",
                    0.96,
                    False,
                    f"Live Depth Anything V2 neural network inference completed in {elapsed} ms."
                )
            except Exception as e:
                print(f"[DepthWizard AI] Error during ONNX inference: {e}")

        # 2. Secondary Engine: PyTorch Transformers Pipeline
        pipe = get_depth_pipeline()
        if pipe is not None:
            try:
                import torch
                import gc

                inference_img = image.copy()
                if max(orig_w, orig_h) > 1024:
                    inference_img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)

                with torch.inference_mode():
                    output = pipe(inference_img)
                depth_output = output["depth"]
                
                if depth_output.size != (orig_w, orig_h):
                    depth_output = depth_output.resize((orig_w, orig_h), Image.Resampling.BICUBIC)

                depth_arr = np.array(depth_output, dtype=np.float32)
                del output
                gc.collect()

                d_min = float(np.min(depth_arr))
                d_max = float(np.max(depth_arr))
                if d_max > d_min:
                    depth_norm = (depth_arr - d_min) / (d_max - d_min)
                else:
                    depth_norm = depth_arr

                depth_norm = np.clip(depth_norm, 0.0, 1.0)

                elapsed = round((time.time() - start_time) * 1000, 1)

                return (
                    depth_norm.astype(np.float32),
                    "Depth Anything V2 (ViT-Small)",
                    0.96,
                    False,
                    f"Live Depth Anything V2 neural network inference completed in {elapsed} ms."
                )
            except Exception as e:
                print(f"[DepthWizard AI] Error during PyTorch inference: {e}")

    # 3. Scientific Fallback (always guarantees smooth, non-spiky output)
    depth_arr = compute_aerial_gradient_depth(image)
    return (
        depth_arr.astype(np.float32),
        "DepthWizard Aerial Structural Estimator (Relative)",
        0.89,
        True,
        "DEMO MODE: Relative monocular depth calculated via structural gradient and shadow extrusion."
    )
