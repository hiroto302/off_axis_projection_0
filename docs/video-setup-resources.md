## 📚 Video Setup 理解のための情報ソース

### 🎥 1. **MediaStream API (WebCamera)**

**MDN Web Docs - getUserMedia**
- https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getUserMedia
- カメラ・マイクへのアクセス方法の完全ガイド
- 制約条件（constraints）の設定方法

**MDN - MediaStream API**
- https://developer.mozilla.org/ja/docs/Web/API/MediaStream_API
- ストリームの仕組み全体を理解

**HTMLVideoElement**
- https://developer.mozilla.org/ja/docs/Web/API/HTMLVideoElement
- `<video>` 要素のプロパティとメソッド
- `videoWidth`, `videoHeight`, `play()` など

---

### ⚡ 2. **Promise と非同期処理**

**MDN - Promise**
- https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise
- Promise の基本概念と使い方

**MDN - Promise の使用**
- https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Using_promises
- `.then()`, `.catch()`, チェーンの解説

**async/await**
- https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function
- より読みやすい非同期コードの書き方

---

### 🤖 3. **MediaPipe (Face Tracking)**

**MediaPipe Tasks Vision API**
- https://developers.google.com/mediapipe/solutions/vision/face_landmarker/web_js
- Face Landmarker の公式ドキュメント
- サンプルコードと使用方法

**MediaPipe GitHub - Examples**
- https://github.com/google/mediapipe/tree/master/docs/solutions
- 実装例とデモコード

**MediaPipe Solutions Guide**
- https://developers.google.com/mediapipe/solutions/guide
- MediaPipe 全体のアーキテクチャ理解

---

### 🎬 4. **実践的なチュートリアル**

**Web.dev - Media Capture**
- https://web.dev/media-capturing-images/
- Googleによるメディアキャプチャのベストプラクティス

**WebRTC samples - getUserMedia**
- https://webrtc.github.io/samples/
- 動作するサンプルコード集（カメラ、ストリーム処理など）

---

### 📖 5. **特に重要なトピック**

#### あなたのコードを理解するために読むべき順序:

1. **Promise の基礎** → 非同期処理の流れを理解
2. **getUserMedia** → カメラアクセスの方法
3. **HTMLVideoElement** → video要素の操作
4. **loadedmetadata イベント** → メタデータ読み込みタイミング
5. **MediaPipe Face Landmarker** → 顔検出の実装

---

### 💻 6. **実験用のシンプルなコード**

最小限のカメラ起動コード:
```javascript
// 基本形
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    document.querySelector('video').srcObject = stream;
  })
  .catch(error => console.error(error));
```

これを **CodePen** や **JSFiddle** で試すと理解が深まります。

---

### 🔍 検索キーワード

- "getUserMedia 使い方"
- "MediaStream API チュートリアル"
- "Promise then catch 使い方"
- "MediaPipe face detection JavaScript"
- "video element loadedmetadata"

これらのリソースを順番に読むことで、今回のVideo Setupコードの全体像が理解できます！
