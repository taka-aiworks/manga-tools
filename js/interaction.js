// interaction.jsに以下の関数を追加：

// 🔄 完全置き換え：startResize関数
function startResize(e, character, position) {
    console.log('🔄 リサイズ開始:', character.name, position);
    
    // 最優先でイベント停止
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // ページ全体を完全にロック
    enablePageLock();
    
    isResizing = true;
    selectedElement = character;
    selectedCharacter = character;
    
    const rect = canvas.getBoundingClientRect();
    const coords = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    const panel = panels.find(p => p.id === character.panelId);
    if (!panel) {
        disablePageLock();
        return;
    }
    
    resizeStartData = {
        character: character,
        position: position,
        startX: coords.x,
        startY: coords.y,
        startScale: character.scale,
        startCharX: character.x,
        startCharY: character.y,
        panel: panel
    };
    
    // グローバルイベントリスナーを最高優先度で設定
    document.addEventListener('mousemove', handleResizeGlobal, { 
        passive: false, 
        capture: true 
    });
    document.addEventListener('mouseup', endResizeGlobal, { 
        passive: false, 
        capture: true 
    });
    
    // ウィンドウレベルでも監視
    window.addEventListener('mousemove', handleResizeGlobal, { 
        passive: false, 
        capture: true 
    });
    window.addEventListener('mouseup', endResizeGlobal, { 
        passive: false, 
        capture: true 
    });
    
    // すべてのスクロールイベントを停止
    window.addEventListener('scroll', preventAllScroll, { passive: false, capture: true });
    document.addEventListener('wheel', preventAllScroll, { passive: false, capture: true });
    document.addEventListener('touchmove', preventAllScroll, { passive: false, capture: true });
    
    console.log('🔒 ページ完全ロック開始');
}

// 🆕 新規：ページ完全ロック
function enablePageLock() {
    // 現在のスクロール位置を保存
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    // ページを完全に固定
    document.body.classList.add('resize-mode');
    document.documentElement.classList.add('resize-mode');
    
    // スタイルを直接適用（CSSより確実）
    const lockStyles = {
        position: 'fixed',
        top: `-${scrollY}px`,
        left: `-${scrollX}px`,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
        webkitUserSelect: 'none',
        mozUserSelect: 'none',
        msUserSelect: 'none'
    };
    
    Object.assign(document.body.style, lockStyles);
    Object.assign(document.documentElement.style, {
        overflow: 'hidden',
        position: 'fixed',
        width: '100%',
        height: '100%'
    });
    
    // 保存された位置を記録
    document.body.dataset.scrollX = scrollX;
    document.body.dataset.scrollY = scrollY;
}

// 🆕 新規：ページロック解除
function disablePageLock() {
    // 保存されたスクロール位置を復元
    const scrollX = parseInt(document.body.dataset.scrollX || '0');
    const scrollY = parseInt(document.body.dataset.scrollY || '0');
    
    // ロッククラスを削除
    document.body.classList.remove('resize-mode');
    document.documentElement.classList.remove('resize-mode');
    
    // スタイルをリセット
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.overflow = '';
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.mozUserSelect = '';
    document.body.style.msUserSelect = '';
    
    document.documentElement.style.overflow = '';
    document.documentElement.style.position = '';
    document.documentElement.style.width = '';
    document.documentElement.style.height = '';
    
    // スクロール位置を復元
    window.scrollTo(scrollX, scrollY);
    
    // データ属性をクリア
    delete document.body.dataset.scrollX;
    delete document.body.dataset.scrollY;
}

// 🆕 新規：すべてのスクロールを防止
function preventAllScroll(e) {
    if (isResizing) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }
}

// 🆕 新規追加：スクロール防止関数
function preventScroll(e) {
    if (isResizing) {
        e.preventDefault();
        return false;
    }
}



// ===== リサイズ感度調整版 - handleResizeGlobal関数のみ置き換え =====

function handleResizeGlobal(e) {
    if (!isResizing || !resizeStartData.character) return;
    
    // 最優先でイベント停止
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    const rect = canvas.getBoundingClientRect();
    const coords = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    const data = resizeStartData;
    const deltaX = coords.x - data.startX;
    const deltaY = coords.y - data.startY;
    
    let scaleChange = 0;
    let positionChangeX = 0;
    let positionChangeY = 0;
    
    // 🎯 感度を上げる（0.001 → 0.003）
    const sensitivity = 0.005;
    // 🎯 位置変更の感度も上げる（0.2 → 0.4）
    const positionSensitivity = 0.6;
    
    switch (data.position) {
        case 'bottom-right':
            scaleChange = (deltaX + deltaY) * sensitivity;
            break;
            
        case 'top-left':
            scaleChange = -(deltaX + deltaY) * sensitivity;
            positionChangeX = deltaX / data.panel.width * positionSensitivity;
            positionChangeY = deltaY / data.panel.height * positionSensitivity;
            break;
            
        case 'top-right':
            scaleChange = (deltaX - deltaY) * sensitivity;
            positionChangeY = deltaY / data.panel.height * positionSensitivity;
            break;
            
        case 'bottom-left':
            scaleChange = (-deltaX + deltaY) * sensitivity;
            positionChangeX = deltaX / data.panel.width * positionSensitivity;
            break;
            
        case 'right':
            scaleChange = deltaX * sensitivity;
            break;
            
        case 'left':
            scaleChange = -deltaX * sensitivity;
            positionChangeX = deltaX / data.panel.width * positionSensitivity;
            break;
            
        case 'bottom':
            scaleChange = deltaY * sensitivity;
            break;
            
        case 'top':
            scaleChange = -deltaY * sensitivity;
            positionChangeY = deltaY / data.panel.height * positionSensitivity;
            break;
    }
    
    const newScale = Math.max(0.2, Math.min(3.0, data.startScale + scaleChange));
    const newX = Math.max(0.05, Math.min(0.95, data.startCharX + positionChangeX));
    const newY = Math.max(0.05, Math.min(0.95, data.startCharY + positionChangeY));
    
    data.character.scale = newScale;
    data.character.x = newX;
    data.character.y = newY;
    
    updateCharacterOverlay();
    updateControlsFromElement();
    
    // 🎯 リアルタイム感度表示（デバッグ用）
    if (localStorage.getItem('debugMode') === 'true') {
        console.log(`📏 Scale: ${newScale.toFixed(3)}, Delta: ${deltaX.toFixed(1)}, ${deltaY.toFixed(1)}`);
    }
    
    return false;
}

// 🎯 感度調整用のヘルパー関数（オプション）
window.adjustResizeSensitivity = function(newSensitivity) {
    console.log(`🎚️ リサイズ感度を ${newSensitivity} に調整`);
    // この値をhandleResizeGlobal内で使用する場合
    window.customSensitivity = newSensitivity;
};

console.log('✅ リサイズ感度調整版 適用完了');
console.log('🎚️ 現在の感度: スケール=0.003, 位置=0.4');


// 🔄 完全置き換え：endResize → endResizeGlobal
function endResizeGlobal(e) {
    if (!isResizing) return;
    
    console.log('🔓 リサイズ終了 - ページロック解除');
    
    isResizing = false;
    resizeStartData = {};
    
    // ページロック解除
    disablePageLock();
    
    // すべてのイベントリスナーを削除
    document.removeEventListener('mousemove', handleResizeGlobal, { capture: true });
    document.removeEventListener('mouseup', endResizeGlobal, { capture: true });
    window.removeEventListener('mousemove', handleResizeGlobal, { capture: true });
    window.removeEventListener('mouseup', endResizeGlobal, { capture: true });
    window.removeEventListener('scroll', preventAllScroll, { capture: true });
    document.removeEventListener('wheel', preventAllScroll, { capture: true });
    document.removeEventListener('touchmove', preventAllScroll, { capture: true });
    
    updateControlsFromElement();
}


// 🆕 新規追加：吹き出しドラッグイベント追加
function addBubbleDragEvents(element, bubble, panel) {
    let clickCount = 0;
    
    element.addEventListener('mousedown', function(e) {
        clickCount++;
        console.log('💬 吹き出しクリック:', bubble.text.substring(0, 10));
        
        e.stopPropagation();
        e.preventDefault();
        
        setTimeout(() => { clickCount = 0; }, 200);
        
        if (clickCount > 1) return;
        if (isDragging) return;
        
        selectBubble(bubble);
        
        isDragging = true;
        selectedElement = bubble;
        
        const coords = getCanvasCoordinates(e);
        dragOffset.x = coords.x - (panel.x + panel.width * bubble.x);
        dragOffset.y = coords.y - (panel.y + panel.height * bubble.y);
        
        console.log('🚀 吹き出しドラッグ開始');
    });
    
    element.addEventListener('dblclick', function(e) {
        console.log('💬 ダブルクリック - ドラッグ強制終了');
        e.stopPropagation();
        isDragging = false;
        selectedElement = null;
    });
}

// 🆕 新規追加：吹き出し選択関数
function selectBubble(bubble) {
    selectedBubble = bubble;
    selectedCharacter = null;
    selectedPanel = null;
    selectedElement = bubble;
    updateBubbleOverlay();
    updateControlsFromElement();
    updateStatus();
    
    console.log('💬 吹き出し選択:', bubble.text.substring(0, 15));
}


// 🔄 強化版：forceEndDrag
window.forceEndDrag = function() {
    console.log('🛑 強制ドラッグ終了');
    
    // ドラッグ状態リセット
    isDragging = false;
    selectedElement = null;
    isResizing = false;
    resizeStartData = {};
    
    // ページロック解除
    disablePageLock();
    
    // すべてのイベントリスナーを削除
    document.removeEventListener('mousemove', handleResizeGlobal, { capture: true });
    document.removeEventListener('mouseup', endResizeGlobal, { capture: true });
    window.removeEventListener('mousemove', handleResizeGlobal, { capture: true });
    window.removeEventListener('mouseup', endResizeGlobal, { capture: true });
    window.removeEventListener('scroll', preventAllScroll, { capture: true });
    document.removeEventListener('wheel', preventAllScroll, { capture: true });
    document.removeEventListener('touchmove', preventAllScroll, { capture: true });
};



// 🆕 新規追加：ESCキーで強制終了
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && (isDragging || isResizing)) {
        window.forceEndDrag();
    }
});




// ===== インタラクションモジュール =====

function initializeInteraction() {
    console.log('🖱️ インタラクションモジュール初期化');
    setupEventListeners();
}

// ===== イベントリスナー設定 =====
// setupEventListeners関数を修正
function setupEventListeners() {
    console.log('📋 イベントリスナー設定中...');
    
    if (!canvas) {
        console.error('❌ キャンバス要素が見つかりません');
        return;
    }
    
    // キャンバスイベント
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    // ===== 追加：より確実なmouseup処理 =====
    document.addEventListener('mouseup', function(e) {
        if (isDragging) {
            console.log('🖱️ ドキュメントmouseup - ドラッグ強制終了');
            isDragging = false;
            selectedElement = null;
        }
    });
    
    // ===== 追加：キーボードでドラッグ終了 =====
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isDragging) {
            console.log('⌨️ ESCキー - ドラッグ強制終了');
            isDragging = false;
            selectedElement = null;
        }
    });
    
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
        } else if (btn.dataset.bubble) {
            btn.addEventListener('click', function() {
                addBubble(this.dataset.bubble);
            });
        }
    });
    
    // シーン選択
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            analyzeScene(this.dataset.scene);
        });
    });
    
    // 推奨設定適用
    const applyBtn = document.getElementById('applyRecommendation');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyRecommendation);
    }
    
    // 詳細調整
    const elementScale = document.getElementById('elementScale');
    const elementX = document.getElementById('elementX');
    const elementY = document.getElementById('elementY');
    
    if (elementScale) elementScale.addEventListener('input', updateSelectedElement);
    if (elementX) elementX.addEventListener('input', updateSelectedElement);
    if (elementY) elementY.addEventListener('input', updateSelectedElement);
    
    // 削除ボタン
    const deleteBtn = document.getElementById('deleteSelected');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteSelected);
    }
    
    // ガイド表示切り替え
    const showGuides = document.getElementById('showGuides');
    if (showGuides) {
        showGuides.addEventListener('change', toggleGuides);
    }
    
    // 出力機能
    const exportBtns = {
        'exportToClipStudio': exportToClipStudio,
        'exportToPDF': exportToPDF,
        'exportToPNG': exportToPNG,
        'saveProject': saveProject
    };
    
    Object.entries(exportBtns).forEach(([id, handler]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
        }
    });
    
    // キーボードショートカット
    document.addEventListener('keydown', handleKeyDown);
    
    console.log('✅ イベントリスナー設定完了');
}


function createCharacterElement(character, panel) {
    const element = document.createElement('div');
    element.className = 'character-placeholder';
    element.dataset.charId = character.id;
    element.textContent = character.name;
    
    // 初期位置設定
    updateCharacterElementPosition(element, character, panel);
    element.style.cursor = 'move';
    
    // ===== イベントリスナー =====
    element.addEventListener('mousedown', function(e) {
        console.log('👤 キャラクタークリック:', character.name, 'isDragging:', isDragging);
        e.stopPropagation();
        e.preventDefault();
        
        // 既にドラッグ中なら強制リセット
        if (isDragging) {
            console.log('⚠️ ドラッグ状態強制リセット');
            isDragging = false;
            selectedElement = null;
        }
        
        selectCharacter(character);
        
        // ドラッグ開始
        isDragging = true;
        selectedElement = character;
        
        const coords = getCanvasCoordinates(e);
        dragOffset.x = coords.x - (panel.x + panel.width * character.x);
        dragOffset.y = coords.y - (panel.y + panel.height * character.y);
        
        console.log('🚀 ドラッグ開始');
        
        // ===== 追加：タイムアウトでドラッグ強制終了 =====
        setTimeout(() => {
            if (isDragging) {
                console.log('⏰ タイムアウト - ドラッグ強制終了');
                isDragging = false;
                selectedElement = null;
            }
        }, 5000); // 5秒後に強制終了
    });
    
    // ===== 追加：ダブルクリックでドラッグ強制終了 =====
    element.addEventListener('dblclick', function(e) {
        console.log('👤 ダブルクリック - ドラッグ強制終了');
        e.stopPropagation();
        isDragging = false;
        selectedElement = null;
    });
    
    return element;
}




// ===== マウスイベント処理 =====
function handleMouseDown(e) {
    console.log('🖱️ マウスダウン at:', e.target.className);
    
    // キャラクター要素に直接クリックされた場合はスキップ
    if (e.target.classList.contains('character-placeholder')) {
        console.log('🎯 キャラクター要素 - キャンバス処理スキップ');
        return;
    }
    
    // 吹き出し要素に直接クリックされた場合もスキップ
    if (e.target.classList.contains('speech-bubble')) {
        console.log('🎯 吹き出し要素 - キャンバス処理スキップ');
        return;
    }
    
    // 以下、既存のキャンバス処理...
    const coords = getCanvasCoordinates(e);
    const x = coords.x;
    const y = coords.y;
    
    // パネルがクリックされたかチェック
    const clickedPanel = findPanelAt(x, y);
    if (clickedPanel) {
        if (e.shiftKey) {
            console.log('📐 パネルドラッグモード:', clickedPanel.id);
            selectPanel(clickedPanel);
            startDragging(e, clickedPanel);
        } else {
            console.log('📐 パネル選択:', clickedPanel.id);
            selectPanel(clickedPanel);
        }
        return;
    }
    
    // 何もクリックされていない場合は選択解除
    clearSelection();
}

function handleMouseMove(e) {
    if (!isDragging || !selectedElement) return;
    
    const coords = getCanvasCoordinates(e);
    const x = coords.x;
    const y = coords.y;
    
    // パネルの場合
    if (selectedElement.id && panels.includes(selectedElement)) {
        dragPanel(selectedElement, x, y);
        return;
    }
    
    // キャラクターまたは吹き出しの場合
    if (selectedElement.panelId) {
        dragElement(selectedElement, x, y);
    }
}

function handleMouseUp(e) {
    if (isDragging) {
        console.log('🖱️ ドラッグ終了');
        isDragging = false;
        selectedElement = null; // 追加
    }
}

function handleCanvasClick(e) {
    if (isDragging) return;
    
    // クリック処理はmousedownで行うため、ここでは特に何もしない
}

// ===== ドラッグ処理 =====
function startDragging(e, element) {
    isDragging = true;
    selectedElement = element;
    
    const coords = getCanvasCoordinates(e);
    
    if (element.id && panels.includes(element)) {
        // パネルの場合
        dragOffset.x = coords.x - element.x;
        dragOffset.y = coords.y - element.y;
    } else if (element.panelId) {
        // キャラクターまたは吹き出しの場合
        const panel = panels.find(p => p.id === element.panelId);
        if (panel) {
            dragOffset.x = coords.x - (panel.x + panel.width * element.x);
            dragOffset.y = coords.y - (panel.y + panel.height * element.y);
        }
    }
}

function dragPanel(panel, x, y) {
    panel.x = x - dragOffset.x;
    panel.y = y - dragOffset.y;
    
    // キャンバス内に制限
    panel.x = Math.max(0, Math.min(canvas.width - panel.width, panel.x));
    panel.y = Math.max(0, Math.min(canvas.height - panel.height, panel.y));
    
    redrawCanvas();
    drawGuidelines();
    updateCharacterOverlay();
    updateBubbleOverlay();
    updateStatus();
}

function dragElement(element, x, y) {
    const panel = panels.find(p => p.id === element.panelId);
    if (!panel) return;
    
    // パネル内の相対位置に変換
    const newX = (x - dragOffset.x - panel.x) / panel.width;
    const newY = (y - dragOffset.y - panel.y) / panel.height;
    
    // パネル内に制限
    element.x = Math.max(0, Math.min(1, newX));
    element.y = Math.max(0, Math.min(1, newY));
    
    // 表示更新
    if (selectedCharacter) {
        updateCharacterOverlay();
    } else if (selectedBubble) {
        updateBubbleOverlay();
    }
    
    updateControlsFromElement();
}

// ===== 要素検索関数 =====
function findCharacterAt(x, y) {
    for (let i = characters.length - 1; i >= 0; i--) {
        const character = characters[i];
        if (isCharacterAtPosition(character, x, y)) {
            return character;
        }
    }
    return null;
}

function findBubbleAt(x, y) {
    for (let i = speechBubbles.length - 1; i >= 0; i--) {
        const bubble = speechBubbles[i];
        if (isBubbleAtPosition(bubble, x, y)) {
            return bubble;
        }
    }
    return null;
}

function findPanelAt(x, y) {
    return panels.find(panel => isPointInPanel(x, y, panel));
}

// ===== 位置判定ヘルパー =====
function isCharacterAtPosition(character, x, y) {
    const panel = panels.find(p => p.id === character.panelId);
    if (!panel) return false;
    
    const charX = panel.x + (panel.width * character.x) - 30;
    const charY = panel.y + (panel.height * character.y) - 20;
    const charWidth = 60 * character.scale;
    const charHeight = 40 * character.scale;
    
    return x >= charX && x <= charX + charWidth && 
           y >= charY && y <= charY + charHeight;
}

function isBubbleAtPosition(bubble, x, y) {
    const panel = panels.find(p => p.id === bubble.panelId);
    if (!panel) return false;
    
    const bubbleX = panel.x + (panel.width * bubble.x) - (bubble.width * bubble.scale / 2);
    const bubbleY = panel.y + (panel.height * bubble.y) - (bubble.height * bubble.scale / 2);
    const bubbleWidth = bubble.width * bubble.scale;
    const bubbleHeight = bubble.height * bubble.scale;
    
    return x >= bubbleX && x <= bubbleX + bubbleWidth && 
           y >= bubbleY && y <= bubbleY + bubbleHeight;
}

// ===== 選択処理 =====
function selectCharacter(character) {
    selectedCharacter = character;
    selectedBubble = null;
    selectedPanel = null;
    selectedElement = character;
    updateCharacterOverlay();
    updateControlsFromElement();
    updateStatus();
}

function selectBubble(bubble) {
    selectedBubble = bubble;
    selectedCharacter = null;
    selectedPanel = null;
    selectedElement = bubble;
    updateBubbleOverlay();
    updateControlsFromElement();
    updateStatus();
}

function selectPanel(panel) {
    selectedPanel = panel;
    selectedCharacter = null;
    selectedBubble = null;
    selectedElement = null;
    redrawCanvas();
    drawGuidelines();
    updateStatus();
}

function clearSelection() {
    selectedPanel = null;
    selectedCharacter = null;
    selectedBubble = null;
    selectedElement = null;
    redrawCanvas();
    drawGuidelines();
    updateCharacterOverlay();
    updateBubbleOverlay();
    updateStatus();
}

// ===== コントロール更新 =====
function updateControlsFromElement() {
    if (!selectedElement) return;
    
    const scaleEl = document.getElementById('elementScale');
    const xEl = document.getElementById('elementX');
    const yEl = document.getElementById('elementY');
    const typeEl = document.getElementById('elementType');
    const characterSettings = document.getElementById('characterSettings');
    
    if (scaleEl) scaleEl.value = selectedElement.scale || 1.0;
    if (xEl) xEl.value = selectedElement.x || 0.5;
    if (yEl) yEl.value = selectedElement.y || 0.5;
    
    if (typeEl && selectedCharacter) {
        typeEl.value = 'character';
        
        // キャラクター設定パネルを表示
        if (characterSettings) {
            characterSettings.style.display = 'block';
            
            // 現在の設定値を反映
            const facingEl = document.getElementById('characterFacing');
            const gazeEl = document.getElementById('characterGaze');
            const poseEl = document.getElementById('characterPose');
            const expressionEl = document.getElementById('characterExpression');
            
            if (facingEl) facingEl.value = selectedCharacter.facing || 'front';
            if (gazeEl) gazeEl.value = selectedCharacter.gaze || 'center';
            if (poseEl) poseEl.value = selectedCharacter.pose || 'standing';
            if (expressionEl) expressionEl.value = selectedCharacter.expression || 'neutral';
        }
    } else {
        if (characterSettings) {
            characterSettings.style.display = 'none';
        }
        if (typeEl) typeEl.value = 'bubble';
    }
}

function updateSelectedElement() {
    if (!selectedElement) return;
    
    const scaleEl = document.getElementById('elementScale');
    const xEl = document.getElementById('elementX');
    const yEl = document.getElementById('elementY');
    
    if (scaleEl) selectedElement.scale = parseFloat(scaleEl.value);
    if (xEl) selectedElement.x = parseFloat(xEl.value);
    if (yEl) selectedElement.y = parseFloat(yEl.value);
    
    if (selectedCharacter) {
        updateCharacterOverlay();
    } else if (selectedBubble) {
        updateBubbleOverlay();
    }
    
    updateStatus();
}

// ===== 削除処理 =====
function deleteSelected() {
    if (selectedCharacter) {
        characters = characters.filter(char => char.id !== selectedCharacter.id);
        selectedCharacter = null;
        updateCharacterOverlay();
        console.log('👤 キャラクター削除');
    } else if (selectedBubble) {
        speechBubbles = speechBubbles.filter(bubble => bubble.id !== selectedBubble.id);
        selectedBubble = null;
        updateBubbleOverlay();
        console.log('💬 吹き出し削除');
    }
    
    selectedElement = null;
    updateStatus();
    updateElementCount();
}

// ===== シーン分析 =====
function analyzeScene(sceneType) {
    currentScene = sceneType;
    
    console.log('🎭 シーン分析:', sceneType);
    
    // アクティブ状態更新
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const targetBtn = document.querySelector(`[data-scene="${sceneType}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // 推奨設定表示
    if (sceneRecommendations[sceneType]) {
        showSceneRecommendation(sceneType);
    }
}

function showSceneRecommendation(sceneType) {
    const recommendation = sceneRecommendations[sceneType];
    const panel = document.getElementById('sceneRecommendation');
    const content = document.getElementById('recommendationContent');
    
    if (panel && content) {
        panel.style.display = 'block';
        content.innerHTML = `
            <div style="margin-bottom:6px;"><strong>推奨テンプレート:</strong> ${recommendation.template}</div>
            <div style="margin-bottom:6px;"><strong>キャラ配置:</strong> ${recommendation.layout}</div>
            <div style="margin-bottom:6px;"><strong>カメラワーク:</strong> ${recommendation.cameraWork}</div>
            <div style="color:#666; font-size:9px;">${recommendation.tips}</div>
        `;
    }
}

function applyRecommendation() {
    const recommendation = sceneRecommendations[currentScene];
    if (!recommendation) return;
    
    console.log('✨ 推奨設定適用:', currentScene);
    
    // テンプレート適用
    loadTemplate(recommendation.template);
    
    // キャラ配置適用（少し遅延させる）
    setTimeout(() => {
        if (selectedPanel) {
            applyCharacterLayout(recommendation.layout);
        }
    }, 100);
    
    // カメラワーク設定
    const cameraWorkEl = document.getElementById('cameraWork');
    if (cameraWorkEl) {
        cameraWorkEl.value = recommendation.cameraWork;
    }
}

// ===== キーボードショートカット（編集機能付き） =====
function handleKeyDown(e) {
    // Ctrl/Cmd キーとの組み合わせ
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                saveProject();
                break;
            case 'e':
                e.preventDefault();
                exportToClipStudio();
                break;
            case 'z':
                e.preventDefault();
                // Undo機能（将来実装）
                console.log('🔄 Undo (未実装)');
                break;
            case 'y':
                e.preventDefault();
                // Redo機能（将来実装）
                console.log('🔄 Redo (未実装)');
                break;
        }
        return;
    }
    
    // 単体キー
    switch(e.key) {
        case 'Delete':
        case 'Backspace':
            if (selectedElement) {
                deleteSelected();
            }
            break;
        case 'Escape':
            clearSelection();
            break;
        case 'g':
            // ガイド表示切り替え
            const showGuides = document.getElementById('showGuides');
            if (showGuides) {
                showGuides.checked = !showGuides.checked;
                toggleGuides();
            }
            break;
            
        // 🆕 吹き出し編集機能を追加
        case 'e':
            // E キーで選択された吹き出しを編集
            if (selectedBubble) {
                e.preventDefault();
                const bubbleElement = document.querySelector(`[data-bubble-id="${selectedBubble.id}"]`);
                if (bubbleElement) {
                    console.log('⌨️ Eキーで編集開始:', selectedBubble.text);
                    startBubbleEdit(bubbleElement, selectedBubble);
                } else {
                    console.warn('⚠️ 吹き出し要素が見つかりません');
                }
            } else {
                console.log('ℹ️ 編集する吹き出しを選択してください');
            }
            break;
            
        case 'E':
            // Shift+E で選択パネル内の全吹き出しを一括編集
            if (e.shiftKey && selectedPanel) {
                e.preventDefault();
                console.log('⌨️ Shift+Eで一括編集:', selectedPanel.id);
                editAllBubblesInPanel(selectedPanel.id);
            }
            break;
    }
}
// ===== 出力機能 =====
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
    
    console.log('🎨 クリスタ用データ出力:', projectData);
    
    const jsonData = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `name_project_page${currentPage}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    alert('🎉 クリスタ用プロジェクトデータを出力しました！');
}

function exportToPDF() {
    alert('📄 PDF出力機能は開発中です。現在はPNG出力をご利用ください。');
}

function exportToPNG() {
    const link = document.createElement('a');
    link.download = `name_page${currentPage}.png`;
    link.href = canvas.toDataURL();
    link.click();
    alert('🖼️ PNG画像として保存しました！');
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
    console.log('💾 プロジェクト保存完了');
    alert('💾 プロジェクトを保存しました！');
}


// 🆕 リサイズハンドル作成時の改良
function addResizeHandles(element, character) {
    const handles = [
        'top-left', 'top-right', 'bottom-left', 'bottom-right',
        'top', 'bottom', 'left', 'right'
    ];
    
    handles.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${position}`;
        handle.dataset.position = position;
        
        // 強化されたリサイズイベント
        handle.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation(); // 追加
            
            console.log('🎯 リサイズハンドルクリック:', position);
            startResize(e, character, position);
        }, { passive: false, capture: true }); // capture: true を追加
        
        // タッチイベントも対応
        handle.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation();
            
            // タッチをマウスイベントに変換
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: false,
                cancelable: true
            });
            
            startResize(mouseEvent, character, position);
        }, { passive: false, capture: true });
        
        element.appendChild(handle);
    });
}

console.log('✅ 強化版リサイズ修正 読み込み完了');

console.log('✅ interaction.js 読み込み完了');
