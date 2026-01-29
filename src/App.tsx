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
        nextSpawnColors={game.nextSpawnColors}
        nextSpawnPos={game.nextSpawnPos}
        bumpEvent={game.bumpEvent}
      />

      <AnimatePresence>
        {game.gameOver && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center bg-white/90 backdrop-blur-md rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] pt-10 pb-12 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <h2 className="text-4xl md:text-5xl font-mono font-bold tracking-[0.3em] text-black uppercase text-center">
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
