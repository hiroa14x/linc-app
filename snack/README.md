# Expo Snack 共有用

この `snack/App.tsx` は、`linc-app` のスクリーニング動線（STEP1-4、結果、地図検索、問い合わせ文共有）を Expo Snack で動作確認するための単体版です。

## 参照元

- 現行 Snack: [https://snack.expo.dev/@hiroa14x/linc](https://snack.expo.dev/@hiroa14x/linc)
- 取得元メタデータ: [source.json](source.json)
- 2026-06-13 時点で、公開 Snack の `App.tsx` とこのリポジトリの `snack/App.tsx` は一致しています。

## 使い方

1. [https://snack.expo.dev/@hiroa14x/linc](https://snack.expo.dev/@hiroa14x/linc) を開く
2. `Blank` テンプレートを作成
3. 既存の `App.js` / `App.tsx` を、このリポジトリの [`snack/App.tsx`](App.tsx) の内容で置き換える
4. Snack 右上の `Share` でURLを発行して共有

## 補足

- Snack互換のため、以下は本体アプリと差分があります。
- `expo-router` ではなく単一ファイル内の状態遷移で画面遷移
- `nativewind` は使わず `StyleSheet` のみで構成
- API/認証/tRPC 連携は含めない（純粋にUIフロー確認用）
- 本体の設問や判定ロジックを変更した場合は、Snack 用の `snack/App.tsx` も同様に更新する必要があります。
- Snack 側に含まれるテンプレート由来の `components/AssetExample.js` と `assets/snack-icon.png` は、このアプリ動線では参照していないため GitHub には取り込んでいません。
