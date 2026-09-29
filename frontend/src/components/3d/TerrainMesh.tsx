import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';

interface TerrainMeshProps {
  onPointClick?: (point: THREE.Vector3) => void;
  onHoverElevation?: (coords: { x: number; y: number; z: number; height: number } | null) => void;
  wireframeOverlay?: boolean;
}

interface HeightFieldState {
  elevations: Float32Array;
  gridX: number;
  gridY: number;
  aspect: number;
}

export const TerrainMesh: React.FC<TerrainMeshProps> = ({ 
  onPointClick, 
  onHoverElevation,
  wireframeOverlay = false 
}) => {
  const {
    currentResult,
    meshDisplayMode,
    heightExaggeration,
    selectedObjectId,
    setSelectedObjectId,
    measurementMode,
    addMeasurementPoint,
    calibration
  } = useApp();

  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeMeshRef = useRef<THREE.Mesh>(null);
  const [heightData, setHeightData] = useState<HeightFieldState | null>(null);

  // Fallback textures or real result textures
  const textureUrl = currentResult?.image_url || '/demo_assets/demo_urban_commercial.png';
  const depthUrl = currentResult?.depth?.normalized_depth_url || '/demo_assets/demo_urban_commercial_depth_norm.png';
  const heightColorUrl = currentResult?.height?.colorized_height_url || '/demo_assets/demo_urban_commercial_height_color.png';

  // Load textures using Three.js loader
  const [colorMap, elevationColormap] = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const cMap = loader.load(textureUrl);
    const eMap = loader.load(heightColorUrl);
    
    cMap.colorSpace = THREE.SRGBColorSpace;
    eMap.colorSpace = THREE.SRGBColorSpace;
    cMap.wrapS = cMap.wrapT = THREE.ClampToEdgeWrapping;
    eMap.wrapS = eMap.wrapT = THREE.ClampToEdgeWrapping;
    cMap.minFilter = THREE.LinearMipmapLinearFilter;
    cMap.magFilter = THREE.LinearFilter;
    eMap.minFilter = THREE.LinearMipmapLinearFilter;
    eMap.magFilter = THREE.LinearFilter;
    
    return [cMap, eMap];
  }, [textureUrl, heightColorUrl]);

  // Load depth map image and sample pixel values into CPU Float32 elevation buffer
  useEffect(() => {
    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (isCancelled) return;
      const gridX = 160;
      const aspect = img.height > 0 ? img.height / img.width : 1.0;
      const gridY = Math.max(32, Math.min(192, Math.round(160 * aspect)));

      const canvas = document.createElement('canvas');
      canvas.width = gridX + 1;
      canvas.height = gridY + 1;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, gridX + 1, gridY + 1);
      const imgData = ctx.getImageData(0, 0, gridX + 1, gridY + 1).data;

      const totalVertices = (gridX + 1) * (gridY + 1);
      const elevations = new Float32Array(totalVertices);

      // Sample luminance from grayscale depth map [0, 1]
      for (let r = 0; r <= gridY; r++) {
        for (let c = 0; c <= gridX; c++) {
          const vIdx = r * (gridX + 1) + c;
          const pIdx = (r * (gridX + 1) + c) * 4;
          const rVal = imgData[pIdx];
          const gVal = imgData[pIdx + 1];
          const bVal = imgData[pIdx + 2];
          // ITU-R BT.601 perceptual luminance
          const luminance = (rVal * 0.299 + gVal * 0.587 + bVal * 0.114) / 255.0;
          elevations[vIdx] = luminance;
        }
      }

      setHeightData({ elevations, gridX, gridY, aspect });
    };

    img.onerror = (e) => {
      console.warn('Failed to load depth texture, generating procedural fallback elevation:', e);
      // Fallback procedural elevation for robust rendering
      const gridX = 160;
      const gridY = 160;
      const totalVertices = (gridX + 1) * (gridY + 1);
      const elevations = new Float32Array(totalVertices);
      for (let r = 0; r <= gridY; r++) {
        for (let c = 0; c <= gridX; c++) {
          const vIdx = r * (gridX + 1) + c;
          const nx = c / gridX - 0.5;
          const ny = r / gridY - 0.5;
          elevations[vIdx] = Math.max(0, 0.8 - Math.sqrt(nx * nx + ny * ny) * 1.5);
        }
      }
      setHeightData({ elevations, gridX, gridY, aspect: 1.0 });
    };

    img.src = depthUrl;

    return () => {
      isCancelled = true;
    };
  }, [depthUrl]);

  // Apply height displacement directly to PlaneGeometry vertices & recompute surface normals
  useEffect(() => {
    if (!meshRef.current || !heightData) return;
    const geom = meshRef.current.geometry as THREE.PlaneGeometry;
    if (!geom || !geom.attributes.position) return;

    const pos = geom.attributes.position;
    const posArray = pos.array as Float32Array;
    const baseHeightScale = 20.0 * heightExaggeration;
    const len = Math.min(heightData.elevations.length, pos.count);

    // PlaneGeometry vertices are oriented in XY plane; Z is the normal (which becomes world +Y when rotated)
    for (let i = 0; i < len; i++) {
      posArray[i * 3 + 2] = heightData.elevations[i] * baseHeightScale;
    }

    pos.needsUpdate = true;
    geom.computeVertexNormals();
    if (geom.attributes.normal) {
      geom.attributes.normal.needsUpdate = true;
    }
    geom.computeBoundingBox();
    geom.computeBoundingSphere();

    // Also update wireframe overlay geometry if mounted
    if (wireframeMeshRef.current) {
      const wGeom = wireframeMeshRef.current.geometry as THREE.PlaneGeometry;
      if (wGeom && wGeom.attributes.position) {
        const wPosArray = wGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < len; i++) {
          wPosArray[i * 3 + 2] = heightData.elevations[i] * baseHeightScale + 0.05;
        }
        wGeom.attributes.position.needsUpdate = true;
        wGeom.computeVertexNormals();
      }
    }
  }, [heightData, heightExaggeration]);

  // Handle pointer down for measurement tool or point clicking
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const p = e.point;
    if (measurementMode) {
      addMeasurementPoint({ x: p.x, y: p.y, z: p.z });
      return;
    }
    if (onPointClick) {
      onPointClick(p);
    }
  };

  // Handle pointer move to report real-time cursor elevation
  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    if (onHoverElevation && e.point) {
      const p = e.point;
      // In world space, Y is elevation above ground base (-5.0)
      const relativeElevation = Math.max(0, p.y + 5.0);
      const isCalibrated = calibration.is_calibrated;
      const scaleMultiplier = isCalibrated 
        ? (calibration.reference_height_m ? (calibration.reference_height_m / 20.0) : 1.2) 
        : 1.0;
      const heightVal = relativeElevation * scaleMultiplier;
      onHoverElevation({
        x: p.x,
        y: p.y,
        z: p.z,
        height: heightVal
      });
    }
  };

  const handlePointerOut = () => {
    if (onHoverElevation) {
      onHoverElevation(null);
    }
  };

  const gridX = heightData?.gridX || 160;
  const gridY = heightData?.gridY || 160;
  const planeAspect = heightData?.aspect || 1.0;
  const planeWidth = 90;
  const planeHeight = 90 * planeAspect;

  return (
    <group position={[0, -5, 0]}>
      {/* Primary 3D Height-Field Terrain Surface */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry
          key={`terrain-${gridX}-${gridY}-${planeAspect}`}
          args={[planeWidth, planeHeight, gridX, gridY]}
        />

        {meshDisplayMode === 'textured' && (
          <meshStandardMaterial
            map={colorMap}
            roughness={0.65}
            metalness={0.15}
            wireframe={false}
            side={THREE.DoubleSide}
          />
        )}

        {meshDisplayMode === 'solid' && (
          <meshStandardMaterial
            map={elevationColormap}
            roughness={0.45}
            metalness={0.1}
            wireframe={false}
            side={THREE.DoubleSide}
          />
        )}

        {meshDisplayMode === 'wireframe' && (
          <meshStandardMaterial
            color="#00F0FF"
            wireframe={true}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/* Wireframe Overlay Grid (when toggled on top of textured/solid mode) */}
      {wireframeOverlay && meshDisplayMode !== 'wireframe' && (
        <mesh
          ref={wireframeMeshRef}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry
            key={`overlay-${gridX}-${gridY}-${planeAspect}`}
            args={[planeWidth, planeHeight, gridX, gridY]}
          />
          <meshBasicMaterial
            color="#00F0FF"
            wireframe={true}
            transparent={true}
            opacity={0.28}
          />
        </mesh>
      )}

      {/* Detected 3D Object Bounding Highlights & Elevation Beacons */}
      {currentResult?.objects?.objects.map((obj) => {
        const isSelected = selectedObjectId === obj.id;
        const posX = obj.centroid_3d[0] * 0.8;
        const posZ = obj.centroid_3d[2] * 0.8;
        // Position beacon at object height scaled by current height exaggeration
        const posY = Math.max(obj.centroid_3d[1] * heightExaggeration * 0.5, 2.5);

        return (
          <group
            key={obj.id}
            position={[posX, posY, posZ]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedObjectId(isSelected ? null : obj.id);
            }}
          >
            {/* 3D Vertical Marker Pole */}
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 2.8, 8]} />
              <meshBasicMaterial color={isSelected ? "#00F0FF" : "#F59E0B"} />
            </mesh>
            
            {/* Top Pulse Octahedron Diamond */}
            <mesh position={[0, 3.0, 0]}>
              <octahedronGeometry args={[isSelected ? 1.3 : 0.85]} />
              <meshStandardMaterial
                color={isSelected ? "#00F0FF" : "#F59E0B"}
                emissive={isSelected ? "#00F0FF" : "#F59E0B"}
                emissiveIntensity={isSelected ? 0.9 : 0.45}
                wireframe={!isSelected}
              />
            </mesh>

            {/* Bounding Box Outline if selected */}
            {isSelected && (
              <mesh position={[0, -posY / 2 + 1.2, 0]}>
                <boxGeometry args={[10, posY + 2.5, 10]} />
                <meshBasicMaterial color="#00F0FF" wireframe={true} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};
