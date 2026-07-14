# yakudoc-packs

[![validate](https://github.com/daiki-moritake/yakudoc-packs/actions/workflows/validate.yml/badge.svg)](https://github.com/daiki-moritake/yakudoc-packs/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[yakudoc](https://github.com/daiki-moritake/yakudoc) のコミュニティ翻訳パック置き場です。

依存ライブラリの JSDoc(型定義に書かれた英語ドキュメント)の翻訳を、パッケージ単位・言語単位で共有します。ここに翻訳パックが登録されると、世界中の `yakudoc add <パッケージ名>` に訳文が**自動で適用**されます。

**一度誰かが訳せば、みんなが `add` 一発で母語のホバーを得られる**——これが yakudoc-packs の目的です。

## 使う側

yakudoc を入れているだけで、ここのパックは自動的に使われます。

```bash
npx yakudoc add zod
# → yakudoc-packs に zod のパックがあれば、訳文まで入った状態で追加される
```

取得元(レジストリ)はこのリポジトリの `main` ブランチです。差し替えたい場合は `--registry` / 環境変数 `YAKUDOC_REGISTRY` / `.yakudoc/config.json` の `registry` で指定できます。

## ディレクトリ構造

```text
packs/
  <言語コード>/
    <パッケージ名>.json
```

- 言語コードは `ja` `en` `ko` `zh` `de` `fr` … (yakudoc の対応言語)
- パッケージ名はファイル名にそのまま使います。スコープ付き(`@types/node` など)は `/` を `__` に置換します(例: `@types__node.json`)
- 多くのパックは英語の JSDoc を各言語へ訳したものですが、原文が英語以外のパッケージ(yakudoc 自身など)もあります。その場合は `packs/en/` に英訳を置けます(原文=日本語なので `packs/ja/` は不要)

例:

```text
packs/
  ja/
    nanoid.json
    zustand.json
    immer.json
  ko/
    nanoid.json
```

## パックのファイル形式

`yakudoc export <パッケージ名>` が出力するファイルをそのまま置きます。

```json
{
  "name": "nanoid",
  "version": "5.1.16",
  "lang": "ja",
  "generator": "yakudoc@0.2.0",
  "entries": {
    "a1b2c3d4": {
      "original": "Generate secure URL-friendly unique ID.",
      "translated": "安全で URL に使える一意な ID を生成します。",
      "symbol": "nanoid/index.d.ts#nanoid",
      "lang": "ja"
    }
  }
}
```

- `entries` のキーは**正規化した原文のハッシュ**です。だからライブラリのバージョンが上がっても、原文が変わっていない API の訳はそのまま当たります(バージョン差に強い)
- `original` は照合には使われず(キーのハッシュで引くため)、レビュー時に「何を訳したか」を読むための参照です

## 翻訳を投稿する(コントリビュート)

歓迎します。[CONTRIBUTING.md](./CONTRIBUTING.md) に手順があります。ざっくりは:

1. 対象ライブラリを入れたプロジェクトで `npx yakudoc add <パッケージ名>` → `npx yakudoc translate`(内蔵モデル or 任意の AI)で翻訳する
2. `npx yakudoc export <パッケージ名>` でパックを書き出す
3. このリポジトリに `packs/<言語>/<パッケージ名>.json` として追加し、プルリクエストを送る

機械翻訳のパックを人が磨いていく、Wikipedia 型の運用を想定しています。「完璧な訳が揃ってから」ではなく、**まず訳を入れて、気づいた人が直す**方式です。

## ライセンス

[MIT](./LICENSE)

翻訳パックに含まれる `original`(英語原文)は各ライブラリの著作物です。それぞれのライブラリのライセンス(多くは MIT)に従います。翻訳文は本リポジトリの貢献者によるもので、MIT で提供されます。
