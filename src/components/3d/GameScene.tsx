import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { ReactiveGrid } from './ReactiveGrid';
import { Block3D } from './Block3D';
import type { GridState, Point } from '../../types/game';
import { AnimatePresence } from 'framer-motion';

interface GameSceneProps {
    smallBlocks: GridState;
    nextSpawnPos: Point | null;
    nextSpawnColors: string[];
    bumpEvent: { x: number; y: number; id: number } | null;
}

export const GameScene = ({ smallBlocks, bumpEvent }: GameSceneProps) => {
    // 描画すべきブロックのリストを事前に作成（nullを除外）
    const activeBlocks = smallBlocks.flatMap((col, x) =>
        col.map((block, y) => block ? { ...block, x, y } : null)
    ).filter((b): b is NonNullable<typeof b> => b !== null);

    return (
        <div style={{
            width: '100%',
            aspectRatio: '1/1',
            position: 'relative',
            margin: '0 auto'
        }}>
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
                <PerspectiveCamera
                    makeDefault
                    position={[0, 15, 0]} // 高さを固定し、真上から見下ろす
                    fov={50}
                    onUpdate={(c) => c.lookAt(0, 0, 0)} // 常に中心を見る
                />

                <ambientLight intensity={1.5} color="#ffffff" />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.0}
                    color="#ffffff"
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ffffff" />

                <ReactiveGrid />

                {/* ブロックの描画 */}
                <AnimatePresence>
                    {activeBlocks.map((block) => (
                        <Block3D
                            key={block.id}
                            x={block.x}
                            y={block.y}
                            type="small"
                            color={block.color}
                            bumpEvent={bumpEvent}
                        />
                    ))}
                </AnimatePresence>
            </Canvas>
        </div>
    );
};