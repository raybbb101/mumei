# 無銘 (MUMEI)

記憶を失った侍が、自分の過去を追うか剣を磨くかを選んで旅する、和風ピクセルの横スクロール剣戟アクション。

## ビルド

```bash
python3 build.py
```

`src/` と `fx/` を 1 枚の `mumei.html` にまとめます。手元で確認するときは、同時に生成される `play.html` を HTTP サーバー経由で開きます。

## 構成

- `src/00-core.js` 基本処理、入力、音
- `src/10-rig.js` 3D の骨格をピクセルに描くレンダラ、衣装
- `src/15-anim.js` 動きのキーフレーム
- `src/20-world.js` 野外の背景
- `src/30-game.js` 戦闘、敵、エフェクト
- `src/35-town.js` 町
- `src/50-story.js` 物語、クエスト、ステージ
- `src/60-ui.js` 画面の文字まわり
- `src/70-main.js` 全体の進行、切り替え、保存

## クレジット

`fx/` の火花エフェクトは [pixelfx](https://github.com/patch-gg/pixelfx) (MIT) から書き出したものです。ライセンスは `fx/PIXELFX-LICENSE.txt` にあります。
