// ===== グローバル変数 =====
let canvas, ctx, guideCanvas, guideCtx;
let panels = [];
let characters = [];
let speechBubbles = [];
let selectedPanel = null;
let selectedCharacter = null;
let selectedBubble = null;
let selectedElement = null;
let isDragging = false;
let dragOffset = {x: 0, y: 0};
let currentPage = 1;
let currentScene = 'daily';
// main.jsのグローバル変数に追加
let isResizing = false;
let resizeStartData = {};

// ===== テンプレート定義 =====
const templates = {
    '4koma': [
        {x: 50, y: 50, width: 500, height: 170, id: 1},
        {x: 50, y: 240, width: 500, height: 170, id: 2},
        {x: 50, y: 430, width: 500, height: 170, id: 3},
        {x: 50, y: 620, width: 500, height: 170, id: 4}
    ],
    'dynamic': [
        {x: 50, y: 50, width: 320, height: 300, id: 1},
        {x: 390, y: 50, width: 160, height: 140, id: 2},
        {x: 390, y: 210, width: 160, height: 140, id: 3},
        {x: 50, y: 370, width: 500, height: 380, id: 4}
    ],
    'romance': [
        {x: 50, y: 50, width: 500, height: 200, id: 1},
        {x: 50, y: 270, width: 240, height: 200, id: 2},
        {x: 310, y: 270, width: 240, height: 200, id: 3},
        {x: 50, y: 490, width: 500, height: 260, id: 4}
    ],
    'action': [
        {x: 50, y: 50, width: 200, height: 300, id: 1},
        {x: 270, y: 50, width: 280, height: 180, id: 2},
        {x: 270, y: 250, width: 280, height: 120, id: 3},
        {x: 50, y: 370, width: 500, height: 380, id: 4}
    ],
    'gag': [
        {x: 50, y: 50, width: 500, height: 150, id: 1},
        {x: 50, y: 220, width: 160, height: 200, id: 2},
        {x: 230, y: 220, width: 160, height: 200, id: 3},
        {x: 410, y: 220, width: 140, height: 200, id: 4},
        {x: 50, y: 440, width: 500, height: 310, id: 5}
    ]
};

// キャラクター配置パターン
const characterLayouts = {
    'single_center': [{x: 0.5, y: 0.6, scale: 0.8}],
    'dialogue_two': [
        {x: 0.25, y: 0.6, scale: 0.7, flip: false},
        {x: 0.75, y: 0.6, scale: 0.7, flip: true}
    ],
    'close_up': [{x: 0.5, y: 0.4, scale: 1.2}],
    'action_dynamic': [{x: 0.3, y: 0.7, scale: 0.9, rotation: -15}]
};

// シーン別推奨設定
const sceneRecommendations = {
    'daily': {
        template: '4koma',
        layout: 'single_center',
        tips: '等間隔で安定感のある日常描写。背景描写スペースを確保。',
        cameraWork: 'medium'
    },
    'dialogue': {
        template: 'romance',
        layout: 'dialogue_two',
        tips: '会話のキャッチボールが見やすい配置。吹き出しスペースを考慮。',
        cameraWork: 'medium'
    },
    'action': {
        template: 'action',
        layout: 'action_dynamic',
        tips: '動きとスピード感を重視。斜めの構図で迫力演出。',
        cameraWork: 'wide'
    },
    'emotional': {
        template: 'dynamic',
        layout: 'close_up',
        tips: '感情表現重視。表情がよく見える大きなコマを使用。',
        cameraWork: 'close_up'
    },
    'comedy': {
        template: 'gag',
        layout: 'single_center',
        tips: 'テンポの良いコマ割り。オチのコマを強調。',
        cameraWork: 'medium'
    }
};

// ===== メイン初期化 =====
function initializeApp() {
    console.log('🎬 ネーム制作ツール初期化開始');
    
    // キャンバス要素取得
    canvas = document.getElementById('nameCanvas');
    ctx = canvas.getContext('2d');
    guideCanvas = document.getElementById('guidelines');
    guideCtx = guideCanvas.getContext('2d');
    
    if (!canvas || !ctx) {
        console.error('❌ キャンバス要素が見つかりません');
        return;
    }
    
    console.log('✅ キャンバス要素取得完了');
    
    // 各モジュールの初期化
    initializeCanvas();
    initializeUI();
    initializeInteraction();
    
    // 初期テンプレート読み込み
    loadTemplate('4koma');
    
    // マウス位置表示
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        const mousePosElement = document.getElementById('mousePos');
        if (mousePosElement) {
            mousePosElement.textContent = `マウス位置: (${x}, ${y})`;
        }
    });
    
    console.log('🎉 初期化完了！');
}

// ===== テンプレート読み込み =====
function loadTemplate(templateName) {
    console.log('📐 テンプレート読み込み:', templateName);
    
    // アクティブ状態更新
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('active');
    });
    const targetCard = document.querySelector(`[data-template="${templateName}"]`);
    if (targetCard) {
        targetCard.classList.add('active');
    }
    
    if (templates[templateName]) {
        panels = JSON.parse(JSON.stringify(templates[templateName]));
        
        // 既存の要素をクリア（必要に応じて）
        // characters = [];
        // speechBubbles = [];
        
        clearOverlays();
        redrawCanvas();
        drawGuidelines();
        updateStatus();
        updateElementCount();
        
        console.log(`✅ テンプレート "${templateName}" 適用完了`);
    } else {
        console.warn(`⚠️ テンプレート "${templateName}" が見つかりません`);
    }
}

// ===== ユーティリティ関数 =====
function updateElementCount() {
    const totalElements = characters.length + speechBubbles.length;
    const elementCountEl = document.getElementById('elementCount');
    if (elementCountEl) {
        elementCountEl.textContent = `要素数: ${totalElements}`;
    }
}

function updateStatus() {
    const selectedInfo = document.getElementById('selectedInfo');
    const panelInfo = document.getElementById('panelInfo');
    
    if (!selectedInfo || !panelInfo) return;
    
    if (selectedBubble) {
        selectedInfo.textContent = `吹き出し: ${selectedBubble.text.substring(0, 10)}...`;
        panelInfo.textContent = `パネル${selectedBubble.panelId} | タイプ: ${selectedBubble.type}`;
    } else if (selectedCharacter) {
        selectedInfo.textContent = `キャラクター: ${selectedCharacter.name}`;
        panelInfo.textContent = `パネル${selectedCharacter.panelId} | サイズ: ${selectedCharacter.scale.toFixed(2)}`;
    } else if (selectedPanel) {
        selectedInfo.textContent = `コマ${selectedPanel.id}`;
        panelInfo.textContent = `位置: (${selectedPanel.x}, ${selectedPanel.y}) | サイズ: ${selectedPanel.width}×${selectedPanel.height}`;
    } else {
        selectedInfo.textContent = 'コマを選択してください';
        panelInfo.textContent = 'パネル情報: 未選択';
    }
}

function clearOverlays() {
    const characterOverlay = document.getElementById('characterOverlay');
    const bubbleOverlay = document.getElementById('bubbleOverlay');
    
    if (characterOverlay) characterOverlay.innerHTML = '';
    if (bubbleOverlay) bubbleOverlay.innerHTML = '';
}

// ===== 起動処理 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// 念のため、window.onloadでも実行
window.addEventListener('load', function() {
    if (!canvas) {
        console.log('🔄 Window load時に再初期化');
        initializeApp();
    }
});
