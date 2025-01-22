// OpenAI APIを使用してコンテンツを分析する関数
async function analyzeContent(pageContent, apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-2024-07-18",
                messages: [
                    {
                        role: "system",
                        content: "あなたはウェブページの内容を分析し、重要なポイントを抽出して整理するアシスタントです。専門的な内容も理解し、わかりやすく説明することができます。"
                    },
                    {
                        role: "user",
                        content: `以下のウェブページの内容を分析し、主要なポイントを3-5個にまとめ、簡潔に説明してください。
                        
タイトル：${pageContent.title}

メタ情報：
${pageContent.meta.description}
${pageContent.meta.keywords}

本文：
${pageContent.content}

URL: ${pageContent.url}`
                    }
                ],
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
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
