const sounds: Record<string, HTMLAudioElement> = {};
let isSoundEnabled = true; // デフォルトはON

// Preload sounds
if (typeof window !== 'undefined') {
    sounds.match = new Audio('/sounds/match.wav');
    sounds.match.volume = 0.5;
}

export const setSoundEnabled = (enabled: boolean) => {
    isSoundEnabled = enabled;
};

export const playSound = (type: 'slide' | 'break' | 'match') => {
    // 音がOFFなら何もしない
    if (!isSoundEnabled) return;

    if (type === 'match' && sounds.match) {
        // Clone node to allow overlapping sounds for combo/rapid matches
        const clone = sounds.match.cloneNode() as HTMLAudioElement;
        clone.volume = 0.5;
        clone.play().catch(e => console.warn('Audio play failed', e));
    }

    // Maintain console log for debugging
    const styles = {
        slide: 'padding: 2px; background: #333; color: #fff; font-weight: bold;',
        break: 'padding: 2px; background: #FF3B30; color: #fff; font-weight: bold;',
        match: 'padding: 2px; background: #4CD964; color: #fff; font-weight: bold;',
    };
    console.log(`%c[SOUND] ${type.toUpperCase()}`, styles[type] || '');
};