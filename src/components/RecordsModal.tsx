import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, ChevronLeft, Calendar } from 'lucide-react';
import type { GameRecord } from '../types/game';
import { Grid } from './Grid';
import { IconButton } from '@radix-ui/themes';

interface RecordsModalProps {
    records: GameRecord[];
}

export const RecordsModal = ({ records }: RecordsModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<GameRecord | null>(null);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    };

    return (
        <>
            <IconButton
                variant="soft"
                color="amber"
                highContrast
                onClick={() => setIsOpen(true)}
                size="3"
                className="cursor-pointer hover:scale-105 transition-transform"
            >
                <Trophy size={20} />
            </IconButton>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[var(--color-background)] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-[var(--gray-5)] flex flex-col max-h-[80vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-[var(--gray-5)] flex items-center justify-between">
                                {selectedRecord ? (
                                    <button
                                        onClick={() => setSelectedRecord(null)}
                                        className="flex items-center gap-2 text-[var(--gray-11)] hover:text-[var(--gray-12)] transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                        <span className="font-bungee text-sm">BACK</span>
                                    </button>
                                ) : (
                                    <h2 className="text-2xl font-bungee tracking-wider flex items-center gap-3">
                                        <Trophy className="text-amber-500" size={24} />
                                        RECORDS
                                    </h2>
                                )}
                                <button onClick={() => { setIsOpen(false); setSelectedRecord(null); }} className="p-2 hover:bg-[var(--gray-3)] rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {selectedRecord ? (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">FINAL SCORE</div>
                                            <div className="text-4xl font-bungee">{selectedRecord.score.toString().padStart(6, '0')}</div>
                                            <div className="text-[10px] font-mono opacity-40 mt-1">{formatDate(selectedRecord.date)}</div>
                                        </div>

                                        <div className="scale-90 md:scale-100 origin-center bg-white/5 p-4 rounded-2xl border border-white/10 shadow-inner">
                                            <Grid smallBlocks={selectedRecord.grid} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {records.length === 0 ? (
                                            <div className="py-12 text-center text-[var(--gray-10)] font-mono text-sm uppercase tracking-widest">
                                                No records yet
                                            </div>
                                        ) : (
                                            records.map((record, index) => (
                                                <motion.button
                                                    key={record.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={() => setSelectedRecord(record)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--gray-3)] transition-all group active:scale-[0.98]"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-[var(--gray-4)] flex items-center justify-center font-bungee text-sm text-[var(--gray-11)] group-hover:bg-amber-500/10 group-hover:text-amber-600 transition-colors">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="text-lg font-bungee tracking-tight">{record.score.toLocaleString()}</div>
                                                        <div className="text-[10px] font-mono opacity-40 uppercase tracking-tighter flex items-center gap-1">
                                                            <Calendar size={10} /> {formatDate(record.date)}
                                                        </div>
                                                    </div>
                                                    <ChevronLeft className="rotate-180 opacity-0 group-hover:opacity-100 transition-all text-amber-500" size={16} />
                                                </motion.button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
