import { motion } from 'framer-motion-3d';
import { GRID_SIZE } from '../../utils/gameUtils';

interface Block3DProps {
    x: number;
    y: number;
    type: 'big' | 'small';
    color: string;
    onClick?: () => void;
}

export const Block3D = ({ x, y, type, color, onClick }: Block3DProps) => {
    const isBig = type === 'big';

    // Map grid coords to world coords (-5 to 5 space)
    const worldX = (x / GRID_SIZE) * 10 - 4; // Shifted slightly for centers
    const worldY = (1.0 - y / GRID_SIZE) * 10 - 6;

    const size = isBig ? 3.8 : 1.8;
    const targetX = isBig ? worldX + 1 : worldX;
    const targetY = isBig ? worldY - 1 : worldY;

    const springConfig = {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 1
    };

    return (
        <motion.group
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                x: targetX,
                y: targetY,
                z: isBig ? 0.2 : 0.1
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springConfig}
            onPointerDown={(e: any) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            <mesh>
                <boxGeometry args={[size, size, isBig ? 0.4 : 0.2]} />
                <meshStandardMaterial
                    color={color}
                    flatShading={true}
                    roughness={0.8}
                    metalness={0}
                    transparent
                    opacity={0.9}
                />
            </mesh>
        </motion.group>
    );
};
