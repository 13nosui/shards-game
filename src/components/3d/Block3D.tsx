import { useMemo } from 'react';
import { motion } from 'framer-motion-3d';
import { COLORS, GRID_SIZE } from '../../utils/gameUtils';

interface Block3DProps {
    x: number;
    y: number;
    type: 'small';
    color: string;
    isGhost?: boolean;
}

export const Block3D = ({ x, y, color, isGhost = false }: Block3DProps) => {
    // Random stagger for spawn animation
    const spawnDelay = useMemo(() => isGhost ? 0 : Math.random() * 0.15, [isGhost]);

    // Convert grid coordinates to world coordinates (XZ Floor Plane)
    const size = 0.96;
    const targetX = (x - (GRID_SIZE - 1) / 2);
    const targetZ = (y - (GRID_SIZE - 1) / 2); // Map grid Y to 3D Z axis

    // Dynamic spring profile based on jelly color
    const springConfig = useMemo(() => {
        if (isGhost) return { stiffness: 100, damping: 20 };
        if (color === COLORS[0]) return { stiffness: 120, damping: 10, mass: 1 };
        if (color === COLORS[1]) return { stiffness: 160, damping: 15, mass: 1.2 };
        if (color === COLORS[2]) return { stiffness: 80, damping: 6, mass: 0.8 };
        if (color === COLORS[3]) return { stiffness: 180, damping: 8, mass: 1 };
        return { stiffness: 120, damping: 10, mass: 1 };
    }, [color, isGhost]);

    return (
        <motion.mesh
            initial={{ scale: 0, x: targetX, y: size / 2, z: targetZ }}
            animate={{
                scale: isGhost ? [0.95, 1, 0.95] : 1,
                opacity: isGhost ? [0.2, 0.4, 0.2] : 1,
                x: targetX,
                y: size / 2,
                z: targetZ
            }}
            exit={{ scale: 0 }}
            castShadow={!isGhost}
            receiveShadow={!isGhost}
            transition={{
                scale: isGhost ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { type: "spring", ...springConfig, delay: spawnDelay },
                opacity: isGhost ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { duration: 0.2 },
                x: { type: "spring", ...springConfig, delay: spawnDelay },
                y: { type: "spring", ...springConfig, delay: spawnDelay },
                z: { type: "spring", ...springConfig, delay: spawnDelay }
            }}
        >
            <boxGeometry args={[size, size, size]} />
            <meshPhysicalMaterial
                color={color}
                transparent={isGhost}
                opacity={isGhost ? 0.3 : 1.0}
                roughness={isGhost ? 0.5 : 0.1}
                metalness={0.0}
                transmission={isGhost ? 0.5 : 0.0}
                ior={1.4}
                thickness={isGhost ? 0.5 : 1.5}
                attenuationColor={color}
                attenuationDistance={1.0}
                specularIntensity={isGhost ? 0.2 : 1.0}
            />
        </motion.mesh>
    );
};
