import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { ReactiveGrid } from './ReactiveGrid';
import { Block3D } from './Block3D';
import type { GridState, Point } from '../../types/game';
import { GRID_SIZE } from '../../utils/gameUtils';
import { AnimatePresence } from 'framer-motion';

const CameraController = () => {
    const { camera, size } = useThree();

    useEffect(() => {
        const aspect = size.width / size.height;
        // Target size includes margin for animations (approx 15% padding)
        const targetSize = GRID_SIZE * 1.15;

        const fov = 50;
        const fovRad = (fov * Math.PI) / 180;

        let dist = (targetSize / 2) / Math.tan(fovRad / 2);

        if (aspect < 1) {
            dist = dist / aspect;
        }

        camera.position.set(0, dist, 0);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

    }, [camera, size]);

    return null;
};

interface GameSceneProps {
    smallBlocks: GridState;
    nextSpawnPos: Point | null;
    nextSpawnColors: string[];
    bumpEvent: { x: number; y: number; id: number } | null;
}

export const GameScene = ({ smallBlocks, nextSpawnPos, nextSpawnColors, bumpEvent }: GameSceneProps) => {
    return (
        <div style={{
            width: '100%',
            maxHeight: '70vh',
            aspectRatio: '1/1',
            position: 'relative',
            margin: '0 auto'
        }}>
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera
                    makeDefault
                    position={[0, 12, 0]}
                    up={[0, 0, -1]}
                    fov={50}
                    onUpdate={(c) => c.lookAt(0, 0, 0)}
                />

                <CameraController />

                <ambientLight intensity={1.2} color="#ffffff" />
                <directionalLight
                    position={[5, 10, 5]}
                    intensity={0.8}
                    color="#ffffff"
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-5, 5, -5]} intensity={0.4} color="#ffffff" />

                <ReactiveGrid />

                <AnimatePresence>
                    {smallBlocks.flatMap((col, x) =>
                        col.map((block, y) => {
                            if (!block) return null;
                            return (
                                <Block3D
                                    key={block.id}
                                    x={x}
                                    y={y}
                                    type="small"
                                    color={block.color}
                                    bumpEvent={bumpEvent}
                                />
                            );
                        })
                    )}

                    {nextSpawnPos && nextSpawnColors.length === 4 && (
                        <>
                            <Block3D key="ghost-0" x={nextSpawnPos.x} y={nextSpawnPos.y} type="small" color={nextSpawnColors[0]} isGhost bumpEvent={bumpEvent} />
                            <Block3D key="ghost-1" x={nextSpawnPos.x + 1} y={nextSpawnPos.y} type="small" color={nextSpawnColors[2]} isGhost bumpEvent={bumpEvent} />
                            <Block3D key="ghost-2" x={nextSpawnPos.x} y={nextSpawnPos.y + 1} type="small" color={nextSpawnColors[1]} isGhost bumpEvent={bumpEvent} />
                            <Block3D key="ghost-3" x={nextSpawnPos.x + 1} y={nextSpawnPos.y + 1} type="small" color={nextSpawnColors[3]} isGhost bumpEvent={bumpEvent} />
                        </>
                    )}
                </AnimatePresence>
            </Canvas>
        </div>
    );
};
