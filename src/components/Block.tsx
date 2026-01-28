import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BlockProps {
    type: 'big' | 'small';
    color: string;
    onClick: () => void;
}

export const Block = ({ type, color, onClick }: BlockProps) => {
    const isBig = type === 'big';

    // Tactile Spring Config
    const springConfig = {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        mass: 1
    };

    return (
        <motion.div
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springConfig}
            whileHover={{
                scale: 1.05,
                transition: { type: "spring", stiffness: 600, damping: 20 }
            }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "relative flex items-center justify-center cursor-pointer select-none rounded-md",
                "w-full h-full",
                "block-shadow",
                isBig ? "z-10" : "z-0"
            )}
            style={{
                backgroundColor: color,
            }}
            onClick={onClick}
        >
            {/* Inner Detail */}
            <div className="absolute inset-0 border-2 border-white/20 rounded-md" />

            {isBig && (
                <div className="absolute inset-2 border border-black/10 rounded-sm" />
            )}
        </motion.div>
    );
};