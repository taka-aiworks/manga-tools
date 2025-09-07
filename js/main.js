// ===== ネーム制作支援ツール - メインモジュール =====

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
let isResizing = false;
let isBubbleResizing = false;
let dragOffset = { x: 0, y: 0 };
let resizeStartData = {};
let bubbleResizeStartData = {};
let currentPage = 1;
let currentScene = 'daily';

// スクロール固定用変数
let originalScrollPosition = { x: 0, y: 0 };
let isScrollLocked = false;

// 操作履歴管理
let operationHistory = [];
let currentHistoryIndex = -1;
const MAX_HISTORY = 50;

// ===== テンプレート定義 =====
const templates = {
    '4koma': {
        name: '4コマ漫画',
        description: 'オーソドックスな4コマ構成',
        panels: [
            { x: 50, y: 50, width: 500, height: 170, id: 1 },
            { x: 50, y: 240, width: 500, height: 170, id: 2 },
            { x: 50, y: 430, width: 500, height: 170, id: 3 },
            { x: 50, y: 620, width: 500, height: 170, id: 4 }
        ],
        characters: [
            { id: 'char_1_1', panelId: 1, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.8, facing: 'right', gaze: 'center', pose: 'standing', expression: 'neutral' },
            { id: 'char_1_2', panelId: 1, type: 'heroine', name: 'ヒロイン', x: 0.7, y: 0.6, scale: 0.8, facing: 'left', gaze: 'center', pose: 'standing', expression: 'neutral' },
            { id: 'char_2_1', panelId: 2, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 1.0, facing: 'front', gaze: 'center', pose: 'standing', expression: 'surprised' },
            { id: 'char_3_1', panelId: 3, type: 'heroine', name: 'ヒロイン', x: 0.5, y: 0.6, scale: 1.2, facing: 'front', gaze: 'center', pose: 'standing', expression: 'happy' },
            { id: 'char_4_1', panelId: 4, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.7, facing: 'right', gaze: 'down', pose: 'standing', expression: 'sad' },
            { id: 'char_4_2', panelId: 4, type: 'heroine', name: 'ヒロイン', x: 0.7, y: 0.6, scale: 0.7, facing: 'left', gaze: 'right', pose: 'standing', expression: 'neutral' }
        ],
        bubbles: [
            { id: 'bubble_1_1', panelId: 1, type: 'normal', text: 'こんにちは！', x: 0.3, y: 0.3, scale: 1.0, width: 80, height: 40 },
            { id: 'bubble_1_2', panelId: 1, type: 'normal', text: 'はじめまして', x: 0.7, y: 0.2, scale: 1.0, width: 90, height: 40 },
            { id: 'bubble_2_1', panelId: 2, type: 'shout', text: 'えーっ！？', x: 0.5, y: 0.2, scale: 1.2, width: 70, height: 45 },
            { id: 'bubble_3_1', panelId: 3, type: 'normal', text: 'よろしくね♪', x: 0.5, y: 0.2, scale: 1.0, width: 85, height: 40 },
            { id: 'bubble_4_1', panelId: 4, type: 'whisper', text: 'そうだね...', x: 0.3, y: 0.3, scale: 0.9, width: 75, height: 35 }
        ]
    },
    
    'dialogue': {
        name: '会話シーン',
        description: '2人の会話に特化したレイアウト',
        panels: [
            { x: 50, y: 50, width: 500, height: 200, id: 1 },
            { x: 50, y: 270, width: 240, height: 200, id: 2 },
            { x: 310, y: 270, width: 240, height: 200, id: 3 },
            { x: 50, y: 490, width: 500, height: 260, id: 4 }
        ],
        characters: [
            { id: 'char_1_1', panelId: 1, type: 'hero', name: '主人公', x: 0.25, y: 0.6, scale: 0.9, facing: 'right', gaze: 'right', pose: 'standing', expression: 'neutral' },
            { id: 'char_1_2', panelId: 1, type: 'heroine', name: 'ヒロイン', x: 0.75, y: 0.6, scale: 0.9, facing: 'left', gaze: 'left', pose: 'standing', expression: 'neutral' },
            { id: 'char_2_1', panelId: 2, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 1.2, facing: 'front', gaze: 'center', pose: 'standing', expression: 'happy' },
            { id: 'char_3_1', panelId: 3, type: 'heroine', name: 'ヒロイン', x: 0.5, y: 0.6, scale: 1.2, facing: 'front', gaze: 'center', pose: 'standing', expression: 'surprised' },
            { id: 'char_4_1', panelId: 4, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.8, facing: 'right', gaze: 'right', pose: 'standing', expression: 'happy' },
            { id: 'char_4_2', panelId: 4, type: 'heroine', name: 'ヒロイン', x: 0.7, y: 0.6, scale: 0.8, facing: 'left', gaze: 'left', pose: 'standing', expression: 'happy' }
        ],
        bubbles: [
            { id: 'bubble_1_1', panelId: 1, type: 'normal', text: '今日はいい天気だね', x: 0.25, y: 0.25, scale: 1.0, width: 120, height: 40 },
            { id: 'bubble_1_2', panelId: 1, type: 'normal', text: 'そうですね！', x: 0.75, y: 0.35, scale: 1.0, width: 90, height: 40 },
            { id: 'bubble_2_1', panelId: 2, type: 'normal', text: 'ところで...', x: 0.5, y: 0.2, scale: 1.0, width: 80, height: 40 },
            { id: 'bubble_3_1', panelId: 3, type: 'shout', text: 'えっ！？', x: 0.5, y: 0.2, scale: 1.0, width: 60, height: 40 },
            { id: 'bubble_4_1', panelId: 4, type: 'normal', text: 'よかった〜', x: 0.5, y: 0.2, scale: 1.0, width: 85, height: 40 }
        ]
    },
    
    'action': {
        name: 'アクションシーン',
        description: '動きのあるシーンに最適',
        panels: [
            { x: 50, y: 50, width: 200, height: 300, id: 1 },
            { x: 270, y: 50, width: 280, height: 180, id: 2 },
            { x: 270, y: 250, width: 280, height: 120, id: 3 },
            { x: 50, y: 370, width: 500, height: 380, id: 4 }
        ],
        characters: [
            { id: 'char_1_1', panelId: 1, type: 'hero', name: '主人公', x: 0.5, y: 0.7, scale: 1.0, facing: 'front', gaze: 'up', pose: 'running', expression: 'neutral' },
            { id: 'char_2_1', panelId: 2, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.8, facing: 'right', gaze: 'right', pose: 'pointing', expression: 'angry' },
            { id: 'char_2_2', panelId: 2, type: 'rival', name: 'ライバル', x: 0.7, y: 0.6, scale: 0.8, facing: 'left', gaze: 'left', pose: 'standing', expression: 'angry' },
            { id: 'char_3_1', panelId: 3, type: 'rival', name: 'ライバル', x: 0.5, y: 0.6, scale: 1.2, facing: 'front', gaze: 'center', pose: 'standing', expression: 'angry' },
            { id: 'char_4_1', panelId: 4, type: 'hero', name: '主人公', x: 0.2, y: 0.6, scale: 0.9, facing: 'right', gaze: 'right', pose: 'running', expression: 'neutral' },
            { id: 'char_4_2', panelId: 4, type: 'rival', name: 'ライバル', x: 0.8, y: 0.6, scale: 0.9, facing: 'left', gaze: 'left', pose: 'running', expression: 'angry' }
        ],
        bubbles: [
            { id: 'bubble_2_1', panelId: 2, type: 'shout', text: '待て！', x: 0.3, y: 0.2, scale: 1.0, width: 60, height: 40 },
            { id: 'bubble_2_2', panelId: 2, type: 'normal', text: 'くっ...', x: 0.7, y: 0.3, scale: 0.9, width: 55, height: 35 },
            { id: 'bubble_3_1', panelId: 3, type: 'shout', text: '逃がすか！', x: 0.5, y: 0.2, scale: 1.2, width: 80, height: 45 },
            { id: 'bubble_4_1', panelId: 4, type: 'normal', text: 'しまった！', x: 0.2, y: 0.3, scale: 1.0, width: 75, height: 40 }
        ]
    },
    
    'emotional': {
        name: '感情シーン',
        description: '表情や感情を重視したレイアウト',
        panels: [
            { x: 50, y: 50, width: 320, height: 300, id: 1 },
            { x: 390, y: 50, width: 160, height: 140, id: 2 },
            { x: 390, y: 210, width: 160, height: 140, id: 3 },
            { x: 50, y: 370, width: 500, height: 380, id: 4 }
        ],
        characters: [
            { id: 'char_1_1', panelId: 1, type: 'heroine', name: 'ヒロイン', x: 0.5, y: 0.6, scale: 1.3, facing: 'front', gaze: 'down', pose: 'standing', expression: 'sad' },
            { id: 'char_2_1', panelId: 2, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 1.0, facing: 'front', gaze: 'center', pose: 'standing', expression: 'surprised' },
            { id: 'char_3_1', panelId: 3, type: 'friend', name: '友人', x: 0.5, y: 0.6, scale: 1.0, facing: 'front', gaze: 'center', pose: 'standing', expression: 'neutral' },
            { id: 'char_4_1', panelId: 4, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.9, facing: 'right', gaze: 'right', pose: 'standing', expression: 'happy' },
            { id: 'char_4_2', panelId: 4, type: 'heroine', name: 'ヒロイン', x: 0.7, y: 0.6, scale: 0.9, facing: 'left', gaze: 'left', pose: 'standing', expression: 'happy' }
        ],
        bubbles: [
            { id: 'bubble_1_1', panelId: 1, type: 'thought', text: 'どうしよう...', x: 0.5, y: 0.2, scale: 1.0, width: 90, height: 40 },
            { id: 'bubble_2_1', panelId: 2, type: 'shout', text: 'あっ！', x: 0.5, y: 0.2, scale: 1.0, width: 50, height: 35 },
            { id: 'bubble_3_1', panelId: 3, type: 'normal', text: '大丈夫？', x: 0.5, y: 0.2, scale: 0.9, width: 70, height: 35 },
            { id: 'bubble_4_1', panelId: 4, type: 'normal', text: 'ありがとう', x: 0.5, y: 0.2, scale: 1.0, width: 85, height: 40 }
        ]
    },
    
    'gag': {
        name: 'ギャグシーン',
        description: 'コメディに最適な5コマ構成',
        panels: [
            { x: 50, y: 50, width: 500, height: 150, id: 1 },
            { x: 50, y: 220, width: 160, height: 200, id: 2 },
            { x: 230, y: 220, width: 160, height: 200, id: 3 },
            { x: 410, y: 220, width: 140, height: 200, id: 4 },
            { x: 50, y: 440, width: 500, height: 310, id: 5 }
        ],
        characters: [
            { id: 'char_1_1', panelId: 1, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 0.8, facing: 'front', gaze: 'center', pose: 'standing', expression: 'neutral' },
            { id: 'char_2_1', panelId: 2, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 1.0, facing: 'front', gaze: 'center', pose: 'standing', expression: 'surprised' },
            { id: 'char_3_1', panelId: 3, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 1.2, facing: 'front', gaze: 'up', pose: 'standing', expression: 'surprised' },
            { id: 'char_4_1', panelId: 4, type: 'hero', name: '主人公', x: 0.5, y: 0.7, scale: 1.0, facing: 'front', gaze: 'down', pose: 'standing', expression: 'sad' },
            { id: 'char_5_1', panelId: 5, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.8, facing: 'right', gaze: 'down', pose: 'standing', expression: 'sad' },
            { id: 'char_5_2', panelId: 5, type: 'friend', name: '友人', x: 0.7, y: 0.6, scale: 0.8, facing: 'left', gaze: 'left', pose: 'standing', expression: 'neutral' }
        ],
        bubbles: [
            { id: 'bubble_1_1', panelId: 1, type: 'normal', text: '今日はテストだ', x: 0.5, y: 0.3, scale: 1.0, width: 100, height: 40 },
            { id: 'bubble_2_1', panelId: 2, type: 'shout', text: '！？', x: 0.5, y: 0.2, scale: 1.2, width: 40, height: 45 },
            { id: 'bubble_3_1', panelId: 3, type: 'shout', text: 'やばい！', x: 0.5, y: 0.15, scale: 1.3, width: 70, height: 50 },
            { id: 'bubble_4_1', panelId: 4, type: 'whisper', text: '勉強してない...', x: 0.5, y: 0.2, scale: 0.9, width: 110, height: 35 },
            { id: 'bubble_5_1', panelId: 5, type: 'normal', text: 'がんばれよ〜', x: 0.7, y: 0.3, scale: 1.0, width: 90, height: 40 }
        ]
    }
};

// キャラクター配置パターン
const characterLayouts = {
    'single_center': [{ x: 0.5, y: 0.6, scale: 0.8 }],
    'dialogue_two': [
        { x: 0.25, y: 0.6, scale: 0.7, flip: false },
        { x: 0.75, y: 0.6, scale: 0.7, flip: true }
    ],
    'close_up': [{ x: 0.5, y: 0.4, scale: 1.2 }],
    'action_dynamic': [{ x: 0.3, y: 0.7, scale: 0.9, rotation: -15 }]
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
        template: 'dialogue',
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
        template: 'emotional',
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

// ===== エラーハンドリングシステム =====
window.addEventListener('error', function(e) {
    console.error('🚨 グローバルエラー:', e.error);
    console.error('ファイル:', e.filename, '行:', e.lineno);
    attemptErrorRecovery(e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 未処理のPromise拒否:', e.reason);
    e.preventDefault();
});

function attemptErrorRecovery(error) {
    const errorMessage = error?.message || 'Unknown error';
    console.log('🔧 エラー回復を試行中...', errorMessage);
    
    if (errorMessage.includes('is not defined')) {
        const functionName = errorMessage.match(/(\w+) is not defined/)?.[1];
        if (functionName) {
            console.log(`🔧 未定義関数を検出: ${functionName}`);
            createFallbackFunction(functionName);
        }
    }
}

function createFallbackFunction(functionName) {
    if (typeof window[functionName] === 'function') return;
    
    console.log(`🔧 フォールバック関数を作成: ${functionName}`);
    
    const fallbacks = {
        updateCharacterOverlay: () => console.log('📝 updateCharacterOverlay (フォールバック)'),
        updateBubbleOverlay: () => console.log('📝 updateBubbleOverlay (フォールバック)'),
        redrawCanvas: () => {
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        },
        drawGuidelines: () => console.log('📝 drawGuidelines (フォールバック)'),
        updateElementCount: () => {
            const totalElements = (characters?.length || 0) + (speechBubbles?.length || 0);
            const elementCountEl = document.getElementById('elementCount');
            if (elementCountEl) {
                elementCountEl.textContent = `要素数: ${totalElements}`;
            }
        }
    };
    
    window[functionName] = fallbacks[functionName] || function(...args) {
        console.log(`📝 ${functionName} (汎用フォールバック)`, args);
        return null;
    };
}

// ===== 通知システム =====
function showNotification(message, type = 'info', duration = 3000) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// ===== テンプレート読み込み =====
function loadTemplate(templateName) {
    console.log('📐 シーンテンプレート読み込み:', templateName);
    
    // アクティブ状態更新
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('active');
    });
    const targetCard = document.querySelector(`[data-template="${templateName}"]`);
    if (targetCard) {
        targetCard.classList.add('active');
    }
    
    if (templates[templateName]) {
        const template = templates[templateName];
        
        // データ設定
        panels = JSON.parse(JSON.stringify(template.panels));
        characters = template.characters.map(char => ({
            ...char,
            id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            rotation: char.rotation || 0,
            flip: char.flip || false
        }));
        speechBubbles = template.bubbles.map(bubble => ({
            ...bubble,
            id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
        
        // 表示更新
        clearOverlays();
        safeExecute('redrawCanvas');
        safeExecute('drawGuidelines');
        safeExecute('updateCharacterOverlay');
        safeExecute('updateBubbleOverlay');
        updateStatus();
        updateElementCount();
        
        console.log(`✅ シーンテンプレート "${templateName}" 適用完了`);
        showNotification(`${template.name} を適用しました`, 'success', 2000);
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

function safeExecute(functionName, ...args) {
    try {
        if (typeof window[functionName] === 'function') {
            return window[functionName](...args);
        } else {
            createFallbackFunction(functionName);
            return window[functionName](...args);
        }
    } catch (error) {
        console.error(`❌ ${functionName} 実行エラー:`, error);
        return null;
    }
}

// ===== プロジェクト管理 =====
function saveProject() {
    const projectData = {
        currentPage: currentPage,
        currentScene: currentScene,
        pages: [{
            panels: panels,
            characters: characters,
            speechBubbles: speechBubbles
        }],
        metadata: {
            created: new Date().toISOString(),
            version: '1.0'
        }
    };
    
    localStorage.setItem('nameProject', JSON.stringify(projectData));
    console.log('💾 プロジェクト保存完了');
    showNotification('プロジェクトを保存しました！', 'success', 2000);
}

function exportToClipStudio() {
    const projectData = {
        pages: [{
            pageNumber: currentPage,
            panels: panels,
            characters: characters,
            speechBubbles: speechBubbles,
            canvas: {
                width: canvas.width,
                height: canvas.height
            },
            metadata: {
                scene: currentScene,
                created: new Date().toISOString()
            }
        }]
    };
    
    const jsonData = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `name_project_page${currentPage}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('クリスタ用プロジェクトデータを出力しました！', 'success', 2000);
}

function exportToPDF() {
    showNotification('PDF出力機能は開発中です。現在はPNG出力をご利用ください。', 'warning', 3000);
}

function exportToPNG() {
    const link = document.createElement('a');
    link.download = `name_page${currentPage}.png`;
    link.href = canvas.toDataURL();
    link.click();
    showNotification('PNG画像として保存しました！', 'success', 2000);
}

// ===== アプリケーション初期化 =====
function initializeApp() {
    console.log('🎬 ネーム制作ツール初期化開始');
    
    // キャンバス要素取得
    canvas = document.getElementById('nameCanvas');
    ctx = canvas?.getContext('2d');
    guideCanvas = document.getElementById('guidelines');
    guideCtx = guideCanvas?.getContext('2d');
    
    if (!canvas || !ctx) {
        console.error('❌ キャンバス要素が見つかりません');
        showNotification('キャンバスの初期化に失敗しました', 'error', 5000);
        return;
    }
    
    console.log('✅ キャンバス要素取得完了');
    
    // 各モジュールの初期化
    try {
        safeExecute('initializeCanvas');
        safeExecute('initializeUI');
        safeExecute('setupEventListeners');
        safeExecute('addPanelEditEvents');
        safeExecute('initializeUIControls');
        
        // 初期テンプレート読み込み
        loadTemplate('4koma');
        
        // マウス位置表示
        setupMouseTracking();
        
        // キーボードショートカットヒント表示
        safeExecute('showKeyboardHints');
        
        console.log('🎉 初期化完了！');
        showNotification('ネーム制作ツールが起動しました', 'success', 2000);
        
    } catch (error) {
        console.error('❌ 初期化中にエラーが発生しました:', error);
        showNotification('初期化中にエラーが発生しました。コンソールを確認してください。', 'error', 5000);
    }
}

function setupMouseTracking() {
    if (!canvas) return;
    
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        const mousePosElement = document.getElementById('mousePos');
        if (mousePosElement) {
            mousePosElement.textContent = `マウス位置: (${x}, ${y})`;
        }
    });
}

// ===== デバッグ・メンテナンス機能 =====
function showDebugStatus() {
    const status = {
        panels: panels?.length || 0,
        characters: characters?.length || 0,
        speechBubbles: speechBubbles?.length || 0,
        canvas: !!canvas,
        ctx: !!ctx,
        selectedPanel: selectedPanel?.id || 'なし',
        selectedCharacter: selectedCharacter?.name || 'なし',
        selectedBubble: selectedBubble?.text?.substring(0, 20) || 'なし'
    };
    
    console.table(status);
    return status;
}

function emergencyRecover() {
    console.log('🚨 緊急回復モードを開始...');
    
    try {
        // 選択状態をクリア
        selectedPanel = null;
        selectedCharacter = null;
        selectedBubble = null;
        selectedElement = null;
        isDragging = false;
        isResizing = false;
        isBubbleResizing = false;
        
        // 基本配列の初期化
        if (!Array.isArray(panels)) panels = [];
        if (!Array.isArray(characters)) characters = [];
        if (!Array.isArray(speechBubbles)) speechBubbles = [];
        
        // 最小限のパネルを作成（必要に応じて）
        if (panels.length === 0) {
            panels = [
                { id: 1, x: 50, y: 50, width: 500, height: 200 },
                { id: 2, x: 50, y: 270, width: 500, height: 200 },
                { id: 3, x: 50, y: 490, width: 500, height: 200 }
            ];
            console.log('✅ 緊急用パネルを作成しました');
        }
        
        // 表示更新
        safeExecute('redrawCanvas');
        safeExecute('drawGuidelines');
        safeExecute('updateCharacterOverlay');
        safeExecute('updateBubbleOverlay');
        updateElementCount();
        updateStatus();
        
        console.log('✅ 緊急回復完了');
        showNotification('システムを復旧しました', 'success', 3000);
        
    } catch (error) {
        console.error('❌ 緊急回復失敗:', error);
        showNotification('システム復旧に失敗しました。ページを再読み込みしてください。', 'error', 5000);
    }
}

// ===== グローバル関数として公開 =====
window.attemptErrorRecovery = attemptErrorRecovery;
window.createFallbackFunction = createFallbackFunction;
window.safeExecute = safeExecute;
window.showDebugStatus = showDebugStatus;
window.emergencyRecover = emergencyRecover;
window.showNotification = showNotification;
window.loadTemplate = loadTemplate;
window.saveProject = saveProject;
window.exportToClipStudio = exportToClipStudio;
window.exportToPDF = exportToPDF;
window.exportToPNG = exportToPNG;

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

console.log('✅ main.js 読み込み完了');
