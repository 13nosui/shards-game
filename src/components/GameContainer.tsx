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
        score
    } = useGameLogic();

    const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);

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

        if (Math.max(absX, absY) > 30) {
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
            className="flex flex-col items-center justify-center p-0 gap-8 select-none w-[95vw] max-w-[600px] mx-auto relative text-center touch-none h-[100dvh] overflow-hidden overscroll-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header Area */}
            {/* 修正: Androidでの被りを防ぐため、safe-areaに加え、固定で少し余白(mt-4など)を持たせる */}
            <div className="absolute top-0 left-4 right-4 z-10 pointer-events-none pt-[max(20px,env(safe-area-inset-top))]">
                <div className="relative flex items-start justify-center w-full">

                    <button
                        onClick={onBack}
                        className="absolute left-0 pointer-events-auto p-3 bg-[var(--gray-3)] rounded-full hover:bg-[var(--gray-4)] transition-colors text-[var(--gray-12)]"
                    >
                        <Home size={24} />
                    </button>

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
            {/* 修正: 120%拡大などの余計なスタイルを削除し、標準サイズに戻す */}
            <div className="w-full aspect-square max-w-[500px] relative z-0">
                <GameScene
                    smallBlocks={smallBlocks}
                    nextSpawnPos={nextSpawnPos}
                    nextSpawnColors={nextSpawnColors}
                    bumpEvent={bumpEvent}
                />
            </div>

            {/* ▼▼▼ 追加: Score Display (盤面下・中央) ▼▼▼ */}
            <div className="relative z-10 pointer-events-none -mt-4">
                <div className="flex flex-col items-center">
                    <div className="text-xs font-bold font-mono uppercase tracking-[0.2em] text-[var(--gray-12)] opacity-60 mb-1">
                        SCORE
                    </div>
                    <div className="font-bungee text-3xl text-[var(--gray-12)] bg-[var(--gray-3)]/80 px-6 py-2 rounded-lg border border-[var(--gray-12)]/10 shadow-sm backdrop-blur-sm transition-all">
                        {score.toString().padStart(6, '0')}
                    </div>
                </div>
            </div>
            {/* ▲▲▲ 追加ここまで ▲▲▲ */}

            {/* Game Over Overlay */}
            <AnimatePresence>
                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 text-white"
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