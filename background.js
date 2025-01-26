// Google Gemini APIを使用してコンテンツを分析する関数
async function analyzeContent(pageContent, apiKey) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `あなたはウェブページの内容を分析し、重要なポイントを抽出して整理するアシスタントです。専門的な内容も理解し、わかりやすく説明することができます。

以下のウェブページの内容を分析し、主要なポイントを3-5個にまとめ、簡潔に説明してください。

タイトル：${pageContent.title}

メタ情報：
${pageContent.meta.description}
${pageContent.meta.keywords}

本文：
${pageContent.content}

URL: ${pageContent.url}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error analyzing content:', error);
        throw error;
    }
}

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarize") {
        analyzeContent(request.pageContent, request.apiKey)
            .then(summary => {
                sendResponse({ success: true, summary });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true; // 非同期レスポンスのために必要
    }
});
