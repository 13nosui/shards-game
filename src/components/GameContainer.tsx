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
        score,
        highScore,
        isNewRecord,
        gameOver,
        isProcessing,
        resetGame,
        nextSpawnColors,
        nextSpawnPos,
        bumpEvent,
        comboCount
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
            {/* Header Area */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                <button
                    onClick={onBack}
                    className="p-2 bg-white/10 backdrop-blur-md rounded-full text-text-primary opacity-70 hover:opacity-100 transition-opacity"
                >
                    <Home size={24} />
                </button>

                <div className="flex flex-col items-end">
                    <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-1">NEXT</div>
                    <div className="grid grid-cols-2 gap-0.5 p-1 bg-white/5 rounded-sm border border-white/10">
                        {nextSpawnColors.map((color, i) => (
                            <div
                                key={i}
                                className="w-3 h-3 rounded-[1px]"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Score & Combo */}
            <div className="flex flex-col items-center gap-1 z-10 mt-12">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-30">SCORE</div>
                <motion.div
                    key={score}
                    initial={{ scale: 1.1, color: '#fff' }}
                    animate={{ scale: 1, color: 'var(--text-primary)' }}
                    className="text-5xl font-bungee"
                >
                    {score.toString().padStart(6, '0')}
                </motion.div>

                <AnimatePresence>
                    {comboCount > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm font-bungee text-[#FF595E] absolute top-28"
                        >
                            {comboCount} CHAIN!
                        </motion.div>
                    )}
                </AnimatePresence>
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

            {/* Footer Info */}
            <div className="absolute bottom-8 flex flex-col items-center gap-1 opacity-30 z-10">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em]">BEST</div>
                <div className="text-sm font-bungee">
                    {Math.max(score, highScore).toString().padStart(6, '0')}
                </div>
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