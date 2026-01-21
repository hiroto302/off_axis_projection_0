/**
 * Off-Axis Projection Tutorial - Shared Utility Functions
 *
 * このファイルは全てのチュートリアルフェーズで共有される
 * ヘルパー関数を提供します。
 */

// =====================================
// UI Utility Functions
// =====================================

/**
 * ローディング画面を表示/非表示
 * @param {boolean} show - true: 表示、false: 非表示
 * @param {string} text - 表示するテキスト(省略可)
 */
function toggleLoadingScreen(show, text = 'Loading...') {
  const loadingScreen = document.getElementById('loading-screen');
  const loadingText = document.getElementById('loading-text');

  if (show) {
    loadingScreen.classList.remove('hidden');
    loadingText.textContent = text;
  } else {
    loadingScreen.classList.add('hidden');
  }
}

/**
 * 警告バナーを表示/非表示
 * @param {boolean} show - true: 表示、false: 非表示
 * @param {string} message - 表示するメッセージ(省略可)
 */
function toggleWarningBanner(show, message = '⚠️ カメラに顔を向けてください') {
  const banner = document.getElementById('warning-banner');

  if (show) {
    banner.textContent = message;
    banner.classList.add('visible');
  } else {
    banner.classList.remove('visible');
  }
}

/**
 * ビデオプレビューを表示/非表示
 * @param {boolean} show - true: 表示、false: 非表示
 */
function toggleVideoPreview(show) {
  const video = document.getElementById('video');
  const overlayCanvas = document.getElementById('overlay-canvas');

  if (show) {
    video.classList.add('visible');
    overlayCanvas.classList.add('visible');
  } else {
    video.classList.remove('visible');
    overlayCanvas.classList.remove('visible');
  }
}

/**
 * デバッグ情報を更新
 * @param {Object} info - 表示する情報のオブジェクト
 */
function updateDebugInfo(info) {
  const debugDiv = document.getElementById('debug-info');
  let html = '';

  for (const [key, value] of Object.entries(info)) {
    html += `<p><strong>${key}:</strong> ${value}</p>`;
  }

  debugDiv.innerHTML = html;
}

/**
 * フェーズ情報を更新
 * @param {string|number} phaseNum - フェーズ番号
 * @param {string} description - フェーズの説明
 */
function updatePhaseInfo(phaseNum, description) {
  document.getElementById('phase-name').textContent = phaseNum;
  document.getElementById('phase-description').textContent = description;
}

// =====================================
// Error Handling
// =====================================

/**
 * エラーオーバーレイを表示
 * @param {string} title - エラータイトル
 * @param {string} message - エラーメッセージ
 * @param {Function} onRetry - リトライボタンクリック時のコールバック(省略可)
 */
function showError(title, message, onRetry = null) {
  // Remove existing error overlay if any
  const existingOverlay = document.querySelector('.error-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'error-overlay';

  overlay.innerHTML = `
    <h2>${title}</h2>
    <p>${message}</p>
    ${onRetry ? '<button id="retry-button">再試行</button>' : ''}
  `;

  document.body.appendChild(overlay);

  if (onRetry) {
    document.getElementById('retry-button').addEventListener('click', () => {
      overlay.remove();
      onRetry();
    });
  }
}

/**
 * カメラエラーのハンドリング
 * @param {Error} error - カメラアクセスエラー
 */
function handleCameraError(error) {
  let message = '';

  switch (error.name) {
    case 'NotAllowedError':
      message = 'カメラアクセスが拒否されました。ブラウザの設定でカメラへのアクセスを許可してください。';
      break;
    case 'NotFoundError':
      message = 'カメラが見つかりませんでした。デバイスにカメラが接続されているか確認してください。';
      break;
    case 'NotReadableError':
      message = 'カメラが他のアプリケーションで使用中です。他のアプリを閉じてから再試行してください。';
      break;
    default:
      message = `カメラエラー: ${error.message}`;
  }

  showError('カメラアクセスエラー', message, () => window.location.reload());
}

/**
 * MediaPipeモデル読み込みエラーのハンドリング
 * @param {Error} error - モデル読み込みエラー
 */
function handleMediaPipeError(error) {
  const message = `MediaPipeモデルの読み込みに失敗しました。\n\nインターネット接続を確認してページを再読み込みしてください。\n\n詳細: ${error.message}`;

  showError('MediaPipeエラー', message, () => window.location.reload());
}

// =====================================
// Math & Coordinate Utilities
// =====================================

/**
 * 線形補間 (lerp)
 * @param {number} start - 開始値
 * @param {number} end - 終了値
 * @param {number} t - 補間係数 [0, 1]
 * @returns {number} 補間された値
 */
function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * 値を範囲内にクランプ
 * @param {number} value - 入力値
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number} クランプされた値
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * MediaPipe正規化座標 [0,1] → Three.js中心座標 [-1,1] への変換
 * @param {number} normalized - 正規化座標 [0,1]
 * @returns {number} 中心座標 [-1,1]
 */
function normalizedToCentered(normalized) {
  return (normalized - 0.5) * 2;
}

/**
 * MediaPipe正規化座標を物理座標(cm)に変換
 * @param {number} normalizedX - 正規化X座標 [0,1]
 * @param {number} normalizedY - 正規化Y座標 [0,1]
 * @param {Object} config - 設定オブジェクト
 * @param {number} config.maxOffsetX - X軸最大オフセット(cm)
 * @param {number} config.maxOffsetY - Y軸最大オフセット(cm)
 * @param {number} config.scale - スケール係数
 * @param {number} config.viewingDistance - 視聴距離(cm)
 * @returns {Object} {x, y, z} 物理座標(cm)
 */
function mediaPipeToPhysical(normalizedX, normalizedY, config = {}) {
  const {
    maxOffsetX = 20,
    maxOffsetY = 15,
    scale = 2.0,
    viewingDistance = 60
  } = config;

  // 中心座標に変換 [-1, 1]
  const centeredX = normalizedToCentered(normalizedX);
  const centeredY = normalizedToCentered(normalizedY);

  // 物理座標に変換 + ミラーリング(X軸反転) + Y軸反転
  const eyeX = -centeredX * maxOffsetX * scale;
  const eyeY = -centeredY * maxOffsetY * scale;
  const eyeZ = viewingDistance;

  return { x: eyeX, y: eyeY, z: eyeZ };
}

// =====================================
// Performance Utilities
// =====================================

/**
 * FPS計測用クラス
 */
class FPSCounter {
  constructor() {
    this.frames = 0;
    this.lastTime = performance.now();
    this.fps = 0;
  }

  update() {
    this.frames++;
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= 1000) { // 1秒ごとに更新
      this.fps = Math.round((this.frames * 1000) / delta);
      this.frames = 0;
      this.lastTime = now;
    }

    return this.fps;
  }
}

/**
 * フレーム間引き用ヘルパー
 * @param {number} interval - 間引き間隔(例: 2 = 2フレームに1回実行)
 * @returns {Function} shouldRun(frameCount) を返す関数
 */
function createFrameThrottler(interval) {
  return (frameCount) => frameCount % interval === 0;
}

// =====================================
// Browser Compatibility Checks
// =====================================

/**
 * WebGL対応チェック
 * @returns {boolean} WebGL対応の場合true
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
              (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

/**
 * getUserMedia API 対応チェック
 * @returns {boolean} getUserMedia対応の場合true
 */
function isGetUserMediaAvailable() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * ブラウザ互換性チェック
 * 対応していない場合はエラー表示
 */
function checkBrowserCompatibility() {
  if (!isWebGLAvailable()) {
    showError(
      'WebGL未対応',
      'このブラウザはWebGLをサポートしていません。Google Chrome最新版をお試しください。'
    );
    return false;
  }

  if (!isGetUserMediaAvailable()) {
    showError(
      'カメラAPI未対応',
      'このブラウザはカメラアクセスAPIをサポートしていません。Google Chrome最新版をお試しください。'
    );
    return false;
  }

  return true;
}

// =====================================
// Export for module use (if needed)
// =====================================

// ES Moduleとして使う場合のエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toggleLoadingScreen,
    toggleWarningBanner,
    toggleVideoPreview,
    updateDebugInfo,
    updatePhaseInfo,
    showError,
    handleCameraError,
    handleMediaPipeError,
    lerp,
    clamp,
    normalizedToCentered,
    mediaPipeToPhysical,
    FPSCounter,
    createFrameThrottler,
    checkBrowserCompatibility
  };
}
