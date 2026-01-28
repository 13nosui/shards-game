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

    // Convert grid coordinates to world coordinates
    const size = 0.96;
    const targetX = (x - (GRID_SIZE - 1) / 2);
    const targetY = - (y - (GRID_SIZE - 1) / 2); // Flip Y for 3D coordinate system

    // Snappy spring config
    const springConfig = {
        type: "spring",
        stiffness: 450,
        damping: 25,
        mass: 1
    };

    return (
        <motion.mesh
            initial={{ scale: 0, x: targetX, y: targetY, z: size / 2 }}
            animate={{
                scale: 1,
                x: targetX,
                y: targetY,
                z: size / 2
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
            <meshStandardMaterial
                color={color}
                flatShading={true}
                roughness={0.8}
                metalness={0}
                transparent={false}
                opacity={1}
            />
        </motion.mesh>
    );
};
