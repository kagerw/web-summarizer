// YouTube動画の情報を取得する関数
async function getVideoInfo() {
    // タイトルを取得
    const title = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent || '';
    
    // 説明を取得
    const description = document.querySelector('#description-inline-expander > yt-formatted-string')?.textContent || '';
    
    // 字幕ボタンの存在確認（字幕が利用可能かどうか）
    const hasCaptions = document.querySelector('.ytp-subtitles-button')?.getAttribute('aria-pressed') === 'true';

    return {
        title,
        description,
        hasCaptions,
        url: window.location.href
    };
}

// 拡張機能からのメッセージを待ち受ける
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getVideoInfo") {
        getVideoInfo().then(videoInfo => {
            sendResponse(videoInfo);
        });
        return true; // 非同期レスポンスのために必要
    }
});

// YouTubeページの読み込みが完了したことを通知
chrome.runtime.sendMessage({ action: "pageLoaded" });
