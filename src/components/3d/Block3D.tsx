import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion-3d';
import { GRID_SIZE } from '../../utils/gameUtils'; // COLORSを削除

interface Block3DProps {
    x: number;
    y: number;
    type: 'small';
    color: string;
    isGhost?: boolean;
    bumpEvent?: { x: number; y: number; id: number } | null;
}

export const Block3D = ({ x, y, color, isGhost = false, bumpEvent }: Block3DProps) => {
    const [bumpOffset, setBumpOffset] = useState({ x: 0, z: 0 });

    useEffect(() => {
        if (bumpEvent) {
            setBumpOffset({
                x: bumpEvent.x * 0.2,
                z: bumpEvent.y * 0.2
            });
            const timer = setTimeout(() => {
                setBumpOffset({ x: 0, z: 0 });
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [bumpEvent]);

    const spawnDelay = useMemo(() => isGhost ? 0 : Math.random() * 0.15, [isGhost]);

    const size = 0.96;
    const targetX = (x - (GRID_SIZE - 1) / 2);
    const targetZ = (y - (GRID_SIZE - 1) / 2);

    const springConfig = useMemo(() => {
        if (isGhost) return { stiffness: 100, damping: 20 };
        return { stiffness: 120, damping: 10, mass: 1 };
    }, [isGhost]);

    return (
        <motion.mesh
            initial={{ scale: 0, x: targetX, y: size / 2, z: targetZ }}
            animate={{
                scale: isGhost ? 0.95 : 1,
                opacity: isGhost ? 0.4 : 1,
                x: targetX + bumpOffset.x,
                y: size / 2,
                z: targetZ + bumpOffset.z
            }}
            exit={{ scale: 0 }}
            castShadow
            receiveShadow
            transition={{
                duration: 0.3,
                type: "spring",
                ...springConfig,
                delay: spawnDelay
            }}
        >
            <boxGeometry args={[size, size, size]} />
            <meshStandardMaterial
                color={color}
                roughness={0.2}
                metalness={0.1}
                transparent
                opacity={isGhost ? 0.5 : 1}
            />
        </motion.mesh>
    );
};