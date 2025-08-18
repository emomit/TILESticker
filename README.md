TILESticker
==========

### 概要
ブラウザで使えるシンプルなClaymorphismデザインのタスク管理アプリです。PC/モバイル対応。ToDo、メモ、リンク、リスト、日付の5種類のカードを管理し、検索・フィルター・ソート機能を備えます。
<img width="1906" height="977" alt="Screenshot 2025-08-17 at 23 58 53" src="https://github.com/user-attachments/assets/4ea72949-a6b7-43bf-83e1-95cdca9d54b2" />

### 制作背景
日々のメモや予定、お気に入りのサイトなど、保存したい情報は多岐にわたります。
それらを別々のアプリで管理すると散らばってしまい、探す手間や整理の負担が大きくなっていました。
そこで、
- 情報を 一括で管理できること
- カードを 色分けして直感的に整理できること
- URLを経由して、ショートカットのように 素早くメモを追加できること
この3点を満たすアプリが必要だと考え、本アプリを制作しました。

### 主な機能
- カード管理（ToDo、メモ、リンク、リスト、日付）
- 検索・フィルター（全文検索、タグ検索、種類別フィルター）
- スムーズなカードの移動アニメーション
- 永続化（IndexedDB、PWA対応）
- クラウド同期（Supabase）
- URLスキーム（外部からのカード作成）

### デモ・動画
- [TILESticker デモ](https://tile-sticker.vercel.app)
- [PC版](https://youtu.be/EsW8mm1dV7c)
- [モバイル版](https://youtube.com/shorts/lU73chz4nxE?feature=share)
- [URLスキーム](https://youtu.be/q5rVhi35uqs)

### 動作環境
- Node.js 18 以上（推奨 20）
- pnpm

### セットアップ

#### 1. 依存関係のインストール
```bash
pnpm i
```

#### 2. Supabase設定（オプション）
クラウド同期機能を使用する場合：

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで`supabase.sql`を実行してセキュリティ設定を適用
3. 環境変数を設定：
```bash
cp env.example .env.local
```
`.env.local`ファイルを編集してSupabaseの設定を追加：
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 3. Vercelデプロイ（本番環境）
1. Vercelに本リポジトリをインポート
2. プロジェクト設定 → Environment Variables に以下を追加
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Build/Output 設定（デフォルトでOK）
   - Framework Preset: Vite
   - Install Command: `pnpm install`
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
4. Supabase側のAuth設定でサイトURLを許可（Dashboard → Authentication → URL Configuration）
   - Site URL: デプロイURL（例: https://your-app.vercel.app）
   - 追加のリダイレクトURLが必要な場合は同画面で追加入力

**セキュリティ機能：**
- RLS（Row Level Security）によるユーザー分離
- 入力検証と長さ制限
- ソフトデリート機能
- 自動updated_at更新
- 監査ログ（オプション）

#### 4. 開発サーバ起動
```bash
pnpm dev
```

### 検証/ビルド
```bash
pnpm test
pnpm build
```

### 操作方法
- +ボタン カードを追加
- 検索ボタン タグや文章を単語検索
- メニューボタン カードのフィルターや並び替え

### ショートカット
- ⌘(Ctrl)F: 検索
- ⌘(Ctrl)+クリック: カード削除
- D: 全削除（デバッグ用）
- ESC: モーダル閉じる

### URLスキーム
URLパラメータを使って外部からカードを作成できます。ブックマークやショートカットアプリとの連携に便利です。
例:
- /?make_todo_name=洗車&make_todo_name=本棚整理&make_todo_name=ゴミ出し&tags=家事
- /?make_link_name=GitHub&link=https://github.com&tags=開発
- /?make_list_name=旅行持ち物&list=パスポート,財布,カメラ,充電器&tags=旅行
- これを利用したiOS用カード追加ショートカットがあります。[リンクはこちら](https://www.icloud.com/shortcuts/6bd8d5ec6e464ccc93b8c6abd0b9e07c)

#### パラメータ一覧
| パラメータ | 説明 | 例 |
|-----------|------|-----|
| `make_todo_name` | ToDoのタイトル | `買い物に行く` |
| `make_memo_name` | メモのタイトル | `会議メモ` |
| `memo` | メモの内容 | `明日の会議の議題` |
| `make_link_name` | リンクのタイトル | `Google` |
| `link` | リンクのURL | `https://google.com` |
| `make_list_name` | リストのタイトル | `買い物リスト` |
| `list` | リスト項目（カンマ区切り） | `りんご,バナナ,牛乳` |
| `make_date_name` | 日付のタイトル | `誕生日` |
| `date` | 日付（YYYY-MM-DD） | `2024-12-25` |
| `date_note` | 日付のメモ | `プレゼント準備` |
| `tags` | タグ（カンマ区切り） | `重要,緊急` |

### 技術スタック
- React 18 + TypeScript
- Vite
- Zustand（状態管理）
- Dexie（IndexedDB）
- Supabase（クラウド同期）
- Framer Motion（アニメーション）
- Tailwind CSS + Claymorphism
- Tabler Icons

### ライセンス
MIT License

