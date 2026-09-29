import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';

export const MeasurementOverlay: React.FC = () => {
  const { measurementPoints } = useApp();

  const [pt1, pt2] = measurementPoints;

  const lineGeometry = useMemo(() => {
    if (measurementPoints.length < 2 || !pt1 || !pt2) return null;
    const points = [
      new THREE.Vector3(pt1.x, pt1.y, pt1.z),
      new THREE.Vector3(pt2.x, pt2.y, pt2.z)
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [measurementPoints, pt1, pt2]);

  const lineObject = useMemo(() => {
    if (!lineGeometry) return null;
    return new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: '#00F0FF', linewidth: 3 })
    );
  }, [lineGeometry]);

  if (measurementPoints.length === 0) return null;

  return (
    <group>
      {/* Point 1 Marker */}
      {pt1 && (
        <mesh position={[pt1.x, pt1.y, pt1.z]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color="#00F0FF" />
        </mesh>
      )}

      {/* Point 2 Marker */}
      {pt2 && (
        <mesh position={[pt2.x, pt2.y, pt2.z]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
      )}

      {/* Connecting Measurement Line */}
      {lineObject && <primitive object={lineObject} />}
    </group>
  );
};
