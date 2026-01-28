import { useRef, useMemo } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { GRID_SIZE } from '../../utils/gameUtils';

const vertexShader = `
  varying vec2 vUv;
  uniform vec3 uImpulse;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Displacement Logic
    float dist = distance(uv, uImpulse.xy);
    float force = uImpulse.z * exp(-dist * 10.0);
    pos.z += sin(dist * 20.0 - uTime * 5.0) * force * 0.1;
    pos.z += force * 0.2;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uGridSize;

  void main() {
    vec2 grid = fract(vUv * uGridSize);
    float line = step(0.98, grid.x) + step(0.98, grid.y);
    vec3 color = mix(vec3(0.0), vec3(1.0), line * 0.3);
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface ReactiveGridProps {
    onPointerDown?: (x: number, y: number) => void;
}

export const ReactiveGrid = ({ onPointerDown }: ReactiveGridProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uGridSize: { value: GRID_SIZE },
        uImpulse: { value: new THREE.Vector3(0.5, 0.5, 0.0) }
    }), []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            // Decay Impulse
            materialRef.current.uniforms.uImpulse.value.z *= 0.92;
        }
    });

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const uv = e.uv;
        if (uv && materialRef.current) {
            // Trigger Ripple
            materialRef.current.uniforms.uImpulse.value.set(uv.x, uv.y, 1.0);

            // Map UV to grid coords for game logic
            const gx = Math.floor(uv.x * GRID_SIZE);
            const gy = Math.floor((1.0 - uv.y) * GRID_SIZE);
            onPointerDown?.(gx, gy);
        }
    };

    return (
        <mesh
            ref={meshRef}
            position={[0, 0, -0.01]}
            onPointerDown={handlePointerDown}
        >
            <planeGeometry args={[10, 10, 64, 64]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
};
