import { useState, useEffect, useRef } from 'react';

export const useBGM = (url: string) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.3; // Default volume
        audioRef.current = audio;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [url]);

    const toggleBGM = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => {
                console.log("Playback failed (waiting for interaction):", e);
            });
            setIsPlaying(true);
        }
    };

    return { isPlaying, toggleBGM };
};
