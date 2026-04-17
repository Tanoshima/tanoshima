# CONTRIBUTE.md

## Tech Stack

| role | library |
|------|---------|
| framework | SolidStart (SolidJS) / Vinxi |
| server runtime | Nitro (via Vinxi) → h3 |
| markdown parser | marked |
| formatter / linter | Biome |
| package manager | pnpm |
| deployment | GitHub Pages (`docs/` folder) |

---

## Commands

```sh
pnpm dev          # start dev server (localhost:3000)
pnpm build        # build static files to .output/public/
bash build.sh     # build + copy to docs/ (for GitHub Pages)
pnpm test         # run integration tests (test-dev.sh)
pnpm check        # Biome format + lint
```

---

## Directory Structure

```
.
├── content/               # Markdown source files (page content)
│   ├── readme.md          #   Top page
│   └── about_me.md        #   AboutMe page
├── src/
│   ├── app.tsx            # Root layout (sidebar + body shell)
│   ├── middleware.ts      # Server middleware
│   ├── entry-client.tsx   # Client entry point
│   ├── entry-server.tsx   # Server entry point (HTML shell)
│   ├── routes/            # File-based routing (one file = one page)
│   │   ├── index.tsx      #   /tanoshima/
│   │   └── about.tsx      #   /tanoshima/about
│   ├── components/
│   │   ├── Sidebar.tsx    #   Left navigation sidebar
│   │   └── MarkdownPage.tsx # Markdown HTML renderer + prev/next nav
│   └── styles/
│       └── main.css       # GitBook-like layout CSS
├── docs/                  # Static build output → served by GitHub Pages
├── app.config.ts          # SolidStart config (preset, baseURL)
├── biome.json             # Biome formatter/linter config
└── build.sh               # Build + copy to docs/
```

---

## Adding a New Page

1. **Add a Markdown file** to `content/`:

   ```
   content/your-page.md
   ```

2. **Create a route file** in `src/routes/`:

   ```tsx
   // src/routes/your-page.tsx
   import { marked } from "marked";
   import MarkdownPage from "~/components/MarkdownPage";
   import raw from "../../content/your-page.md?raw";

   const html = marked.parse(raw) as string;

   export default function YourPage() {
     return (
       <MarkdownPage
         title="Your Page"
         html={html}
         prev={{ href: "/about", label: "AboutMe" }}
       />
     );
   }
   ```

   The filename determines the URL: `src/routes/your-page.tsx` → `/tanoshima/your-page`

3. **Add the link to the sidebar** in `src/components/Sidebar.tsx`:

   ```tsx
   const pages = [
     { href: "/", label: "Readme" },
     { href: "/about", label: "AboutMe" },
     { href: "/your-page", label: "Your Page" }, // add this
   ];
   ```

4. **Rebuild** for GitHub Pages:

   ```sh
   bash build.sh
   ```

---

## アーキテクチャ

### リクエストの流れ (dev)

```
ブラウザ
  ↓
Vite dev server (Vinxi)
  ↓
h3 ルーター (Nitro)
  ↓ baseURL: "/tanoshima" でマウント
SolidStart SSR ハンドラー
  ↓
SolidJS Router (/tanoshima/, /tanoshima/about)
```

### Markdown のレンダリング

Markdown ファイルは Vite の `?raw` import でビルド時にテキストとして読み込まれ、`marked.parse()` で HTML に変換される。変換は静的なモジュール初期化時に1回だけ行われる（リクエストごとには実行されない）。

### GitHub Pages へのデプロイ

GitHub Pages はリポジトリ名のサブパス (`/tanoshima/`) でサイトを配信する。SolidStart の `baseURL: "/tanoshima"` はこれに対応するための設定で、以下に影響する:

- Nitro/h3 がルートを `/tanoshima/**` の名前空間でマウントする
- SolidJS Router の `base` が `/tanoshima` に設定される (`src/app.tsx`)
- 静的ビルドで出力される HTML 内のアセットパスがすべて `/tanoshima/` 以下になる

---

## 既知の問題

### 開発時に `/` で 503 が発生する

**原因**

`baseURL: "/tanoshima"` を設定すると、h3 ルーターは `/tanoshima/**` のルートしか登録しない。ブラウザで `localhost:3000/` を開くと、h3 が一致するルートを見つけられず 503 を返す。

```
Error: Cannot find any path matching /.
```

**本番環境では問題にならない理由**

GitHub Pages は `/tanoshima/` 以下を直接配信するため、ユーザーが `/` を踏むことはない。

**開発時のワークアラウンド**

`pnpm dev` 起動後は `http://localhost:3000/tanoshima/` に直接アクセスする。

**試みた解決策（いずれも機能しなかった）**

| アプローチ | 結果 | 理由 |
|-----------|------|------|
| `routeRules: { "/": { redirect: ... } }` | 503 のまま | `preset: "static"` の dev サーバーでは routeRules がリクエスト時に評価されない |
| `src/middleware.ts` (SolidStart middleware) | 503 のまま | ミドルウェアは `/tanoshima` 配下のハンドラー内で動くため、`/` は到達前に 503 になる |
| `server/plugins/` (Nitro プラグイン) | モジュール解決エラー | dev 環境では `nitropack/runtime` が Vite の SSR モジュールランナーから解決できない |
