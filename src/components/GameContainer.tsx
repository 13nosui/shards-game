import { useEffect, useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameScene } from './3d/GameScene';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameContainerProps {
    onBack: () => void;
}

export const GameContainer = ({ onBack }: GameContainerProps) => {
    // ロジックフックを使用
    const {
        smallBlocks,
        slide,
        isNewRecord,
        gameOver,
        isProcessing,
        resetGame,
        nextSpawnColors,
        nextSpawnPos,
        bumpEvent,
        score // Keep score for the Game Over overlay
    } = useGameLogic();

    const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);

    // キーボード操作のリスナー
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver || isProcessing) return;
            switch (e.key) {
                case 'ArrowUp': slide('UP'); break;
                case 'ArrowDown': slide('DOWN'); break;
                case 'ArrowLeft': slide('LEFT'); break;
                case 'ArrowRight': slide('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slide, gameOver, isProcessing]);

    // ベストスコア更新時の紙吹雪エフェクト
    useEffect(() => {
        if (gameOver && isNewRecord) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FF595E', '#1982C4', '#FFCA3A', '#8AC926']
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FF595E', '#1982C4', '#FFCA3A', '#8AC926']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [gameOver, isNewRecord]);

    // タッチ操作ハンドラ
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) > 30) { // スワイプ判定の閾値
            if (absX > absY) {
                slide(deltaX > 0 ? 'RIGHT' : 'LEFT');
            } else {
                slide(deltaY > 0 ? 'DOWN' : 'UP');
            }
        }
        setTouchStart(null);
    };

    return (
        <div
            className="flex flex-col items-center justify-center p-0 gap-8 select-none w-[95vw] max-w-[600px] mx-auto relative text-center touch-none h-[100dvh]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header Area: レイアウトを変更 */}
            <div className="absolute top-[calc(16px+env(safe-area-inset-top))] left-4 right-4 z-10 pointer-events-none">
                {/* コンテナを相対配置にして、内部で絶対配置と中央揃えを組み合わせる */}
                <div className="relative flex items-start justify-center w-full">

                    {/* HOMEボタン: 左端に絶対配置 (pointer-events-autoでクリック可能に) */}
                    <button
                        onClick={onBack}
                        className="absolute left-0 pointer-events-auto p-3 bg-[var(--gray-3)] rounded-full hover:bg-[var(--gray-4)] transition-colors text-[var(--gray-12)]"
                    >
                        <Home size={24} />
                    </button>

                    {/* NEXT表示: 中央配置 */}
                    <div className="flex flex-col items-center pointer-events-auto">
                        <div className="text-sm font-bold font-mono uppercase tracking-[0.2em] text-[var(--gray-12)] opacity-70 mb-2">
                            NEXT
                        </div>
                        <div className="grid grid-cols-2 gap-1 p-1.5 bg-[var(--gray-3)] rounded-md border border-[var(--gray-12)]/10 shadow-sm">
                            {nextSpawnColors.map((color, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-[2px] shadow-sm"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* 3D Scene Area */}
            <div className="w-full aspect-square max-w-[500px] relative z-0">
                <GameScene
                    smallBlocks={smallBlocks}
                    nextSpawnPos={nextSpawnPos}
                    nextSpawnColors={nextSpawnColors}
                    bumpEvent={bumpEvent}
                />
            </div>

            {/* Game Over Overlay */}
            <AnimatePresence>
                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 text-white"
                    >
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl font-bungee text-[#FF595E] mb-2 tracking-wider"
                        >
                            GAME<br />OVER
                        </motion.h2>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col items-center gap-2 mb-8"
                        >
                            <div className="text-xs font-mono opacity-60 tracking-widest">FINAL SCORE</div>
                            <div className="text-5xl font-bungee">{score.toString().padStart(6, '0')}</div>

                            {isNewRecord && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2 text-[#FFCA3A] font-bungee text-lg mt-2 px-4 py-1 bg-white/10 rounded-full"
                                >
                                    <Trophy size={20} /> NEW RECORD!
                                </motion.div>
                            )}
                        </motion.div>

                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onBack}
                                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-sm font-bungee tracking-wider transition-colors"
                            >
                                <Home size={18} /> HOME
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetGame}
                                className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-sm font-bungee tracking-wider transition-colors"
                            >
                                <RotateCcw size={18} /> RETRY
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};