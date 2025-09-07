// ===== エラー回復システム - main.jsの最初に追加 =====

// 🆕 グローバルエラーハンドリング
window.addEventListener('error', function(e) {
    console.error('🚨 グローバルエラー:', e.error);
    console.error('ファイル:', e.filename, '行:', e.lineno);
    
    // エラー回復を試行
    attemptErrorRecovery(e.error);
});

// 🆕 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 未処理のPromise拒否:', e.reason);
    e.preventDefault(); // ブラウザのデフォルトエラー表示を防ぐ
});

// 🆕 エラー回復システム
function attemptErrorRecovery(error) {
    const errorMessage = error?.message || 'Unknown error';
    
    console.log('🔧 エラー回復を試行中...', errorMessage);
    
    // 関数未定義エラーの場合
    if (errorMessage.includes('is not defined')) {
        const functionName = errorMessage.match(/(\w+) is not defined/)?.[1];
        if (functionName) {
            console.log(`🔧 未定義関数を検出: ${functionName}`);
            createFallbackFunction(functionName);
        }
    }
    
    // 関数未定義エラーの場合の自動修復
    const commonMissingFunctions = [
        'updateCharacterOverlay',
        'updateBubbleOverlay', 
        'redrawCanvas',
        'drawGuidelines',
        'updateElementCount',
        'analyzeScene',
        'applyRecommendation',
        'applyCharacterLayout',
        'addCharacter',
        'autoPlaceBubbles',
        'exportToClipStudio',
        'exportToPDF',
        'exportToPNG',
        'saveProject'
    ];
    
    commonMissingFunctions.forEach(funcName => {
        if (typeof window[funcName] !== 'function') {
            createFallbackFunction(funcName);
        }
    });
}

// 🆕 フォールバック関数を動的に作成
function createFallbackFunction(functionName) {
    if (typeof window[functionName] === 'function') {
        return; // 既に存在する場合はスキップ
    }
    
    console.log(`🔧 フォールバック関数を作成: ${functionName}`);
    
    // 関数の種類に応じてフォールバック動作を決定
    switch (functionName) {
        case 'updateCharacterOverlay':
            window[functionName] = function() {
                console.log('📝 updateCharacterOverlay (フォールバック)');
                // 基本的な再描画のみ
                const overlay = document.getElementById('characterOverlay');
                if (overlay) {
                    // オーバーレイの基本的な更新
                }
            };
            break;
            
        case 'updateBubbleOverlay':
            window[functionName] = function() {
                console.log('📝 updateBubbleOverlay (フォールバック)');
                const overlay = document.getElementById('bubbleOverlay');
                if (overlay) {
                    // オーバーレイの基本的な更新
                }
            };
            break;
            
        case 'redrawCanvas':
            window[functionName] = function() {
                console.log('📝 redrawCanvas (フォールバック)');
                if (ctx && canvas) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            };
            break;
            
        case 'drawGuidelines':
            window[functionName] = function() {
                console.log('📝 drawGuidelines (フォールバック)');
                // ガイドライン描画のスキップ
            };
            break;
            
        case 'updateElementCount':
            window[functionName] = function() {
                console.log('📝 updateElementCount (フォールバック)');
                const totalElements = (characters?.length || 0) + (speechBubbles?.length || 0);
                const elementCountEl = document.getElementById('elementCount');
                if (elementCountEl) {
                    elementCountEl.textContent = `要素数: ${totalElements}`;
                }
            };
            break;
            
        case 'analyzeScene':
            window[functionName] = function(sceneType) {
                console.log('📝 analyzeScene (フォールバック):', sceneType);
                currentScene = sceneType;
            };
            break;
            
        case 'applyRecommendation':
            window[functionName] = function() {
                console.log('📝 applyRecommendation (フォールバック)');
                alert('推奨設定機能は現在利用できません');
            };
            break;
            
        case 'applyCharacterLayout':
            window[functionName] = function(layoutName) {
                console.log('📝 applyCharacterLayout (フォールバック):', layoutName);
                alert('キャラクター配置機能は現在利用できません');
            };
            break;
            
        case 'addCharacter':
            window[functionName] = function(type) {
                console.log('📝 addCharacter (フォールバック):', type);
                alert('キャラクター追加機能は現在利用できません');
            };
            break;
            
        case 'autoPlaceBubbles':
            window[functionName] = function() {
                console.log('📝 autoPlaceBubbles (フォールバック)');
                alert('自動配置機能は現在利用できません');
            };
            break;
            
        case 'exportToClipStudio':
        case 'exportToPDF':
        case 'exportToPNG':
        case 'saveProject':
            window[functionName] = function() {
                console.log(`📝 ${functionName} (フォールバック)`);
                alert('出力機能は現在利用できません');
            };
            break;
            
        default:
            // 汎用フォールバック関数
            window[functionName] = function(...args) {
                console.log(`📝 ${functionName} (汎用フォールバック)`, args);
                return null;
            };
            break;
    }
    
    console.log(`✅ ${functionName} フォールバック関数を作成しました`);
}

// 🆕 必須関数の事前チェックと作成
function ensureRequiredFunctions() {
    console.log('🔍 必須関数の存在チェック中...');
    
    const requiredFunctions = [
        'updateCharacterOverlay',
        'updateBubbleOverlay',
        'redrawCanvas',
        'drawGuidelines',
        'updateElementCount',
        'updateStatus',
        'selectCharacter',
        'selectBubble',
        'selectPanel',
        'clearSelection',
        'deleteSelected',
        'updateControlsFromElement',
        'updateSelectedElement',
        'toggleGuides',
        'showKeyboardHints',
        'initializeUIControls'
    ];
    
    const missingFunctions = [];
    
    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] !== 'function') {
            missingFunctions.push(funcName);
            createFallbackFunction(funcName);
        }
    });
    
    if (missingFunctions.length > 0) {
        console.warn('⚠️ 以下の関数がフォールバックで作成されました:', missingFunctions);
    } else {
        console.log('✅ すべての必須関数が存在します');
    }
    
    return missingFunctions;
}

// 🆕 安全な関数実行
function safeExecute(functionName, ...args) {
    try {
        if (typeof window[functionName] === 'function') {
            return window[functionName](...args);
        } else {
            console.warn(`⚠️ ${functionName} 関数が存在しません`);
            createFallbackFunction(functionName);
            return window[functionName](...args);
        }
    } catch (error) {
        console.error(`❌ ${functionName} 実行エラー:`, error);
        return null;
    }
}

// 🆕 デバッグ情報表示
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

// 🆕 システム修復機能
function repairSystem() {
    console.log('🔧 システム修復を開始...');
    
    // 1. 基本変数の初期化
    if (typeof panels === 'undefined') window.panels = [];
    if (typeof characters === 'undefined') window.characters = [];
    if (typeof speechBubbles === 'undefined') window.speechBubbles = [];
    if (typeof selectedPanel === 'undefined') window.selectedPanel = null;
    if (typeof selectedCharacter === 'undefined') window.selectedCharacter = null;
    if (typeof selectedBubble === 'undefined') window.selectedBubble = null;
    if (typeof selectedElement === 'undefined') window.selectedElement = null;
    if (typeof isDragging === 'undefined') window.isDragging = false;
    if (typeof dragOffset === 'undefined') window.dragOffset = {x: 0, y: 0};
    if (typeof currentPage === 'undefined') window.currentPage = 1;
    if (typeof currentScene === 'undefined') window.currentScene = 'daily';
    
    // 2. キャンバス要素の再取得
    if (!canvas) {
        canvas = document.getElementById('nameCanvas');
        if (canvas) {
            ctx = canvas.getContext('2d');
            console.log('✅ キャンバス要素を再取得しました');
        }
    }
    
    if (!guideCanvas) {
        guideCanvas = document.getElementById('guidelines');
        if (guideCanvas) {
            guideCtx = guideCanvas.getContext('2d');
            console.log('✅ ガイドキャンバス要素を再取得しました');
        }
    }
    
    // 3. 必須関数の確保
    ensureRequiredFunctions();
    
    // 4. イベントリスナーの再設定
    if (canvas && typeof setupEventListeners === 'function') {
        try {
            setupEventListeners();
            console.log('✅ イベントリスナーを再設定しました');
        } catch (error) {
            console.error('❌ イベントリスナー再設定エラー:', error);
        }
    }
    
    console.log('✅ システム修復完了');
    return showDebugStatus();
}

// 🆕 緊急回復モード
function emergencyRecover() {
    console.log('🚨 緊急回復モードを開始...');
    
    try {
        // すべての選択状態をクリア
        window.selectedPanel = null;
        window.selectedCharacter = null;
        window.selectedBubble = null;
        window.selectedElement = null;
        window.isDragging = false;
        
        // 基本配列の初期化
        if (!Array.isArray(window.panels)) window.panels = [];
        if (!Array.isArray(window.characters)) window.characters = [];
        if (!Array.isArray(window.speechBubbles)) window.speechBubbles = [];
        
        // システム修復
        repairSystem();
        
        // 基本テンプレートの読み込み
        if (window.panels.length === 0) {
            // 最小限のパネルを作成
            window.panels = [
                {id: 1, x: 50, y: 50, width: 500, height: 200},
                {id: 2, x: 50, y: 270, width: 500, height: 200},
                {id: 3, x: 50, y: 490, width: 500, height: 200}
            ];
            console.log('✅ 緊急用パネルを作成しました');
        }
        
        // 表示更新
        safeExecute('redrawCanvas');
        safeExecute('drawGuidelines');
        safeExecute('updateCharacterOverlay');
        safeExecute('updateBubbleOverlay');
        safeExecute('updateElementCount');
        safeExecute('updateStatus');
        
        console.log('✅ 緊急回復完了');
        
        if (typeof showNotification === 'function') {
            showNotification('システムを復旧しました', 'success', 3000);
        } else {
            alert('システムを復旧しました');
        }
        
    } catch (error) {
        console.error('❌ 緊急回復失敗:', error);
        alert('システム復旧に失敗しました。ページを再読み込みしてください。');
    }
}

// グローバル関数として公開
window.attemptErrorRecovery = attemptErrorRecovery;
window.createFallbackFunction = createFallbackFunction;
window.ensureRequiredFunctions = ensureRequiredFunctions;
window.safeExecute = safeExecute;
window.showDebugStatus = showDebugStatus;
window.repairSystem = repairSystem;
window.emergencyRecover = emergencyRecover;

// ページ読み込み完了時に事前チェック実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOMContentLoaded - 事前システムチェック');
    ensureRequiredFunctions();
});

console.log('✅ エラー回復システム 読み込み完了');
console.log('🔧 緊急時コマンド: window.emergencyRecover()');
console.log('🔍 デバッグ用: window.showDebugStatus()');





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
// 🆕 吹き出しリサイズ用変数
let isBubbleResizing = false;
let bubbleResizeStartData = {};

// 🆕 スクロール固定用変数
let originalScrollPosition = { x: 0, y: 0 };
let isScrollLocked = false;

// ===== テンプレート定義 =====
// ===== 完全シーンテンプレート定義 =====
const templates = {
    '4koma': {
        name: '4コマ漫画',
        description: 'オーソドックスな4コマ構成',
        panels: [
            {x: 50, y: 50, width: 500, height: 170, id: 1},
            {x: 50, y: 240, width: 500, height: 170, id: 2},
            {x: 50, y: 430, width: 500, height: 170, id: 3},
            {x: 50, y: 620, width: 500, height: 170, id: 4}
        ],
        characters: [
            {id: 'char_1_1', panelId: 1, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.8, facing: 'right', gaze: 'center', pose: 'standing', expression: 'neutral'},
            {id: 'char_1_2', panelId: 1, type: 'heroine', name: 'ヒロイン', x: 0.7, y: 0.6, scale: 0.8, facing: 'left', gaze: 'center', pose: 'standing', expression: 'neutral'},
            
            {id: 'char_2_1', panelId: 2, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 1.0, facing: 'front', gaze: 'center', pose: 'standing', expression: 'surprised'},
            
            {id: 'char_3_1', panelId: 3, type: 'heroine', name: 'ヒロイン', x: 0.5, y: 0.6, scale: 1.2, facing: 'front', gaze: 'center', pose: 'standing', expression: 'happy'},
            
            {id: 'char_4_1', panelId: 4, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.7, facing: 'right', gaze: 'down', pose: 'standing', expression: 'sad'},
            {id: 'char_4_2', panelId: 4, type: 'heroine', name: 'ヒロイン', x: 0.7, y: 0.6, scale: 0.7, facing: 'left', gaze: 'right', pose: 'standing', expression: 'neutral'}
        ],
        bubbles: [
            {id: 'bubble_1_1', panelId: 1, type: 'normal', text: 'こんにちは！', x: 0.3, y: 0.3, scale: 1.0, width: 80, height: 40},
            {id: 'bubble_1_2', panelId: 1, type: 'normal', text: 'はじめまして', x: 0.7, y: 0.2, scale: 1.0, width: 90, height: 40},
            
            {id: 'bubble_2_1', panelId: 2, type: 'shout', text: 'えーっ！？', x: 0.5, y: 0.2, scale: 1.2, width: 70, height: 45},
            
            {id: 'bubble_3_1', panelId: 3, type: 'normal', text: 'よろしくね♪', x: 0.5, y: 0.2, scale: 1.0, width: 85, height: 40},
            
            {id: 'bubble_4_1', panelId: 4, type: 'whisper', text: 'そうだね...', x: 0.3, y: 0.3, scale: 0.9, width: 75, height: 35}
        ]
    },
    
    'dialogue': {
        name: '会話シーン',
        description: '2人の会話に特化したレイアウト',
        panels: [
            {x: 50, y: 50, width: 500, height: 200, id: 1},
            {x: 50, y: 270, width: 240, height: 200, id: 2},
            {x: 310, y: 270, width: 240, height: 200, id: 3},
            {x: 50, y: 490, width: 500, height: 260, id: 4}
        ],
        characters: [
            {id: 'char_1_1', panelId: 1, type: 'hero', name: '主人公', x: 0.25, y: 0.6, scale: 0.9, facing: 'right', gaze: 'right', pose: 'standing', expression: 'neutral'},
            {id: 'char_1_2', panelId: 1, type: 'heroine', name: 'ヒロイン', x: 0.75, y: 0.6, scale: 0.9, facing: 'left', gaze: 'left', pose: 'standing', expression: 'neutral'},
            
            {id: 'char_2_1', panelId: 2, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 1.2, facing: 'front', gaze: 'center', pose: 'standing', expression: 'happy'},
            
            {id: 'char_3_1', panelId: 3, type: 'heroine', name: 'ヒロイン', x: 0.5, y: 0.6, scale: 1.2, facing: 'front', gaze: 'center', pose: 'standing', expression: 'surprised'},
            
            {id: 'char_4_1', panelId: 4, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.8, facing: 'right', gaze: 'right', pose: 'standing', expression: 'happy'},
            {id: 'char_4_2', panelId: 4, type: 'heroine', name: 'ヒロイン', x: 0.7, y: 0.6, scale: 0.8, facing: 'left', gaze: 'left', pose: 'standing', expression: 'happy'}
        ],
        bubbles: [
            {id: 'bubble_1_1', panelId: 1, type: 'normal', text: '今日はいい天気だね', x: 0.25, y: 0.25, scale: 1.0, width: 120, height: 40},
            {id: 'bubble_1_2', panelId: 1, type: 'normal', text: 'そうですね！', x: 0.75, y: 0.35, scale: 1.0, width: 90, height: 40},
            
            {id: 'bubble_2_1', panelId: 2, type: 'normal', text: 'ところで...', x: 0.5, y: 0.2, scale: 1.0, width: 80, height: 40},
            
            {id: 'bubble_3_1', panelId: 3, type: 'shout', text: 'えっ！？', x: 0.5, y: 0.2, scale: 1.0, width: 60, height: 40},
            
            {id: 'bubble_4_1', panelId: 4, type: 'normal', text: 'よかった〜', x: 0.5, y: 0.2, scale: 1.0, width: 85, height: 40}
        ]
    },
    
    'action': {
        name: 'アクションシーン',
        description: '動きのあるシーンに最適',
        panels: [
            {x: 50, y: 50, width: 200, height: 300, id: 1},
            {x: 270, y: 50, width: 280, height: 180, id: 2},
            {x: 270, y: 250, width: 280, height: 120, id: 3},
            {x: 50, y: 370, width: 500, height: 380, id: 4}
        ],
        characters: [
            {id: 'char_1_1', panelId: 1, type: 'hero', name: '主人公', x: 0.5, y: 0.7, scale: 1.0, facing: 'front', gaze: 'up', pose: 'running', expression: 'neutral'},
            
            {id: 'char_2_1', panelId: 2, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.8, facing: 'right', gaze: 'right', pose: 'pointing', expression: 'angry'},
            {id: 'char_2_2', panelId: 2, type: 'rival', name: 'ライバル', x: 0.7, y: 0.6, scale: 0.8, facing: 'left', gaze: 'left', pose: 'standing', expression: 'angry'},
            
            {id: 'char_3_1', panelId: 3, type: 'rival', name: 'ライバル', x: 0.5, y: 0.6, scale: 1.2, facing: 'front', gaze: 'center', pose: 'standing', expression: 'angry'},
            
            {id: 'char_4_1', panelId: 4, type: 'hero', name: '主人公', x: 0.2, y: 0.6, scale: 0.9, facing: 'right', gaze: 'right', pose: 'running', expression: 'neutral'},
            {id: 'char_4_2', panelId: 4, type: 'rival', name: 'ライバル', x: 0.8, y: 0.6, scale: 0.9, facing: 'left', gaze: 'left', pose: 'running', expression: 'angry'}
        ],
        bubbles: [
            {id: 'bubble_2_1', panelId: 2, type: 'shout', text: '待て！', x: 0.3, y: 0.2, scale: 1.0, width: 60, height: 40},
            {id: 'bubble_2_2', panelId: 2, type: 'normal', text: 'くっ...', x: 0.7, y: 0.3, scale: 0.9, width: 55, height: 35},
            
            {id: 'bubble_3_1', panelId: 3, type: 'shout', text: '逃がすか！', x: 0.5, y: 0.2, scale: 1.2, width: 80, height: 45},
            
            {id: 'bubble_4_1', panelId: 4, type: 'normal', text: 'しまった！', x: 0.2, y: 0.3, scale: 1.0, width: 75, height: 40}
        ]
    },
    
    'emotional': {
        name: '感情シーン',
        description: '表情や感情を重視したレイアウト',
        panels: [
            {x: 50, y: 50, width: 320, height: 300, id: 1},
            {x: 390, y: 50, width: 160, height: 140, id: 2},
            {x: 390, y: 210, width: 160, height: 140, id: 3},
            {x: 50, y: 370, width: 500, height: 380, id: 4}
        ],
        characters: [
            {id: 'char_1_1', panelId: 1, type: 'heroine', name: 'ヒロイン', x: 0.5, y: 0.6, scale: 1.3, facing: 'front', gaze: 'down', pose: 'standing', expression: 'sad'},
            
            {id: 'char_2_1', panelId: 2, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 1.0, facing: 'front', gaze: 'center', pose: 'standing', expression: 'surprised'},
            
            {id: 'char_3_1', panelId: 3, type: 'friend', name: '友人', x: 0.5, y: 0.6, scale: 1.0, facing: 'front', gaze: 'center', pose: 'standing', expression: 'neutral'},
            
            {id: 'char_4_1', panelId: 4, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.9, facing: 'right', gaze: 'right', pose: 'standing', expression: 'happy'},
            {id: 'char_4_2', panelId: 4, type: 'heroine', name: 'ヒロイン', x: 0.7, y: 0.6, scale: 0.9, facing: 'left', gaze: 'left', pose: 'standing', expression: 'happy'}
        ],
        bubbles: [
            {id: 'bubble_1_1', panelId: 1, type: 'thought', text: 'どうしよう...', x: 0.5, y: 0.2, scale: 1.0, width: 90, height: 40},
            
            {id: 'bubble_2_1', panelId: 2, type: 'shout', text: 'あっ！', x: 0.5, y: 0.2, scale: 1.0, width: 50, height: 35},
            
            {id: 'bubble_3_1', panelId: 3, type: 'normal', text: '大丈夫？', x: 0.5, y: 0.2, scale: 0.9, width: 70, height: 35},
            
            {id: 'bubble_4_1', panelId: 4, type: 'normal', text: 'ありがとう', x: 0.5, y: 0.2, scale: 1.0, width: 85, height: 40}
        ]
    },
    
    'gag': {
        name: 'ギャグシーン',
        description: 'コメディに最適な5コマ構成',
        panels: [
            {x: 50, y: 50, width: 500, height: 150, id: 1},
            {x: 50, y: 220, width: 160, height: 200, id: 2},
            {x: 230, y: 220, width: 160, height: 200, id: 3},
            {x: 410, y: 220, width: 140, height: 200, id: 4},
            {x: 50, y: 440, width: 500, height: 310, id: 5}
        ],
        characters: [
            {id: 'char_1_1', panelId: 1, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 0.8, facing: 'front', gaze: 'center', pose: 'standing', expression: 'neutral'},
            
            {id: 'char_2_1', panelId: 2, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 1.0, facing: 'front', gaze: 'center', pose: 'standing', expression: 'surprised'},
            
            {id: 'char_3_1', panelId: 3, type: 'hero', name: '主人公', x: 0.5, y: 0.6, scale: 1.2, facing: 'front', gaze: 'up', pose: 'standing', expression: 'surprised'},
            
            {id: 'char_4_1', panelId: 4, type: 'hero', name: '主人公', x: 0.5, y: 0.7, scale: 1.0, facing: 'front', gaze: 'down', pose: 'standing', expression: 'sad'},
            
            {id: 'char_5_1', panelId: 5, type: 'hero', name: '主人公', x: 0.3, y: 0.6, scale: 0.8, facing: 'right', gaze: 'down', pose: 'standing', expression: 'sad'},
            {id: 'char_5_2', panelId: 5, type: 'friend', name: '友人', x: 0.7, y: 0.6, scale: 0.8, facing: 'left', gaze: 'left', pose: 'standing', expression: 'neutral'}
        ],
        bubbles: [
            {id: 'bubble_1_1', panelId: 1, type: 'normal', text: '今日はテストだ', x: 0.5, y: 0.3, scale: 1.0, width: 100, height: 40},
            
            {id: 'bubble_2_1', panelId: 2, type: 'shout', text: '！？', x: 0.5, y: 0.2, scale: 1.2, width: 40, height: 45},
            
            {id: 'bubble_3_1', panelId: 3, type: 'shout', text: 'やばい！', x: 0.5, y: 0.15, scale: 1.3, width: 70, height: 50},
            
            {id: 'bubble_4_1', panelId: 4, type: 'whisper', text: '勉強してない...', x: 0.5, y: 0.2, scale: 0.9, width: 110, height: 35},
            
            {id: 'bubble_5_1', panelId: 5, type: 'normal', text: 'がんばれよ〜', x: 0.7, y: 0.3, scale: 1.0, width: 90, height: 40}
        ]
    }
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

// ===== main.js エラー修正版 - initializeApp関数 =====

// 🔧 initializeApp関数の修正版（既存の関数を置き換え）
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
    
    // 🔧 修正：正しい関数名を使用
    try {
        // interaction.jsで定義されている関数を呼び出し
        if (typeof setupEventListeners === 'function') {
            setupEventListeners();
            console.log('✅ イベントリスナー設定完了');
        } else {
            console.warn('⚠️ setupEventListeners関数が見つかりません');
            // 手動でイベント設定
            manualSetupEvents();
        }
    } catch (error) {
        console.error('❌ イベント設定エラー:', error);
        // フォールバック
        manualSetupEvents();
    }
    
    // パネル編集機能の初期化
    try {
        if (typeof addPanelEditEvents === 'function') {
            addPanelEditEvents();
            console.log('✅ パネル編集イベント設定完了');
        } else {
            console.warn('⚠️ addPanelEditEvents関数が見つかりません - 後で追加してください');
        }
    } catch (error) {
        console.error('❌ パネル編集イベント設定エラー:', error);
    }
    
    // UI コントロール初期化
    try {
        initializeUIControls();
        console.log('✅ UIコントロール初期化完了');
    } catch (error) {
        console.error('❌ UIコントロール初期化エラー:', error);
    }
    
    // 初期テンプレート読み込み
    try {
        loadTemplate('4koma');
        console.log('✅ 初期テンプレート読み込み完了');
    } catch (error) {
        console.error('❌ テンプレート読み込みエラー:', error);
    }
    
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
    
    // キーボードショートカットヒント表示
    try {
        showKeyboardHints();
    } catch (error) {
        console.warn('⚠️ キーボードヒント表示エラー:', error);
    }
    
    console.log('🎉 初期化完了！');
}

// 🆕 手動イベント設定（フォールバック）
function manualSetupEvents() {
    console.log('🔧 手動イベント設定開始');
    
    // 基本的なキャンバスイベント
    if (canvas) {
        canvas.addEventListener('mousedown', function(e) {
            console.log('🖱️ マウスダウン（基本版）');
            // 基本的な処理のみ
        });
        
        canvas.addEventListener('mousemove', function(e) {
            // マウス位置更新のみ
        });
        
        canvas.addEventListener('mouseup', function(e) {
            console.log('🖱️ マウスアップ（基本版）');
            // 基本的な処理のみ
        });
    }
    
    // キーボードイベント
    document.addEventListener('keydown', function(e) {
        // 基本的なキーボード処理
        if (e.key === 'Escape') {
            console.log('⌨️ Escape - 選択解除');
            if (typeof clearSelection === 'function') {
                clearSelection();
            }
        }
    });
    
    console.log('✅ 手動イベント設定完了');
}

// 🆕 関数存在チェック
function checkRequiredFunctions() {
    const requiredFunctions = [
        'initializeCanvas',
        'initializeUI', 
        'setupEventListeners',
        'addPanelEditEvents',
        'loadTemplate',
        'showKeyboardHints'
    ];
    
    const missingFunctions = [];
    
    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] !== 'function') {
            missingFunctions.push(funcName);
        }
    });
    
    if (missingFunctions.length > 0) {
        console.warn('⚠️ 以下の関数が見つかりません:', missingFunctions);
        console.log('💡 対応方法:');
        missingFunctions.forEach(funcName => {
            console.log(`- ${funcName}: 対応するJSファイルを確認してください`);
        });
    } else {
        console.log('✅ 必要な関数がすべて存在します');
    }
    
    return missingFunctions;
}

// 🆕 安全な初期化（エラー耐性）
function safeInitialize() {
    console.log('🛡️ 安全な初期化開始');
    
    try {
        // 関数存在チェック
        const missingFunctions = checkRequiredFunctions();
        
        // 必須関数が不足している場合の警告
        if (missingFunctions.length > 0) {
            console.warn('❌ 一部の機能が利用できません');
            
            // ユーザーに通知
            if (typeof showNotification === 'function') {
                showNotification('一部の機能が読み込まれていません。コンソールを確認してください。', 'warning', 5000);
            } else {
                alert('一部の機能が読み込まれていません。\nF12キーでコンソールを確認してください。');
            }
        }
        
        // 初期化実行
        initializeApp();
        
    } catch (error) {
        console.error('❌ 初期化中にエラーが発生しました:', error);
        
        // エラー情報をユーザーに表示
        const errorMessage = `初期化エラーが発生しました:\n${error.message}\n\nページを再読み込みしてください。`;
        alert(errorMessage);
    }
}

// 🔧 既存の起動処理を安全版に変更
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitialize);
} else {
    safeInitialize();
}

// 念のため、window.onloadでも実行
window.addEventListener('load', function() {
    if (!canvas) {
        console.log('🔄 Window load時に再初期化');
        safeInitialize();
    }
});

console.log('✅ main.js エラー修正版 読み込み完了');


// 🆕 通知システム実装（ui.jsから移動・簡素化）
function showNotification(message, type = 'info', duration = 3000) {
    // 既存の通知があれば削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // アニメーション
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自動削除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

console.log('✅ パネル編集初期化コード 読み込み完了');

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
        
        // パネルを設定
        panels = JSON.parse(JSON.stringify(template.panels));
        
        // キャラクターを設定（IDを動的に生成）
        characters = template.characters.map(char => ({
            ...char,
            id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            rotation: char.rotation || 0,
            flip: char.flip || false
        }));
        
        // 吹き出しを設定（IDを動的に生成）
        speechBubbles = template.bubbles.map(bubble => ({
            ...bubble,
            id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
        
        // 表示更新
        clearOverlays();
        redrawCanvas();
        drawGuidelines();
        updateCharacterOverlay();
        updateBubbleOverlay();
        updateStatus();
        updateElementCount();
        
        console.log(`✅ シーンテンプレート "${templateName}" 適用完了`);
        console.log(`📊 パネル:${panels.length}, キャラ:${characters.length}, 吹き出し:${speechBubbles.length}`);
        
        // 通知表示
        if (typeof showNotification === 'function') {
            showNotification(`${template.name} を適用しました`, 'success', 2000);
        }
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


// ===== UI初期化・イベント設定 - main.jsに追加 =====

// 🆕 UI要素の初期化（initializeApp関数に追加）
function initializeUIControls() {
    console.log('🎛️ UIコントロール初期化');
    
    // Undo/Redoボタンのイベント設定
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const helpBtn = document.getElementById('helpBtn');
    
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            undo();
            console.log('🖱️ Undoボタンクリック');
        });
    }
    
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            redo();
            console.log('🖱️ Redoボタンクリック');
        });
    }
    
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            showKeyboardHelp();
            console.log('🖱️ ヘルプボタンクリック');
        });
    }
    
    // 初期状態の更新
    updateUndoRedoButtons();
    updateOperationStatus('準備完了');
    updateHistoryStatus();
    updateSelectionStatus('何も選択されていません');
    
    console.log('✅ UIコントロール初期化完了');
}

// 🆕 操作状況の更新
function updateOperationStatus(message, type = 'success') {
    const statusElement = document.getElementById('operationStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-${type}`;
        
        // アニメーション効果
        statusElement.classList.add('status-update');
        setTimeout(() => {
            statusElement.classList.remove('status-update');
        }, 300);
    }
}

// 🆕 履歴状況の更新
function updateHistoryStatus() {
    const historyElement = document.getElementById('historyStatus');
    if (historyElement) {
        const currentPos = currentHistoryIndex + 1;
        const totalOps = operationHistory.length;
        historyElement.textContent = `履歴: ${currentPos}/${totalOps}`;
    }
}

// 🆕 選択状況の更新
function updateSelectionStatus(message) {
    const selectionElement = document.getElementById('selectionStatus');
    if (selectionElement) {
        selectionElement.textContent = message;
    }
}

// 🔄 既存関数の拡張 - 操作時の状況更新
function enhancedSplitPanel(panel, direction) {
    updateOperationStatus('パネル分割中...', 'info');
    
    splitPanel(panel, direction);
    
    updateOperationStatus(`パネル${panel.id}を${direction === 'horizontal' ? '横' : '縦'}に分割しました`);
    updateHistoryStatus();
}

function enhancedDeletePanel(panel) {
    updateOperationStatus('パネル削除中...', 'warning');
    
    deletePanel(panel);
    
    updateOperationStatus(`パネル${panel.id}を削除しました`);
    updateHistoryStatus();
    updateSelectionStatus('何も選択されていません');
}

function enhancedDuplicatePanel(panel) {
    updateOperationStatus('パネル複製中...', 'info');
    
    duplicatePanel(panel);
    
    updateOperationStatus(`パネル${panel.id}を複製しました`);
    updateHistoryStatus();
}

function enhancedRotatePanel(panel) {
    updateOperationStatus('パネル回転中...', 'info');
    
    rotatePanel(panel);
    
    updateOperationStatus(`パネル${panel.id}を90度回転しました`);
    updateHistoryStatus();
}

// 🔄 選択処理の拡張
function enhancedSelectPanel(panel) {
    selectedPanel = panel;
    selectedCharacter = null;
    selectedBubble = null;
    selectedElement = null;
    
    redrawCanvas();
    drawGuidelines();
    updateStatus();
    
    updateSelectionStatus(`パネル${panel.id}を選択中`);
    updateOperationStatus('パネルが選択されました');
}

function enhancedSelectCharacter(character) {
    selectedCharacter = character;
    selectedBubble = null;
    selectedPanel = null;
    selectedElement = character;
    
    updateCharacterOverlay();
    updateControlsFromElement();
    updateStatus();
    
    updateSelectionStatus(`キャラクター「${character.name}」を選択中`);
    updateOperationStatus('キャラクターが選択されました');
}

function enhancedSelectBubble(bubble) {
    selectedBubble = bubble;
    selectedCharacter = null;
    selectedPanel = null;
    selectedElement = bubble;
    
    updateBubbleOverlay();
    updateControlsFromElement();
    updateStatus();
    
    const shortText = bubble.text.length > 20 ? 
        bubble.text.substring(0, 20) + '...' : 
        bubble.text;
    updateSelectionStatus(`吹き出し「${shortText}」を選択中`);
    updateOperationStatus('吹き出しが選択されました');
}

function enhancedClearSelection() {
    selectedPanel = null;
    selectedCharacter = null;
    selectedBubble = null;
    selectedElement = null;
    
    redrawCanvas();
    drawGuidelines();
    updateCharacterOverlay();
    updateBubbleOverlay();
    updateStatus();
    
    updateSelectionStatus('何も選択されていません');
    updateOperationStatus('選択を解除しました');
}

// 🆕 Undo/Redo時の状況更新
function enhancedUndo() {
    if (currentHistoryIndex < 0) {
        updateOperationStatus('元に戻す操作がありません', 'warning');
        return;
    }
    
    const operation = operationHistory[currentHistoryIndex];
    undo();
    
    updateOperationStatus(`${operation.type}を元に戻しました`);
    updateHistoryStatus();
}

function enhancedRedo() {
    if (currentHistoryIndex >= operationHistory.length - 1) {
        updateOperationStatus('やり直す操作がありません', 'warning');
        return;
    }
    
    const operation = operationHistory[currentHistoryIndex + 1];
    redo();
    
    updateOperationStatus(`${operation.type}をやり直しました`);
    updateHistoryStatus();
}

// 🆕 吹き出し編集開始時の状況更新
function enhancedStartBubbleEdit(element, bubble) {
    updateOperationStatus('吹き出し編集モード', 'info');
    updateSelectionStatus(`編集中: 「${bubble.text}」`);
    
    startBubbleEdit(element, bubble);
}

// 🆕 プロジェクト保存時の状況更新
function enhancedSaveProject() {
    updateOperationStatus('保存中...', 'info');
    
    saveProject();
    
    updateOperationStatus('プロジェクトを保存しました');
}

// 🆕 テンプレート読み込み時の状況更新
function enhancedLoadTemplate(templateName) {
    updateOperationStatus(`テンプレート「${templateName}」読み込み中...`, 'info');
    
    loadTemplate(templateName);
    
    updateOperationStatus(`テンプレート「${templateName}」を適用しました`);
    updateSelectionStatus('何も選択されていません');
}

// 🆕 エラー処理の強化
function handleError(message, error) {
    console.error('❌', message, error);
    updateOperationStatus(`エラー: ${message}`, 'error');
    
    // エラー通知
    showNotification(`エラーが発生しました: ${message}`, 'error', 4000);
}

// 🆕 デバッグ情報表示
function showDebugInfo() {
    const debugInfo = {
        panels: panels.length,
        characters: characters.length,
        speechBubbles: speechBubbles.length,
        selectedPanel: selectedPanel?.id || 'なし',
        selectedCharacter: selectedCharacter?.name || 'なし',
        selectedBubble: selectedBubble?.text?.substring(0, 20) || 'なし',
        historyLength: operationHistory.length,
        currentIndex: currentHistoryIndex
    };
    
    console.table(debugInfo);
    updateOperationStatus('デバッグ情報をコンソールに出力しました', 'info');
}

// 🆕 パフォーマンス監視
function startPerformanceMonitoring() {
    setInterval(() => {
        const memoryInfo = performance.memory;
        if (memoryInfo) {
            const usedMB = (memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(1);
            
            // メモリ使用量が100MBを超えた場合の警告
            if (usedMB > 100) {
                console.warn(`⚠️ メモリ使用量が高くなっています: ${usedMB}MB`);
                updateOperationStatus(`メモリ使用量: ${usedMB}MB`, 'warning');
            }
        }
    }, 30000); // 30秒ごとにチェック
}

// 🆕 既存関数をラップして機能強化
function wrapExistingFunctions() {
    // 元の関数を保存
    const originalSelectPanel = selectPanel;
    const originalSelectCharacter = selectCharacter;
    const originalSelectBubble = selectBubble;
    const originalClearSelection = clearSelection;
    const originalUndo = undo;
    const originalRedo = redo;
    
    // 拡張版に置き換え
    selectPanel = enhancedSelectPanel;
    selectCharacter = enhancedSelectCharacter;
    selectBubble = enhancedSelectBubble;
    clearSelection = enhancedClearSelection;
    undo = enhancedUndo;
    redo = enhancedRedo;
    
    console.log('🔄 既存関数を機能強化版にラップしました');
}

console.log('✅ UI初期化・イベント設定 読み込み完了');
