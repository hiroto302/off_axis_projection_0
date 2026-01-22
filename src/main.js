import * as THREE from 'three'
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

// Canvas
const canvas = document.querySelector('#webgl')

// Scene
const scene = new THREE.Scene()

// Object
// Cube with Edges
const geometryCube = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const materialCube = new THREE.MeshStandardMaterial({ color: 0x4488ff, wireframe: false })
const cube = new THREE.Mesh(geometryCube, materialCube)
scene.add(cube)
const edges = new THREE.EdgesGeometry(geometryCube)
const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }))
cube.add(line)

// Grid Stage
const gridHelper = new THREE.GridHelper(20, 20, 0xff8844, 0xdd6633)
gridHelper.position.y = - 2
scene.add(gridHelper)

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
directionalLight.position.set(5, 10, 7.5)
scene.add(directionalLight)

const pointLight = new THREE.PointLight(0xff69b4, 5.0)
pointLight.position.set(-1, -1, -1)
scene.add(pointLight)


// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// Video (WebCamera) Setup
const videoElement = document.getElementById('video');
let videoStream;

const videoConfig = {
    width: 640,
    height: 480,
    facingMode: 'user', // 'user' for front camera, 'environment' for back camera
    frameRate: 30
}

const videoConstraints = {
    video: {
        width: videoConfig.width,
        height: videoConfig.height,
        facingMode: videoConfig.facingMode,
        frameRate: videoConfig.frameRate
    },
    audio: false
}

navigator.mediaDevices.getUserMedia(videoConstraints)
    .then((stream) => {
        videoStream = stream;
        videoElement.srcObject = stream;

        return new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                console.log('✅ Video metadata loaded');
                console.log(`Resolution: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
                resolve();
            };
        });
    })
    .then(() => {
        return videoElement.play();
    })
    .then(() => {
        console.log('✅ Video playback started');
        toggleVideoPreview(true);
    })
    .catch((error) => {
        console.error('Error accessing media devices.', error);
    });


// MediaPipe 関連
let faceDetector;
let lastDetectionTime = 0;

// キャンバスオーバーレイ(顔検出結果を描画)
let canvasElement;
let canvasCtx;

// MediaPipe設定
const MEDIAPIPE_CONFIG = {
modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
runningMode: 'VIDEO',
minDetectionConfidence: 0.5,
minSuppressionThreshold: 0.5
};

// 顔検出の頻度(2フレームに1回 = 30fps)
const DETECTION_INTERVAL_MS = 33; // 約30fps

// Canvas Overlay Setup
canvasElement = document.getElementById('overlay-canvas');
canvasElement.width = videoConfig.width;
canvasElement.height = videoConfig.height;
canvasCtx = canvasElement.getContext('2d');
canvasElement.classList.add('visible');
console.log('✅ Canvas overlay initialized');
console.log(`   Canvas size: ${canvasElement.width}x${canvasElement.height}`);


/** Initialize MediaPipe Face Detector
    @return {Promise<FaceDetector>}
**/
async function initializeFaceDetector() {
    console.log('🤖 Initializing MediaPipe Face Detector...');

    try {
        // MediaPipe Visionタスクのwasmファイルをロード
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm');
        console.log('✅ FilesetResolver loaded successfully');

        // Face Detectorを作成
        faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: MEDIAPIPE_CONFIG.modelAssetPath,
                delegate: 'GPU' // GPU加速を有効化(パフォーマンス向上)
            },
            runningMode: MEDIAPIPE_CONFIG.runningMode,
            minDetectionConfidence: MEDIAPIPE_CONFIG.minDetectionConfidence,
            minSuppressionThreshold: MEDIAPIPE_CONFIG.minSuppressionThreshold
        });

        return faceDetector;
    } catch(error) {
        console.error('❌ Error initializing MediaPipe Face Detector:', error);
    }
}

// Face Detection Function
//ビデオフレームから顔を検出 30fpsで実行されるように調整(2フレームに1回)
function detectFace() {
    // ビデオが準備できていない場合はスキップ
    if (!videoElement || videoElement.readyState < 2) {
        // Video not ready
        return;
    }
    // 前回の検出から十分な時間が経過していない場合はスキップ
    const now = performance.now();
    if (now - lastDetectionTime < DETECTION_INTERVAL_MS) {
        // Skip detection to control frequency
        return;
    }

    lastDetectionTime = now;

    const detections = faceDetector.detectForVideo(videoElement, now);

    // Clear canvas
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // 検出結果を描画
    drawDetections(detections);

    // デバッグ情報を更新
    updateDetectionInfo(detections);
}

/**
 * 顔検出結果をキャンバスに描画
 * @param {Object} detections - MediaPipeの検出結果
 */
function drawDetections(detections) {
    if (!detections || !detections.detections || detections.detections.length === 0) {
        return;
    }

    // 複数顔検出時は最初の顔のみ使用
    const detection = detections.detections[0];

    // バウンディングボックスの座標を取得
    // (MediaPipe Tasks Vision APIのboundingBoxは既にピクセル座標)
    const bbox = detection.boundingBox;

    // 正規化座標をピクセル座標に変換
    const x = bbox.originX;
    const y = bbox.originY;
    const width = bbox.width;
    const height = bbox.height;

    // 顔の中心座標を計算
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // バウンディングボックスを描画
    canvasCtx.strokeStyle = '#00ff00'; // 緑色
    canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(x, y, width, height);

    // 顔の中心に十字マークを描画
    canvasCtx.strokeStyle = '#ff0000'; // 赤色
    canvasCtx.lineWidth = 2;
    const crossSize = 10;
    canvasCtx.beginPath();
    canvasCtx.moveTo(centerX - crossSize, centerY);
    canvasCtx.lineTo(centerX + crossSize, centerY);
    canvasCtx.moveTo(centerX, centerY - crossSize);
    canvasCtx.lineTo(centerX, centerY + crossSize);
    canvasCtx.stroke();

    // 信頼度スコアを表示
    const confidence = (detection.categories[0].score * 100).toFixed(1);
    canvasCtx.fillStyle = '#00ff00';
    canvasCtx.font = 'bold 16px Arial';
    canvasCtx.fillText(`${confidence}%`, x, y - 5);

    // 正規化座標を表示(デバッグ用)
    canvasCtx.fillStyle = '#ffff00'; // 黄色
    canvasCtx.font = '12px monospace';
    const normalizedX = centerX / canvasElement.width;
    const normalizedY = centerY / canvasElement.height;
    canvasCtx.fillText(
        `Norm: (${normalizedX.toFixed(3)}, ${normalizedY.toFixed(3)})`,
        x,
        y + height + 15
    );
}

/**
 * デバッグ情報パネルを更新
 * @param {Object} detections - MediaPipeの検出結果
 */
function updateDetectionInfo(detections) {
    const debugInfo = {
        'Camera Position': `(${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)})`,
        'Objects in Scene': scene.children.length
    };

    // ビデオ情報
    if (videoElement && videoElement.readyState >= 2) {
        debugInfo['Video Status'] = '📹 Active';
        debugInfo['Video Resolution'] = `${videoElement.videoWidth}x${videoElement.videoHeight}`;
    }

    // 顔検出情報
    if (detections && detections.detections && detections.detections.length > 0) {
        const detection = detections.detections[0];
        const bbox = detection.boundingBox;

        debugInfo['Faces Detected'] = `✅ ${detections.detections.length}`;
        debugInfo['Confidence'] = `${(detection.categories[0].score * 100).toFixed(1)}%`;

        // 顔の中心座標(正規化座標)
        const centerX = bbox.originX + bbox.width / 2;
        const centerY = bbox.originY + bbox.height / 2;
        debugInfo['Face Center (norm)'] = `(${centerX.toFixed(3)}, ${centerY.toFixed(3)})`;

        // バウンディングボックスのサイズ
        debugInfo['BBox Size'] = `${(bbox.width * 100).toFixed(1)}% × ${(bbox.height * 100).toFixed(1)}%`;
    } else {
        debugInfo['Faces Detected'] = '❌ 0';
    }

    updateDebugInfo(debugInfo);
}



// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    cube.rotation.y = 0.5 * elapsedTime
    cube.rotation.x = 0.2 * elapsedTime


    if (faceDetector) {
        detectFace();
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

setTimeout(() => {
    toggleLoadingScreen(false);
}, 500);



// Main function
async function main() {
    await initializeFaceDetector();
    console.log('🤖 MediaPipe Face Detector is ready!');
}

// DOMContentLoaded後に実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}