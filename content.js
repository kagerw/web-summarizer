// PDF.js の初期化
const pdfjsLib = window.pdfjsLib;
if (pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.js');
}

// PDFファイルかどうかを判定する関数
function isPDF() {
    return window.location.href.toLowerCase().endsWith('.pdf') || 
           document.contentType === 'application/pdf';
}

// PDFファイルのテキストを取得する関数
async function getPDFContent(url) {
    try {
        // PDFデータを取得
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        // PDF.jsでPDFを読み込む
        const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
        const pdf = await loadingTask.promise;
        let textContent = '';
        
        // すべてのページからテキストを抽出
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            textContent += content.items.map(item => item.str).join(' ') + '\n';
        }

        return {
            title: document.title || url.split('/').pop(),
            content: textContent.slice(0, 5000), // 長すぎる場合は切り詰める
            url: url,
            meta: {
                description: `PDF document with ${pdf.numPages} pages`,
                keywords: ''
            }
        };
    } catch (error) {
        console.error('PDF processing error:', error);
        return {
            title: document.title || url.split('/').pop(),
            content: "PDFの処理中にエラーが発生しました。",
            url: url,
            meta: {
                description: 'PDF processing error',
                keywords: ''
            }
        };
    }
}

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
        if (isPDF()) {
            // PDFの場合は非同期で処理
            getPDFContent(window.location.href).then(pdfContent => {
                if (pdfContent) {
                    sendResponse(pdfContent);
                } else {
                    sendResponse({
                        title: document.title,
                        content: "PDF processing failed",
                        url: window.location.href,
                        meta: { description: '', keywords: '' }
                    });
                }
            });
        } else {
            // 通常のウェブページの場合
            const pageContent = getMainContent();
            sendResponse(pageContent);
        }
        return true; // 非同期レスポンスのために必要
    }
});
