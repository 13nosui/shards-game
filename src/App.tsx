import { GameContainer } from './components/GameContainer'
import { useGameLogic } from './hooks/useGameLogic'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { IconButton } from '@radix-ui/themes'

function App() {
  const game = useGameLogic();
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="relative w-full min-h-screen overflow-hidden font-sans flex flex-col items-center justify-center bg-[var(--color-background)] text-[var(--gray-12)]">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <IconButton
          variant="soft"
          color="gray"
          highContrast
          onClick={toggleTheme}
          size="3"
          className="cursor-pointer"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>
      </div>

      <GameContainer
        smallBlocks={game.smallBlocks}
        slide={game.slide}
        score={game.score}
        highScore={game.highScore}
        gameOver={game.gameOver}
        isProcessing={game.isProcessing}
        nextSpawnColors={game.nextSpawnColors}
        nextSpawnPos={game.nextSpawnPos}
        bumpEvent={game.bumpEvent}
        comboCount={game.comboCount}
      />

      <AnimatePresence>
        {game.gameOver && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center bg-[var(--color-background-90)] backdrop-blur-md rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] pt-10 pb-12 px-4 border-t border-[var(--gray-5)]"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <h2 className="text-4xl md:text-5xl font-bungee tracking-[0.1em] text-[var(--gray-12)] uppercase text-center">
                Game Over
              </h2>

              <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-mono text-[var(--gray-10)] uppercase tracking-widest">Final Score</div>
                <div className="text-4xl font-bungee text-[var(--gray-12)]">
                  {game.score.toString().padStart(6, '0')}
                </div>
              </div>

              <button
                onClick={game.resetGame}
                className="mt-4 px-12 py-4 bg-[var(--gray-12)] text-[var(--color-background)] font-mono text-sm uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all outline-none"
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
