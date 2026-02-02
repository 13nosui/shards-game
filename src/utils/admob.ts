import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import type { BannerAdOptions } from '@capacitor-community/admob';

export async function initializeAdMob() {
    try {
        // AdMobの初期化
        await AdMob.initialize({
            initializeForTesting: true, // テストモード
        });

        // iOSでトラッキング許可ダイアログを出す
        if (window.Capacitor) {
            await AdMob.requestTrackingAuthorization();
        }
        console.log('AdMob initialized');
    } catch (e) {
        console.error('AdMob init failed', e);
    }
}

export async function showBanner() {
    const options: BannerAdOptions = {
        // iOS用のテストバナーID (リリース時に本番IDに書き換えます)
        adId: 'ca-app-pub-3940256099942544/2934735716',
        adSize: BannerAdSize.ADAPTIVE_BANNER, // 画面幅に合わせる
        position: BannerAdPosition.BOTTOM_CENTER, // 下部中央
        margin: 0,
        isTesting: true,
    };

    try {
        await AdMob.showBanner(options);
    } catch (e) {
        console.error('Show banner failed', e);
    }
}

// 課金後に広告を消すための関数
export async function hideBanner() {
    try {
        await AdMob.hideBanner();
        await AdMob.removeBanner();
    } catch (e) {
        console.error(e);
    }
}