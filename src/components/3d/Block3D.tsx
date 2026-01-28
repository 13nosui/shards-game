import { useMemo } from 'react';
import { motion } from 'framer-motion-3d';
import { GRID_SIZE } from '../../utils/gameUtils';

interface Block3DProps {
    x: number;
    y: number;
    type: 'small';
    color: string;
}

export const Block3D = ({ x, y, color }: Block3DProps) => {
    // Random stagger for spawn animation
    const spawnDelay = useMemo(() => Math.random() * 0.15, []);

    // Convert grid coordinates to world coordinates (XZ Floor Plane)
    const size = 0.96;
    const targetX = (x - (GRID_SIZE - 1) / 2);
    const targetZ = (y - (GRID_SIZE - 1) / 2); // Map grid Y to 3D Z axis

    // Snappy spring config
    const springConfig = {
        type: "spring",
        stiffness: 450,
        damping: 25,
        mass: 1
    };

    return (
        <motion.mesh
            initial={{ scale: 0, x: targetX, y: size / 2, z: targetZ }}
            animate={{
                scale: 1,
                x: targetX,
                y: size / 2,
                z: targetZ
            }}
            exit={{ scale: 0 }}
            castShadow
            receiveShadow
            transition={{
                ...springConfig,
                // Only delay the initial appearance
                delay: spawnDelay
            }}
        >
            <boxGeometry args={[size, size, size]} />
            <meshPhysicalMaterial
                color={color}
                transparent={true}
                opacity={0.85}
                roughness={0.1}
                metalness={0.0}
                transmission={1.0}
                ior={1.4}
                thickness={1.5}
                attenuationColor={color}
                attenuationDistance={1.0}
                specularIntensity={1.0}
            />
        </motion.mesh>
    );
};
