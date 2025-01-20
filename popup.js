// UI要素
const summarizeButton = document.getElementById('summarize');
const statusElement = document.getElementById('status');
const loadingElement = document.getElementById('loading');
const summaryElement = document.getElementById('summary');
const errorElement = document.getElementById('error');
const apiKeySection = document.getElementById('api-key-section');
const mainSection = document.getElementById('main-section');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyButton = document.getElementById('save-api-key');
const showSettingsButton = document.getElementById('show-settings');

// APIキーの保存
async function saveApiKey(apiKey) {
  await chrome.storage.local.set({ 'openai_api_key': apiKey });
}

// APIキーの取得
async function getApiKey() {
  const result = await chrome.storage.local.get(['openai_api_key']);
  return result.openai_api_key;
}

// APIキー設定画面の表示
function showApiKeySection() {
  apiKeySection.classList.remove('hidden');
  mainSection.classList.add('hidden');
}

// メイン画面の表示
function showMainSection() {
  apiKeySection.classList.add('hidden');
  mainSection.classList.remove('hidden');
}

// 現在のタブが有効なウェブページかどうかを確認
async function checkValidTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isValidUrl = tab.url && (
    tab.url.startsWith('http://') || 
    tab.url.startsWith('https://')
  );
  
  summarizeButton.disabled = !isValidUrl;
  statusElement.textContent = isValidUrl 
    ? '要約する準備ができました'
    : 'ウェブページを開いてください';
  
  return { isValidUrl, tab };
}

// エラーを表示
function showError(message) {
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  loadingElement.style.display = 'none';
  summaryElement.style.display = 'none';
}

// 要約を表示
function showSummary(summary) {
  summaryElement.textContent = summary;
  summaryElement.style.display = 'block';
  loadingElement.style.display = 'none';
  errorElement.style.display = 'none';
}

// ローディング状態を表示
function showLoading() {
  loadingElement.style.display = 'block';
  summaryElement.style.display = 'none';
  errorElement.style.display = 'none';
  summarizeButton.disabled = true;
}

// 要約を実行
async function summarize(tab) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      showApiKeySection();
      throw new Error('APIキーが設定されていません');
    }

    showLoading();

    // content.jsからページ情報を取得
    const pageContent = await chrome.tabs.sendMessage(tab.id, { action: "getPageContent" });
    
    // background.jsで要約を生成
    const response = await chrome.runtime.sendMessage({
      action: "summarize",
      pageContent,
      apiKey
    });

    if (!response.success) {
      throw new Error(response.error || '要約の生成に失敗しました');
    }

    showSummary(response.summary);
  } catch (error) {
    showError(error.message);
  } finally {
    summarizeButton.disabled = false;
  }
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      showApiKeySection();
      return;
    }

    const { isValidUrl, tab } = await checkValidTab();
    if (isValidUrl) {
      summarizeButton.addEventListener('click', () => summarize(tab));
    }
  } catch (error) {
    showError('エラーが発生しました: ' + error.message);
  }
});

// APIキー保存ボタンのイベントリスナー
saveApiKeyButton.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    showError('APIキーを入力してください');
    return;
  }

  if (!apiKey.startsWith('sk-')) {
    showError('無効なAPIキーです');
    return;
  }

  await saveApiKey(apiKey);
  showMainSection();
  const { isValidUrl, tab } = await checkValidTab();
  if (isValidUrl) {
    summarizeButton.addEventListener('click', () => summarize(tab));
  }
});

// 設定表示ボタンのイベントリスナー
showSettingsButton.addEventListener('click', () => {
  showApiKeySection();
});
