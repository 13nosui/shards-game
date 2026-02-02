import { useEffect } from 'react';
import { GameContainer } from './components/GameContainer';
import { ThemeProvider } from './context/ThemeContext';
// ▼ 追加: AdMobの関数をインポート
import { initializeAdMob, showBanner } from './utils/admob';
import './index.css';

function App() {
  // ▼ 追加: 起動時にAdMob初期化＆バナー表示
  useEffect(() => {
    const initAds = async () => {
      // ネイティブアプリ（スマホ）で動いているか判定
      // Capacitor環境下でのみ実行する
      if (window.Capacitor) {
        await initializeAdMob();
        await showBanner();
      }
    };
    initAds();
  }, []);

  return (
    <ThemeProvider>
      <GameContainer onBack={() => { }} />
    </ThemeProvider>
  );
}

// TypeScriptのエラー回避用（window.Capacitorの型定義）
declare global {
  interface Window {
    Capacitor: any;
  }
}

export default App;