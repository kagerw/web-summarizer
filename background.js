// OpenAI APIを使用して要約を生成する関数
async function generateSummary(videoInfo, apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "あなたはYouTube動画の内容を簡潔に要約するアシスタントです。"
                    },
                    {
                        role: "user",
                        content: `以下の動画の内容を3つのポイントで要約してください：\n\nタイトル：${videoInfo.title}\n\n説明：${videoInfo.description}`
                    }
                ],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
    }
}

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarize") {
        generateSummary(request.videoInfo, request.apiKey)
            .then(summary => {
                sendResponse({ success: true, summary });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true; // 非同期レスポンスのために必要
    }
});
