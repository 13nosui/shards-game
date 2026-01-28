import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Environment } from '@react-three/drei';
import { ReactiveGrid } from './ReactiveGrid';
import { Block3D } from './Block3D';
import type { GridState, BigBlock } from '../../types/game';
import { AnimatePresence } from 'framer-motion';

interface GameSceneProps {
    smallBlocks: GridState;
    bigBlocks: BigBlock[];
    onBlockClick: (x: number, y: number) => void;
}

export const GameScene = ({ smallBlocks, bigBlocks, onBlockClick }: GameSceneProps) => {
    return (
        <div style={{ width: 'min(90vw, 500px)', height: 'min(90vw, 500px)', position: 'relative' }}>
            <Canvas shadows dpr={[1, 2]}>
                <OrthographicCamera
                    makeDefault
                    position={[0, 0, 10]}
                    zoom={50}
                />

                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />

                <ReactiveGrid onPointerDown={onBlockClick} />

                <AnimatePresence>
                    {/* Small Blocks */}
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

                    {/* Big Blocks */}
                    {bigBlocks.map((block) => (
                        <Block3D
                            key={block.id}
                            x={block.x}
                            y={block.y}
                            type="big"
                            color={block.color}
                            onClick={() => onBlockClick(block.x, block.y)}
                        />
                    ))}
                </AnimatePresence>

                <Environment preset="city" />
            </Canvas>
        </div>
    );
};
