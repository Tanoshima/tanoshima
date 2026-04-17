# Migration Plan: Honkit → SolidStart

## 目標

https://tanoshima.github.io/tanoshima/ を維持したまま、Honkit を SolidStart (SolidJS) に完全置き換えする。

---

## 技術選定

| 項目 | 選定 | 理由 |
|------|------|------|
| フレームワーク | SolidStart (SolidJS) | 要件通り |
| Markdown パーサー | `marked` | 軽量・シンプル。unified/remark より依存が少ない |
| スタイリング | 素の CSS | ライブラリ不要。GitBook レイアウトを再現 |
| パッケージ管理 | pnpm | 高速・省ディスク |
| デプロイ | Static export → `docs/` | 現行 GitHub Pages 構成を維持 |

### 依存パッケージ（最小構成）

```
solid-js
@solidjs/start
vite
vite-plugin-solid
marked          # markdown → HTML
```

パッケージ管理は `pnpm` を使用する。`npm` / `yarn` は使わない。

---

## 現行レイアウトの把握

GitBook スタイル：

```
┌──────────────┬──────────────────────────────┐
│  .book-summary│  .book-body                  │
│  (左サイドバー)│  ┌─ .book-header (タイトル) ─┐│
│              │  │                            ││
│  - Top       │  │  .page-inner               ││
│  - AboutMe   │  │  (Markdown レンダリング)    ││
│              │  │                            ││
│              │  └────────────────────────────┘│
│              │  ← prev   next →               │
└──────────────┴──────────────────────────────┘
```

---

## ルート設計

| URL | Markdown ソース | 旧 URL |
|-----|-----------------|--------|
| `/tanoshima/` | `README.md` | `/tanoshima/` |
| `/tanoshima/about` | `src/about_me.md` | `/tanoshima/src/about_me.html` |

---

## 実装ステップ

### Step 1: 既存構成の削除・初期化

- `package.json` を SolidStart 用に書き直す（honkit 削除）
- `SUMMARY.md`, `_book/` など honkit 固有ファイルを削除
- `docs/` は最終ビルドで上書きするため、現状維持のまま進める

### Step 2: SolidStart プロジェクト構成

```
/
├── src/
│   ├── app.tsx           # root layout (sidebar + body shell)
│   ├── routes/
│   │   ├── index.tsx     # Top ページ (README.md)
│   │   └── about.tsx     # AboutMe ページ (src/about_me.md)
│   ├── components/
│   │   ├── Sidebar.tsx   # 左サイドバー（ナビゲーションリンク）
│   │   └── MarkdownPage.tsx  # Markdown → HTML レンダリング
│   └── styles/
│       └── main.css      # GitBook ライクなレイアウト CSS
├── content/
│   ├── readme.md         # Top ページ本文（旧 README.md）
│   └── about_me.md       # AboutMe 本文（旧 src/about_me.md）
├── app.config.ts         # SolidStart 設定（static, base path）
├── vite.config.ts
└── build.sh              # npx solid-start build → docs/
```

### Step 3: SolidStart 設定（static export + base path）

`app.config.ts` で以下を設定する：

```ts
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "static",
    baseURL: "/tanoshima",
  },
});
```

GitHub Pages は `/tanoshima/` 配下で配信されるため `baseURL` の設定が必須。

### Step 4: Markdown レンダリング

- `marked` で `.md` ファイルをビルド時に HTML 文字列へ変換
- `innerHTML` に渡してレンダリング（`<div innerHTML={html} />`）
- Vite の `?raw` import でマークダウンをテキストとして読み込む

```ts
import readmeRaw from "~/content/readme.md?raw";
import { marked } from "marked";
const html = marked(readmeRaw);
```

### Step 5: レイアウト実装

`app.tsx` で GitBook レイアウトを再現：

- 左サイドバー: Top / AboutMe のリンク（アクティブ状態付き）
- メインエリア: ページタイトル + Markdown コンテンツ
- ページナビゲーション: 前ページ / 次ページ矢印（Top ↔ AboutMe）
- モバイル対応: サイドバー折りたたみ

### Step 6: スタイリング

GitBook の視覚的特徴を素の CSS で再現：

- 左サイドバー固定幅 300px
- コンテンツエリア左マージン
- サイドバーのナビリンクにアクティブハイライト
- コードブロックのシンタックスハイライト（`marked` の built-in で対応）
- レスポンシブ対応（600px 以下でサイドバー非表示）

### Step 7: ビルド & デプロイ設定

`build.sh` を更新：

```sh
#!/bin/bash
pnpm build
# SolidStart の static output を docs/ に配置
```

`app.config.ts` の `outputDir` を `docs` に設定するか、ビルド後にコピーする。

GitHub Pages の設定（`tanoshima` リポジトリ）：
- Source: `main` ブランチの `docs/` フォルダ（現行と同じ）
- 変更不要

### Step 8: CLAUDE.md 更新

新しい開発コマンドを反映する。

---

## 廃止するもの

| ファイル/ディレクトリ | 理由 |
|----------------------|------|
| `SUMMARY.md` | honkit 専用 |
| `src/` (旧 honkit コンテンツ) | top/aboutme 以外削除。残す md は `content/` へ移動 |
| `_book/` | honkit ビルド成果物 |
| `.bookignore` | honkit 専用 |
| `honkit` npm パッケージ | 不要 |

---

## 実装後のディレクトリイメージ

```
/
├── content/
│   ├── readme.md
│   └── about_me.md
├── src/
│   ├── app.tsx
│   ├── routes/index.tsx
│   ├── routes/about.tsx
│   ├── components/Sidebar.tsx
│   ├── components/MarkdownPage.tsx
│   └── styles/main.css
├── docs/          # ビルド成果物（GitHub Pages）
├── app.config.ts
├── vite.config.ts
├── package.json
├── build.sh
├── CLAUDE.md
└── plan.md
```

---

## 懸念点・決定事項

- **`/tanoshima/` base path**: SolidStart の `baseURL` 設定で対応。内部リンクは全て相対パスか `useHref` を使う
- **旧 URL の互換性**: `/tanoshima/src/about_me.html` は廃止。`/tanoshima/about` に変わるが、個人サイトのため許容
- **docs/ の SPA fallback**: static preset では各ルートに `index.html` を生成するため、GitHub Pages での直リンクも動作する
