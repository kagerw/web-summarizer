// ウェブページの主要なテキストコンテンツを取得する関数
function getMainContent() {
    // メインコンテンツを特定するための一般的なセレクタ
    const mainSelectors = [
        'main',
        'article',
        '#main-content',
        '.main-content',
        '.post-content',
        '.article-content'
    ];

    // 最も可能性の高い要素を見つける
    let mainElement = null;
    for (const selector of mainSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            mainElement = element;
            break;
        }
    }

    // メインコンテンツが見つからない場合は、body全体から不要な要素を除外して取得
    if (!mainElement) {
        mainElement = document.body.cloneNode(true);
        // ナビゲーション、ヘッダー、フッター、サイドバー、広告などを除外
        const excludeSelectors = [
            'nav', 'header', 'footer', 'aside', 
            '.nav', '.header', '.footer', '.sidebar', 
            '.ad', '.advertisement', '.menu', 
            'script', 'style', 'noscript'
        ];
        excludeSelectors.forEach(selector => {
            const elements = mainElement.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
    }

    // テキストコンテンツを抽出し、整形
    const textContent = mainElement.textContent
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000); // 長すぎる場合は切り詰める

    return {
        title: document.title,
        content: textContent,
        url: window.location.href,
        meta: {
            description: document.querySelector('meta[name="description"]')?.content || '',
            keywords: document.querySelector('meta[name="keywords"]')?.content || ''
        }
    };
}

// 拡張機能からのメッセージを待ち受ける
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageContent") {
        const pageContent = getMainContent();
        sendResponse(pageContent);
        return true; // 非同期レスポンスのために必要
    }
});
