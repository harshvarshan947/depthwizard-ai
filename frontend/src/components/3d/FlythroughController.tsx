import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';

export interface FlightTelemetry {
  headingDeg: number;
  headingCardinal: string;
  altitudeM: number;
  speedKmh: number;
  isSprinting: boolean;
  isPointerLocked: boolean;
  x: number;
  y: number;
  z: number;
}

interface FlythroughControllerProps {
  orbitRef?: React.RefObject<any>;
  onTelemetryUpdate?: (data: FlightTelemetry) => void;
  onPointerLockStatusChange?: (locked: boolean) => void;
}

export const FlythroughController: React.FC<FlythroughControllerProps> = ({
  orbitRef,
  onTelemetryUpdate,
  onPointerLockStatusChange
}) => {
  const { camera, gl } = useThree();
  const { flythroughActive, flythroughSpeed, calibration } = useApp();

  const keys = useRef<{ [key: string]: boolean }>({});
  const isPointerLocked = useRef(false);
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const currentRoll = useRef(0);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const frameCount = useRef(0);

  // Initialize camera for first-person aerial viewpoint & attach listeners
  useEffect(() => {
    if (!flythroughActive) return;

    // Set initial drone starting position and perspective
    camera.position.set(0, 22, 42);
    camera.lookAt(0, 2, 0);
    camera.up.set(0, 1, 0);
    euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
    euler.current.z = 0;
    currentRoll.current = 0;
    velocity.current.set(0, 0, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      keys.current[e.code] = true;
      keys.current[e.key.toLowerCase()] = true;

      // Allow ESC to release pointer lock or exit
      if (e.code === 'Escape' && document.pointerLockElement) {
        document.exitPointerLock();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
      keys.current[e.key.toLowerCase()] = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      // Rotate camera if pointer is locked OR if dragging with mouse button held
      if (isPointerLocked.current || e.buttons === 1 || e.buttons === 2) {
        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        const sensitivity = 0.0022;
        euler.current.y -= movementX * sensitivity;
        euler.current.x -= movementY * sensitivity;

        // Clamp pitch to [-82 deg, +82 deg] to prevent camera flipping
        const maxPitch = 1.43;
        euler.current.x = Math.max(-maxPitch, Math.min(maxPitch, euler.current.x));

        camera.quaternion.setFromEuler(euler.current);
      }
    };

    // Canvas click triggers pointer lock for true FPS free-look
    const onCanvasClick = () => {
      if (!isPointerLocked.current && gl.domElement) {
        gl.domElement.requestPointerLock?.();
      }
    };

    const onPointerLockChange = () => {
      const locked = Boolean(document.pointerLockElement === gl.domElement);
      isPointerLocked.current = locked;
      if (onPointerLockStatusChange) {
        onPointerLockStatusChange(locked);
      }
    };

    const domElement = gl.domElement;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    domElement.addEventListener('click', onCanvasClick);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    return () => {
      // Clean up all key states & active locks
      keys.current = {};
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      domElement.removeEventListener('click', onCanvasClick);
      document.removeEventListener('pointerlockchange', onPointerLockChange);

      // Restore camera up vector and cleanly re-sync OrbitControls
      camera.up.set(0, 1, 0);
      if (orbitRef && orbitRef.current) {
        orbitRef.current.target.set(0, 0, 0);
        orbitRef.current.object.position.set(35, 45, 50);
        orbitRef.current.object.lookAt(0, 0, 0);
        orbitRef.current.update();
      }
    };
  }, [flythroughActive, camera, gl.domElement, orbitRef, onPointerLockStatusChange]);

  // Main 60 FPS flight physics simulation loop
  useFrame((_, delta) => {
    if (!flythroughActive) return;

    // Forward and Right vectors on horizontal flight plane
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const forwardHorizontal = new THREE.Vector3(forward.x, 0, forward.z).normalize();
    const right = new THREE.Vector3();
    right.crossVectors(forwardHorizontal, new THREE.Vector3(0, 1, 0)).normalize();

    // Direction vector accumulation from WASD / Arrow / Space / Ctrl / Q / E
    const moveDir = new THREE.Vector3();

    // Forward / Backward: W, ArrowUp / S, ArrowDown
    if (keys.current['KeyW'] || keys.current['ArrowUp'] || keys.current['w']) {
      moveDir.add(forwardHorizontal);
    }
    if (keys.current['KeyS'] || keys.current['ArrowDown'] || keys.current['s']) {
      moveDir.sub(forwardHorizontal);
    }

    // Strafe Left / Right: A, ArrowLeft / D, ArrowRight
    if (keys.current['KeyA'] || keys.current['ArrowLeft'] || keys.current['a']) {
      moveDir.sub(right);
    }
    if (keys.current['KeyD'] || keys.current['ArrowRight'] || keys.current['d']) {
      moveDir.add(right);
    }

    // Vertical Flight: Space / E (Ascend), Ctrl / C / Q (Descend)
    if (keys.current['Space'] || keys.current['KeyE'] || keys.current['e']) {
      moveDir.y += 1.0;
    }
    if (
      keys.current['ControlLeft'] || 
      keys.current['ControlRight'] || 
      keys.current['KeyC'] || 
      keys.current['KeyQ'] ||
      keys.current['c'] ||
      keys.current['q']
    ) {
      moveDir.y -= 1.0;
    }

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
    }

    // Turbo Sprint Boost
    const isSprinting = Boolean(
      keys.current['ShiftLeft'] || 
      keys.current['ShiftRight'] || 
      keys.current['shift']
    );

    const baseCruiseSpeed = 16.0 * flythroughSpeed;
    const currentMaxSpeed = baseCruiseSpeed * (isSprinting ? 2.5 : 1.0);
    const targetVel = moveDir.multiplyScalar(currentMaxSpeed);

    // Smooth inertia interpolation (accelerates & decelerates gracefully)
    velocity.current.lerp(targetVel, 0.12);

    // Apply movement
    camera.position.addScaledVector(velocity.current, delta);

    // Ground floor collision safety buffer (terrain grid is at -5.0)
    if (camera.position.y < -2.8) {
      camera.position.y = -2.8;
      if (velocity.current.y < 0) velocity.current.y = 0;
    }

    // Realistic banking tilt when strafing left / right
    let targetRoll = 0;
    if (keys.current['KeyA'] || keys.current['ArrowLeft'] || keys.current['a']) targetRoll = 0.045;
    if (keys.current['KeyD'] || keys.current['ArrowRight'] || keys.current['d']) targetRoll = -0.045;
    currentRoll.current = THREE.MathUtils.lerp(currentRoll.current, targetRoll, 0.08);

    euler.current.z = currentRoll.current;
    camera.quaternion.setFromEuler(euler.current);

    // Throttled Telemetry update (~15 times per second to keep React HUD snappy)
    frameCount.current++;
    if (frameCount.current % 4 === 0 && onTelemetryUpdate) {
      // Calculate compass heading (0 = North, 90 = East, 180 = South, 270 = West)
      let headingDeg = Math.atan2(forward.x, -forward.z) * (180 / Math.PI);
      if (headingDeg < 0) headingDeg += 360;

      const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const headingCardinal = cardinals[Math.round(headingDeg / 45) % 8];

      // Altitude relative to ground datum (-5.0)
      const altitudeRaw = Math.max(0, camera.position.y + 5.0);
      const isCalibrated = calibration.is_calibrated;
      const scaleMultiplier = isCalibrated 
        ? (calibration.reference_height_m ? (calibration.reference_height_m / 20.0) : 1.2) 
        : 1.0;
      const altitudeM = altitudeRaw * scaleMultiplier;

      // Speed in km/h based on current velocity
      const speedKmh = Math.round(velocity.current.length() * 3.6);

      onTelemetryUpdate({
        headingDeg: Math.round(headingDeg),
        headingCardinal,
        altitudeM: Math.round(altitudeM * 10) / 10,
        speedKmh,
        isSprinting,
        isPointerLocked: isPointerLocked.current,
        x: Math.round(camera.position.x * 10) / 10,
        y: Math.round(camera.position.y * 10) / 10,
        z: Math.round(camera.position.z * 10) / 10
      });
    }
  });

  return null;
};
