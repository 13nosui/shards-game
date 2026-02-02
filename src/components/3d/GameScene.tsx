import { useEffect, useState } from 'react'; // useStateを追加
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { ReactiveGrid } from './ReactiveGrid';
import { Block3D } from './Block3D';
import type { GridState, Point } from '../../types/game';
import { GRID_SIZE } from '../../utils/gameUtils';
import { AnimatePresence } from 'framer-motion';

// レスポンシブ対応カメラコントローラー
const ResponsiveCamera = () => {
    const { camera, size } = useThree();

    useEffect(() => {
        const margin = 1.2;
        const targetSize = GRID_SIZE + margin;
        const fov = 50;
        const fovRad = (fov * Math.PI) / 180;
        let dist = (targetSize / 2) / Math.tan(fovRad / 2);
        const aspect = size.width / size.height;

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

export const GameScene = ({ smallBlocks, bumpEvent }: GameSceneProps) => {
    const activeBlocks = smallBlocks.flatMap((col, x) =>
        col.map((block, y) => block ? { ...block, x, y } : null)
    ).filter((b): b is NonNullable<typeof b> => b !== null);

    // --- アイドルアニメーション制御 ---
    const [idleBlockId, setIdleBlockId] = useState<string | null>(null);
    const [idleType, setIdleType] = useState<'sleep' | 'yawn'>('sleep');

    useEffect(() => {
        // 盤面が変化した(ユーザーが操作した)ら、アイドル状態をリセット
        setIdleBlockId(null);

        // 3秒後にアイドルイベントを発火
        const timer = setTimeout(() => {
            if (activeBlocks.length > 0) {
                // ランダムなブロックを1つ選ぶ
                const randomBlock = activeBlocks[Math.floor(Math.random() * activeBlocks.length)];

                // 70%で睡眠、30%であくび
                const type = Math.random() > 0.3 ? 'sleep' : 'yawn';

                setIdleBlockId(randomBlock.id);
                setIdleType(type);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [smallBlocks]); // smallBlocksが変化するたびにタイマーリセット
    // -----------------------------

    return (
        <div style={{
            width: '100%',
            height: '100%',
            aspectRatio: '1/1',
            position: 'relative',
            margin: '0 auto'
        }}>
            <Canvas
                dpr={[1, 1]}
                gl={{
                    antialias: false,
                    stencil: false,
                    depth: true,
                    powerPreference: "high-performance"
                }}
            >
                <PerspectiveCamera
                    makeDefault
                    fov={50}
                />

                <ResponsiveCamera />

                <ambientLight intensity={1.5} color="#ffffff" />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.0}
                    color="#ffffff"
                />
                <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ffffff" />

                <ReactiveGrid />

                <AnimatePresence>
                    {activeBlocks.map((block) => (
                        <Block3D
                            key={block.id}
                            x={block.x}
                            y={block.y}
                            type="small"
                            color={block.color}
                            bumpEvent={bumpEvent}
                            // アイドル対象のブロックなら表情を変える
                            expression={block.id === idleBlockId ? idleType : 'normal'}
                        />
                    ))}
                </AnimatePresence>
            </Canvas>
        </div>
    );
};