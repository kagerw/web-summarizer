# Web Content Summarizer Chrome Extension

ウェブページの内容を要約・分析するChrome拡張機能です。Google Gemini Proを活用して、ウェブページやPDFファイルの主要なポイントを3-5個にまとめて表示します。

## 主な機能

- ウェブページの内容を自動的に要約
- PDFファイルのサポート
- Google Gemini Proによる高度な分析
- シンプルで使いやすいインターフェース
- APIキー管理機能

## インストール方法

1. このリポジトリをクローンまたはダウンロード
2. Chrome拡張機能の管理ページ（`chrome://extensions/`）を開く
3. 右上の「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」をクリックし、ダウンロードしたフォルダを選択

## 使用方法

1. 拡張機能をインストール後、Chrome右上の拡張機能アイコンをクリック
2. 初回使用時にGoogle Cloud APIキーを設定
   - [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
   - Gemini APIを有効化
   - APIキーを作成して拡張機能の設定画面に入力
3. 要約したいウェブページやPDFファイルを開く
4. 拡張機能のポップアップで「要約する」ボタンをクリック
5. 数秒後に要約が表示されます

## 技術仕様

- **コンテンツ抽出**
  - ウェブページの主要なコンテンツを自動検出
  - PDFファイルのテキスト抽出にPDF.jsを使用
  - メタデータ（タイトル、説明、キーワード）も取得

- **要約生成**
  - Google Gemini Pro APIを使用
  - 最大800トークンの要約を生成
  - 日本語でわかりやすく整理された要約を提供

- **セキュリティ**
  - APIキーはローカルストレージに安全に保存
  - HTTPS通信のみをサポート
  - 必要最小限の権限要求

## 必要な権限

- `activeTab`: 現在のタブの内容にアクセス
- `scripting`: ページ内でスクリプトを実行
- `storage`: APIキーの保存
- `tabs`: タブ情報の取得
- `webRequest`: Google Cloud APIとの通信

## 開発者向け情報

### ファイル構成

- `manifest.json`: 拡張機能の設定ファイル
- `popup.html/js`: ユーザーインターフェース
- `content.js`: ページコンテンツの抽出
- `background.js`: Google Gemini APIとの通信
- `pdf.js/worker.js`: PDF処理ライブラリ
- `pdf_viewer.css`: PDFビューアーのスタイル

### ビルドと開発

1. 依存パッケージのインストール:
```bash
npm install
```

2. 開発時の変更監視:
```bash
npm run watch
```

3. プロダクションビルド:
```bash
npm run build
```

## 制限事項

- Google Cloud APIキーが必要
- テキストは最大5000文字まで処理可能
- PDFファイルは一般的なテキスト形式のみサポート
- ウェブページによってはコンテンツ抽出の精度が異なる場合があります

## ライセンス

MITライセンス
