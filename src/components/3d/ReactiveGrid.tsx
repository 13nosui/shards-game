import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { GRID_SIZE } from '../../utils/gameUtils';

// Define the custom shader material
const ShardsGridMaterial = shaderMaterial(
    {
        uTime: 0,
        uImpulse: new THREE.Vector2(0.5, 0.5),
        uStrength: 0,
        uColor: new THREE.Color('#ffffff'),
        uGridSize: GRID_SIZE,
    },
    // Vertex Shader: Fluid/Elastic distortion
    `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uImpulse;
  uniform float uStrength;

  // Simple noise function for "alive" movement
  float noise(vec2 p) {
    return sin(p.x * 10.0 + uTime) * cos(p.y * 10.0 + uTime) * 0.02;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // 1. Ripple / Impulse Distortion
    float dist = distance(uv, uImpulse);
    float ripple = sin(dist * 20.0 - uTime * 10.0) * exp(-dist * 5.0) * uStrength;
    
    // 2. Elastic displacement (2D push effect)
    vec2 dir = normalize(uv - uImpulse);
    float push = exp(-dist * 8.0) * uStrength * 0.5;
    
    pos.xy += dir * push;
    pos.z += ripple * 0.5;

    // 3. Constant "alive" noise
    pos.z += noise(uv * 2.0);
    pos.x += noise(uv * 1.5 + 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
  `,
    // Fragment Shader: Sharp grid lines
    `
  varying vec2 vUv;
  uniform float uGridSize;
  uniform vec3 uColor;

  void main() {
    vec2 grid = fract(vUv * uGridSize);
    // Sharp lines with width ~0.02
    float line = step(0.98, grid.x) + step(0.98, grid.y);
    line = clamp(line, 0.0, 1.0);
    
    if (line < 0.1) discard; // Keep background black

    gl_FragColor = vec4(uColor, 1.0);
  }
  `
);

// Fix: Unique name to avoid collision with @react-three/drei
extend({ ShardsGridMaterial });

declare module '@react-three/fiber' {
    interface ThreeElements {
        shardsGridMaterial: {
            attach?: string
            args?: any[]
            ref?: any
            key?: any
            onUpdate?: (self: THREE.ShaderMaterial) => void
            // Custom Uniforms
            uTime?: number
            uImpulse?: THREE.Vector2
            uStrength?: number
            uColor?: THREE.Color
            uGridSize?: number
            // Standard Material Props
            transparent?: boolean
            wireframe?: boolean
            side?: THREE.Side
        }
    }
}

export interface ReactiveGridHandle {
    trigger: (x: number, y: number) => void;
}

export const ReactiveGrid = forwardRef<ReactiveGridHandle, {}>((_, ref) => {
    const materialRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
        trigger: (x: number, y: number) => {
            if (materialRef.current) {
                // Map world coords (approx -5 to 5) back to UV (0 to 1)
                // Grid is 10x10 centered at 0,0
                const u = (x + 5) / 10;
                const v = (y + 5) / 10;
                materialRef.current.uImpulse.set(u, v);
                materialRef.current.uStrength = 1.0;
            }
        }
    }));

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.getElapsedTime();
            // Elastic/Exponential decay
            materialRef.current.uStrength *= 0.94;
            if (materialRef.current.uStrength < 0.001) materialRef.current.uStrength = 0;
        }
    });

    return (
        <mesh position={[0, 0, -0.05]} rotation={[0, 0, 0]}>
            <planeGeometry args={[10, 10, 128, 128]} />
            <shardsGridMaterial
                ref={materialRef}
                key={ShardsGridMaterial.key}
                uColor={new THREE.Color('#ffffff')}
                transparent={false}
            />
        </mesh>
    );
});
