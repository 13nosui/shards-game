import { useEffect, useState } from 'react';
import { GameContainer } from './components/GameContainer';
import { HomeScreen } from './components/HomeScreen';
import { initializeAdMob, showBanner } from './utils/admob';
import { useBGM } from './hooks/useBGM';
import { setSoundEnabled } from './utils/sounds'; // 追加
import './index.css';

function App() {
  const [isNative, setIsNative] = useState(false);
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [highScore, setHighScore] = useState(0);

  // サウンド設定（初期値はローカルストレージから取得、なければON）
  const [isSoundOn, setIsSoundOn] = useState(() => {
    const saved = localStorage.getItem('sound-enabled');
    return saved !== null ? saved === 'true' : true;
  });

  // BGMフック
  const { play, stop } = useBGM('/sounds/bgm.mp3');

  // isSoundOn が変わったら BGM と SE の状態を更新
  useEffect(() => {
    // 1. SEの設定を更新
    setSoundEnabled(isSoundOn);
    // 2. 設定を保存
    localStorage.setItem('sound-enabled', String(isSoundOn));

    // 3. BGMの制御
    if (!isSoundOn) {
      stop(); // OFFなら止める
    } else if (screen === 'game') {
      play(); // ONで、かつゲーム中なら再生する
    }
  }, [isSoundOn, screen, play, stop]);

  useEffect(() => {
    const loadHighScore = () => {
      try {
        const saved = localStorage.getItem('quod-records');
        if (saved) {
          const records = JSON.parse(saved);
          if (Array.isArray(records) && records.length > 0) {
            setHighScore(records[0].score);
          }
        }
      } catch (e) {
        console.error('Failed to load records:', e);
      }
    };
    loadHighScore();
  }, [screen]);

  useEffect(() => {
    const initAds = async () => {
      if (window.Capacitor) {
        setIsNative(true);
        await initializeAdMob();
        await showBanner();
      }
    };
    initAds();
  }, []);

  const toggleSound = () => setIsSoundOn(prev => !prev);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      paddingBottom: isNative ? '60px' : '0px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {screen === 'home' ? (
        <HomeScreen
          onStart={() => {
            if (isSoundOn) play(); // ゲーム開始時、設定がONなら再生
            setScreen('game');
          }}
          bestScore={highScore}
          isSoundOn={isSoundOn}     // 変更
          toggleSound={toggleSound} // 変更
        />
      ) : (
        <GameContainer onBack={() => {
          stop();
          setScreen('home');
        }} />
      )}
    </div>
  );
}

declare global {
  interface Window {
    Capacitor: any;
  }
}

export default App;