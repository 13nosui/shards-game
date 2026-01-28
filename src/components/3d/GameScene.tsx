import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { ReactiveGrid } from './ReactiveGrid';
import { Block3D } from './Block3D';
import type { GridState } from '../../types/game';
import { AnimatePresence } from 'framer-motion';

interface GameSceneProps {
    smallBlocks: GridState;
}

export const GameScene = ({ smallBlocks }: GameSceneProps) => {
    return (
        <div style={{ width: 'min(90vw, 500px)', height: 'min(90vw, 500px)', position: 'relative' }}>
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera
                    makeDefault
                    position={[0, 7, 0]}
                    up={[0, 0, -1]}
                    fov={50}
                    onUpdate={(c) => c.lookAt(0, 0, 0)}
                />

                <ambientLight intensity={0.8} />
                <directionalLight
                    position={[-5, 10, -5]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-3, 4, -3]} intensity={1.0} color="white" />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />

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
                                />
                            );
                        })
                    )}
                </AnimatePresence>

                <Environment preset="city" />
            </Canvas>
        </div>
    );
};
