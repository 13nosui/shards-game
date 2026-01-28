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

    return (
        <motion.div
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
                "relative flex items-center justify-center cursor-pointer select-none rounded-md",
                "w-full h-full",
                "shadow-sm"
            )}
            style={{
                backgroundColor: color,
            }}
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
        >
            {/* Inner Detail */}
            <div className="absolute inset-0 border-2 border-white/20 rounded-md" />

            {isBig && (
                <div className="absolute inset-2 border border-black/10 rounded-sm" />
            )}
        </motion.div>
    );
};