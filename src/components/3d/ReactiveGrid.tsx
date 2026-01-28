import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { GRID_SIZE } from '../../utils/gameUtils';

// Define the static shards grid material with tiled squares
const ShardsGridMaterial = shaderMaterial(
    {
        uBgColor: new THREE.Color('#ffffff'),
        uTileColor: new THREE.Color('#ebebeb'),
        uGridSize: GRID_SIZE,
    },
    // Vertex Shader: Standard position calculation
    `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment Shader: Tiled faint grey squares on white background
    `
    varying vec2 vUv;
    uniform float uGridSize;
    uniform vec3 uBgColor;
    uniform vec3 uTileColor;

    void main() {
        vec2 grid = fract(vUv * uGridSize);
        
        // Small margin/gap of ~0.02
        float margin = 0.02;
        float mask = step(margin, grid.x) * step(margin, grid.y) * 
                     step(grid.x, 1.0 - margin) * step(grid.y, 1.0 - margin);
        
        vec3 color = mix(uBgColor, uTileColor, mask);
        gl_FragColor = vec4(color, 1.0);
    }
    `
);

// Register the material with R3F
extend({ ShardsGridMaterial });

// Type augmentation for JSX
declare module '@react-three/fiber' {
    interface ThreeElements {
        shardsGridMaterial: {
            attach?: string
            args?: any[]
            ref?: any
            key?: any
            onUpdate?: (self: THREE.ShaderMaterial) => void
            uBgColor?: THREE.Color
            uTileColor?: THREE.Color
            uGridSize?: number
            transparent?: boolean
            wireframe?: boolean
            side?: THREE.Side
        }
    }
}

export const ReactiveGrid = () => {
    return (
        <mesh position={[0, 0, -0.05]} receiveShadow>
            <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
            <shardsGridMaterial
                uBgColor={new THREE.Color('#ffffff')}
                uTileColor={new THREE.Color('#ebebeb')}
                uGridSize={GRID_SIZE}
                transparent={false}
            />
        </mesh>
    );
};
