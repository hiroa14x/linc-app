# Expo Snack 共有用

この `snack/App.tsx` は、`linc-app` のスクリーニング動線（STEP1-5、結果、地図検索、問い合わせ文共有）を Expo Snack で動作確認するための単体版です。

## 使い方

1. [https://snack.expo.dev](https://snack.expo.dev) を開く
2. `Blank` テンプレートを作成
3. 既存の `App.js` / `App.tsx` を、このリポジトリの [`snack/App.tsx`](App.tsx) の内容で置き換える
4. Snack 右上の `Share` でURLを発行して共有

## 補足

- Snack互換のため、以下は本体アプリと差分があります。
- `expo-router` ではなく単一ファイル内の状態遷移で画面遷移
- `nativewind` は使わず `StyleSheet` のみで構成
- API/認証/tRPC 連携は含めない（純粋にUIフロー確認用）
- 本体の設問や判定ロジックを変更した場合は、`npm run sync:snack` で Snack 用のデータと判定関数を同期できます。
- 画面構成や導線を変更した場合は、Snack側の画面も同様に更新する必要があります。
