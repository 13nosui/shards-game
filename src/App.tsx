import { GameContainer } from './components/GameContainer'
import { useGameLogic } from './hooks/useGameLogic'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const game = useGameLogic();

  return (
    <main className="relative w-full min-h-screen bg-white text-black overflow-hidden font-sans flex flex-col items-center justify-center">
      <GameContainer
        smallBlocks={game.smallBlocks}
        slide={game.slide}
        score={game.score}
        gameOver={game.gameOver}
        isProcessing={game.isProcessing}
      />

      <AnimatePresence>
        {game.gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <h2 className="text-6xl md:text-8xl font-mono font-bold tracking-[0.3em] text-black uppercase text-center">
                Game Over
              </h2>

              <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-mono text-black/40 uppercase tracking-widest">Final Score</div>
                <div className="text-4xl font-mono text-black font-light">
                  {game.score.toString().padStart(6, '0')}
                </div>
              </div>

              <button
                onClick={game.resetGame}
                className="mt-4 px-12 py-4 bg-black text-white font-mono text-sm uppercase tracking-[0.2em] hover:bg-black/90 active:scale-95 transition-all outline-none"
              >
                Retry
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default App
