// グローバル状態
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

// テンプレート定義
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

// 初期化
window.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('nameCanvas');
    ctx = canvas.getContext('2d');
    guideCanvas = document.getElementById('guidelines');
    guideCtx = guideCanvas.getContext('2d');
    
    setupEventListeners();
    loadTemplate('4koma');
    updateElementCount();
    
    // マウス位置表示
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        document.getElementById('mousePos').textContent = `マウス位置: (${x}, ${y})`;
    });
});

// イベントリスナー設定
function setupEventListeners() {
    // キャンバスイベント
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    // シーン選択
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            analyzeScene(this.dataset.scene);
        });
    });
    
    // 推奨設定適用
    document.getElementById('applyRecommendation').addEventListener('click', applyRecommendation);
    
    // テンプレート選択
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', function() {
            loadTemplate(this.dataset.template);
        });
    });
    
    // キャラ配置パターン
    document.querySelectorAll('.pattern-card').forEach(card => {
        card.addEventListener('click', function() {
            applyCharacterLayout(this.dataset.layout);
        });
    });
    
    // キャラクター追加
    document.querySelectorAll('.char-item').forEach(item => {
        item.addEventListener('click', function() {
            addCharacter(this.dataset.char);
        });
    });
    
    // 吹き出し追加
    document.querySelectorAll('.bubble-btn').forEach(btn => {
        if (btn.id === 'autoPlaceBubbles') {
            btn.addEventListener('click', autoPlaceBubbles);
        } else {
            btn.addEventListener('click', function() {
                addBubble(this.dataset.bubble);
            });
        }
    });
    
    // 詳細調整
    document.getElementById('elementScale').addEventListener('input', updateSelectedElement);
    document.getElementById('elementX').addEventListener('input', updateSelectedElement);
    document.getElementById('elementY').addEventListener('input', updateSelectedElement);
    
    // 削除
    document.getElementById('deleteSelected').addEventListener('click', deleteSelected);
    
    // ガイド表示
    document.getElementById('showGuides').addEventListener('change', toggleGuides);
    
    // 出力機能
    document.getElementById('exportToClipStudio').addEventListener('click', exportToClipStudio);
    document.getElementById('exportToPDF').addEventListener('click', exportToPDF);
    document.getElementById('exportToPNG').addEventListener('click', exportToPNG);
    document.getElementById('saveProject').addEventListener('click', saveProject);
}

// シーン分析
function analyzeScene(sceneType) {
    currentScene = sceneType;
    
    // アクティブ状態更新
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-scene="${sceneType}"]`).classList.add('active');
    
    // 推奨設定表示
    const recommendation = sceneRecommendations[sceneType];
    document.getElementById('sceneRecommendation').style.display = 'block';
    document.getElementById('recommendationContent').innerHTML = `
        <div style="margin-bottom:6px;"><strong>推奨テンプレート:</strong> ${recommendation.template}</div>
        <div style="margin-bottom:6px;"><strong>キャラ配置:</strong> ${recommendation.layout}</div>
        <div style="margin-bottom:6px;"><strong>カメラワーク:</strong> ${recommendation.cameraWork}</div>
        <div style="color:#666; font-size:9px;">${recommendation.tips}</div>
    `;
}

// 推奨設定適用
function applyRecommendation() {
    const recommendation = sceneRecommendations[currentScene];
    if (recommendation) {
        loadTemplate(recommendation.template);
        setTimeout(() => {
            if (selectedPanel) {
                applyCharacterLayout(recommendation.layout);
            }
        }, 100);
        
        document.getElementById('cameraWork').value = recommendation.cameraWork;
    }
}

// テンプレート読み込み
function loadTemplate(templateName) {
    console.log('loadTemplate called:', templateName); // デバッグ用
    console.log('characters before clear:', characters.length); // デバッグ用
    
    // アクティブ状態更新
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-template="${templateName}"]`).classList.add('active');
    
    if (templates[templateName]) {
        panels = JSON.parse(JSON.stringify(templates[templateName]));
        // キャラクターとセリフをクリア（新しいテンプレート時のみ）
        // characters = [];  // これを一時的にコメントアウト
        // speechBubbles = [];  // これを一時的にコメントアウト
        clearOverlays();
        redrawCanvas();
        drawGuidelines();
        updateStatus();
        updateElementCount();
        
        console.log('template loaded, characters:', characters.length); // デバッグ用
    }
}

// キャンバス再描画
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // パネル描画
    panels.forEach(panel => {
        drawPanel(panel, panel === selectedPanel);
    });
}

// パネル描画
function drawPanel(panel, isSelected = false) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    ctx.strokeStyle = isSelected ? '#ff8833' : (isDark ? '#e0e0e0' : '#000000');
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.fillStyle = isDark ? 'rgba(64, 64, 64, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    
    // パネル枠
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
    
    // パネル番号
    ctx.fillStyle = isSelected ? '#ff8833' : (isDark ? '#b0b0b0' : '#666666');
    ctx.font = '14px Arial';
    ctx.fillText(`${panel.id}`, panel.x + 10, panel.y + 25);
}

// ガイドライン描画
function drawGuidelines() {
    if (!document.getElementById('showGuides').checked) return;
    
    guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
    guideCtx.strokeStyle = '#00ff00';
    guideCtx.lineWidth = 1;
    guideCtx.setLineDash([2, 2]);
    
    panels.forEach(panel => {
        const thirdX = panel.width / 3;
        const thirdY = panel.height / 3;
        
        // 縦線
        guideCtx.beginPath();
        guideCtx.moveTo(panel.x + thirdX, panel.y);
        guideCtx.lineTo(panel.x + thirdX, panel.y + panel.height);
        guideCtx.moveTo(panel.x + thirdX * 2, panel.y);
        guideCtx.lineTo(panel.x + thirdX * 2, panel.y + panel.height);
        guideCtx.stroke();
        
        // 横線
        guideCtx.beginPath();
        guideCtx.moveTo(panel.x, panel.y + thirdY);
        guideCtx.lineTo(panel.x + panel.width, panel.y + thirdY);
        guideCtx.moveTo(panel.x, panel.y + thirdY * 2);
        guideCtx.lineTo(panel.x + panel.width, panel.y + thirdY * 2);
        guideCtx.stroke();
    });
    
    guideCtx.setLineDash([]);
}

// マウスイベント処理
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // キャラクターまたは吹き出しがクリックされたかチェック
    const clickedCharacter = findCharacterAt(x, y);
    const clickedBubble = findBubbleAt(x, y);
    
    if (clickedCharacter) {
        selectedCharacter = clickedCharacter;
        selectedBubble = null;
        selectedElement = clickedCharacter;
        isDragging = true;
        
        const panel = panels.find(p => p.id === clickedCharacter.panelId);
        dragOffset.x = x - (panel.x + panel.width * clickedCharacter.x);
        dragOffset.y = y - (panel.y + panel.height * clickedCharacter.y);
        
        updateControlsFromElement();
        return;
    }
    
    if (clickedBubble) {
        selectedBubble = clickedBubble;
        selectedCharacter = null;
        selectedElement = clickedBubble;
        isDragging = true;
        
        const panel = panels.find(p => p.id === clickedBubble.panelId);
        dragOffset.x = x - (panel.x + panel.width * clickedBubble.x);
        dragOffset.y = y - (panel.y + panel.height * clickedBubble.y);
        
        updateControlsFromElement();
        return;
    }
    
    // パネルがクリックされたかチェック
    const clickedPanel = findPanelAt(x, y);
    if (clickedPanel) {
        selectPanel(clickedPanel);
        selectedCharacter = null;
        selectedBubble = null;
        selectedElement = null;
    }
}

function handleMouseMove(e) {
    if (!isDragging || !selectedElement) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const panel = panels.find(p => p.id === selectedElement.panelId);
    if (!panel) return;
    
    // パネル内の相対位置に変換
    const newX = (x - dragOffset.x - panel.x) / panel.width;
    const newY = (y - dragOffset.y - panel.y) / panel.height;
    
    // パネル内に制限
    selectedElement.x = Math.max(0, Math.min(1, newX));
    selectedElement.y = Math.max(0, Math.min(1, newY));
    
    // 表示更新
    if (selectedCharacter) {
        updateCharacterOverlay();
    } else if (selectedBubble) {
        updateBubbleOverlay();
    }
    
    updateControlsFromElement();
}

function handleMouseUp(e) {
    isDragging = false;
}

// 要素検索関数
function findCharacterAt(x, y) {
    console.log('searching characters at:', x, y); // デバッグ用
    console.log('total characters:', characters.length); // デバッグ用
    
    for (let i = characters.length - 1; i >= 0; i--) {
        const character = characters[i];
        const panel = panels.find(p => p.id === character.panelId);
        if (!panel) continue;
        
        const charX = panel.x + (panel.width * character.x) - 30;
        const charY = panel.y + (panel.height * character.y) - 20;
        const charWidth = 60 * character.scale;
        const charHeight = 40 * character.scale;
        
        console.log(`character ${i}:`, {charX, charY, charWidth, charHeight}); // デバッグ用
        
        if (x >= charX && x <= charX + charWidth && 
            y >= charY && y <= charY + charHeight) {
            console.log('found character:', character); // デバッグ用
            return character;
        }
    }
    console.log('no character found'); // デバッグ用
    return null;
}

function findBubbleAt(x, y) {
    for (let i = speechBubbles.length - 1; i >= 0; i--) {
        const bubble = speechBubbles[i];
        const panel = panels.find(p => p.id === bubble.panelId);
        if (!panel) continue;
        
        const bubbleX = panel.x + (panel.width * bubble.x) - (bubble.width * bubble.scale / 2);
        const bubbleY = panel.y + (panel.height * bubble.y) - (bubble.height * bubble.scale / 2);
        const bubbleWidth = bubble.width * bubble.scale;
        const bubbleHeight = bubble.height * bubble.scale;
        
        if (x >= bubbleX && x <= bubbleX + bubbleWidth && 
            y >= bubbleY && y <= bubbleY + bubbleHeight) {
            return bubble;
        }
    }
    return null;
}

function findPanelAt(x, y) {
    return panels.find(panel => 
        x >= panel.x && x <= panel.x + panel.width &&
        y >= panel.y && y <= panel.y + panel.height
    );
}

// キャラクター配置パターン適用
function applyCharacterLayout(layoutName) {
    if (!selectedPanel || !characterLayouts[layoutName]) return;
    
    // 既存のキャラクターをクリア（選択されたパネルのみ）
    characters = characters.filter(char => char.panelId !== selectedPanel.id);
    
    // 新しいレイアウトを適用
    const layout = characterLayouts[layoutName];
    layout.forEach((pos, index) => {
        const character = {
            id: `char_${Date.now()}_${index}`,
            panelId: selectedPanel.id,
            type: 'placeholder',
            name: `キャラ${index + 1}`,
            ...pos
        };
        characters.push(character);
    });
    
    updateCharacterOverlay();
    updateStatus();
    updateElementCount();
}

// キャラクター追加
function addCharacter(type) {
    if (!selectedPanel) {
        alert('まずコマを選択してください');
        return;
    }
    
    const character = {
        id: `char_${Date.now()}`,
        panelId: selectedPanel.id,
        type: type,
        name: getCharacterName(type),
        x: 0.5,
        y: 0.6,
        scale: 0.8,
        rotation: 0,
        flip: false
    };
    
    characters.push(character);
    updateCharacterOverlay();
    updateStatus();
    updateElementCount();
}

// 吹き出し追加
function addBubble(bubbleType) {
    if (!selectedPanel) {
        alert('まずコマを選択してください');
        return;
    }
    
    const dialogueText = document.getElementById('dialogueText').value.trim();
    if (!dialogueText && bubbleType !== 'narration') {
        alert('セリフを入力してください');
        return;
    }
    
    const bubble = {
        id: `bubble_${Date.now()}`,
        panelId: selectedPanel.id,
        type: bubbleType,
        text: dialogueText || 'テキスト',
        x: 0.5,
        y: 0.3,
        scale: 1.0,
        width: Math.max(60, dialogueText.length * 8 + 20),
        height: 40
    };
    
    speechBubbles.push(bubble);
    updateBubbleOverlay();
    
    // テキストエリアをクリア
    document.getElementById('dialogueText').value = '';
    updateStatus();
    updateElementCount();
}

// 自動吹き出し配置
function autoPlaceBubbles() {
    if (!selectedPanel) {
        alert('まずコマを選択してください');
        return;
    }
    
    const panelBubbles = speechBubbles.filter(b => b.panelId === selectedPanel.id);
    const panelCharacters = characters.filter(c => c.panelId === selectedPanel.id);
    
    panelBubbles.forEach((bubble, index) => {
        if (panelCharacters.length > 0) {
            const character = panelCharacters[index % panelCharacters.length];
            bubble.x = character.x;
            bubble.y = Math.max(0.1, character.y - 0.3);
        } else {
            bubble.x = 0.2 + (index * 0.3);
            bubble.y = 0.2;
        }
    });
    
    updateBubbleOverlay();
}

// キャラクター名取得
function getCharacterName(type) {
    const names = {
        'hero': '主人公',
        'heroine': 'ヒロイン',
        'rival': 'ライバル',
        'friend': '友人'
    };
    return names[type] || 'キャラクター';
}

// キャラクターオーバーレイ更新
function updateCharacterOverlay() {
    const overlay = document.getElementById('characterOverlay');
    overlay.innerHTML = '';
    
    characters.forEach(character => {
        const panel = panels.find(p => p.id === character.panelId);
        if (!panel) return;
        
        const element = document.createElement('div');
        element.className = 'character-placeholder';
        if (selectedCharacter === character) {
            element.classList.add('selected');
        }
        element.dataset.charId = character.id;
        element.textContent = character.name;
        
        // 位置とサイズ計算
        const charX = panel.x + (panel.width * character.x) - 30;
        const charY = panel.y + (panel.height * character.y) - 20;
        const charWidth = 60 * character.scale;
        const charHeight = 40 * character.scale;
        
        element.style.left = charX + 'px';
        element.style.top = charY + 'px';
        element.style.width = charWidth + 'px';
        element.style.height = charHeight + 'px';
        element.style.cursor = 'move';
        
        if (character.rotation) {
            element.style.transform = `rotate(${character.rotation}deg)`;
        }
        
        if (character.flip) {
            element.style.transform += ' scaleX(-1)';
        }
        
        // イベントリスナー
        element.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            selectCharacter(character);
        });
        
        overlay.appendChild(element);
    });
}

// 吹き出しオーバーレイ更新
function updateBubbleOverlay() {
    const overlay = document.getElementById('bubbleOverlay');
    overlay.innerHTML = '';
    
    speechBubbles.forEach(bubble => {
        const panel = panels.find(p => p.id === bubble.panelId);
        if (!panel) return;
        
        const element = document.createElement('div');
        element.className = `speech-bubble ${bubble.type}`;
        if (selectedBubble === bubble) {
            element.classList.add('selected');
        }
        element.dataset.bubbleId = bubble.id;
        element.textContent = bubble.text;
        
        // 位置とサイズ計算
        const bubbleX = panel.x + (panel.width * bubble.x) - (bubble.width * bubble.scale / 2);
        const bubbleY = panel.y + (panel.height * bubble.y) - (bubble.height * bubble.scale / 2);
        
        element.style.left = bubbleX + 'px';
        element.style.top = bubbleY + 'px';
        element.style.width = (bubble.width * bubble.scale) + 'px';
        element.style.height = (bubble.height * bubble.scale) + 'px';
        element.style.cursor = 'move';
        
        // 吹き出しの尻尾を追加
        if (bubble.type !== 'narration') {
            const tail = document.createElement('div');
            tail.className = 'bubble-tail bottom-left';
            element.appendChild(tail);
        }
        
        // イベントリスナー
        element.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            selectBubble(bubble);
        });
        
        overlay.appendChild(element);
    });
}

// 選択関数
function selectCharacter(character) {
    selectedCharacter = character;
    selectedBubble = null;
    selectedElement = character;
    updateCharacterOverlay();
    updateControlsFromElement();
    updateStatus();
}

function selectBubble(bubble) {
    selectedBubble = bubble;
    selectedCharacter = null;
    selectedElement = bubble;
    updateBubbleOverlay();
    updateControlsFromElement();
    updateStatus();
}

function selectPanel(panel) {
    selectedPanel = panel;
    redrawCanvas();
    drawGuidelines();
    updateStatus();
}

// コントロール更新
function updateControlsFromElement() {
    if (!selectedElement) return;
    
    document.getElementById('elementScale').value = selectedElement.scale || 1.0;
    document.getElementById('elementX').value = selectedElement.x || 0.5;
    document.getElementById('elementY').value = selectedElement.y || 0.5;
    
    if (selectedCharacter) {
        document.getElementById('elementType').value = 'character';
    } else if (selectedBubble) {
        document.getElementById('elementType').value = 'bubble';
    }
}

// 選択された要素更新
function updateSelectedElement() {
    if (!selectedElement) return;
    
    selectedElement.scale = parseFloat(document.getElementById('elementScale').value);
    selectedElement.x = parseFloat(document.getElementById('elementX').value);
    selectedElement.y = parseFloat(document.getElementById('elementY').value);
    
    if (selectedCharacter) {
        updateCharacterOverlay();
    } else if (selectedBubble) {
        updateBubbleOverlay();
    }
}

// 選択要素削除
function deleteSelected() {
    if (selectedCharacter) {
        characters = characters.filter(char => char.id !== selectedCharacter.id);
        selectedCharacter = null;
        updateCharacterOverlay();
    } else if (selectedBubble) {
        speechBubbles = speechBubbles.filter(bubble => bubble.id !== selectedBubble.id);
        selectedBubble = null;
        updateBubbleOverlay();
    }
    
    selectedElement = null;
    updateStatus();
    updateElementCount();
}

// オーバーレイクリア
function clearOverlays() {
    document.getElementById('characterOverlay').innerHTML = '';
    document.getElementById('bubbleOverlay').innerHTML = '';
}

// ガイドライン表示切り替え
function toggleGuides() {
    drawGuidelines();
}

// 要素数更新
function updateElementCount() {
    const totalElements = characters.length + speechBubbles.length;
    document.getElementById('elementCount').textContent = `要素数: ${totalElements}`;
}

// ステータス更新
function updateStatus() {
    const selectedInfo = document.getElementById('selectedInfo');
    const panelInfo = document.getElementById('panelInfo');
    
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

// 出力機能
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
    
    console.log('クリスタ用データ:', projectData);
    
    const jsonData = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `name_project_page${currentPage}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    alert('クリスタ用プロジェクトデータを出力しました！');
}

function exportToPDF() {
    alert('PDF出力機能は開発中です。現在はPNG出力をご利用ください。');
}

function exportToPNG() {
    const link = document.createElement('a');
    link.download = `name_page${currentPage}.png`;
    link.href = canvas.toDataURL();
    link.click();
    alert('PNG画像として保存しました！');
}

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
    alert('プロジェクトを保存しました！');
}

// キーボードショートカット
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                saveProject();
                break;
            case 'e':
                e.preventDefault();
                exportToClipStudio();
                break;
        }
    }
    
    if (e.key === 'Delete' && selectedElement) {
        deleteSelected();
    }
});



// 手動でダークモード機能を追加
function manualToggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
    
    if (newTheme === 'dark') {
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#e0e0e0';
        document.getElementById('themeToggle').textContent = '☀️ ライトモード';
    } else {
        document.body.style.backgroundColor = '#f0f0f0';
        document.body.style.color = '#333';
        document.getElementById('themeToggle').textContent = '🌙 ダークモード';
    }
    
    localStorage.setItem('theme', newTheme);
    console.log('Theme changed to:', newTheme);
}

// ボタンにイベント追加
document.getElementById('themeToggle').onclick = manualToggleTheme;

console.log('Manual dark mode setup complete');


// 初期化実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
