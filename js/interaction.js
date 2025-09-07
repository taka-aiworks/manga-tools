// ===== コンテキストメニュー改善版 + Undo/Redo機能 =====

// 🆕 操作履歴管理
let operationHistory = [];
let currentHistoryIndex = -1;
const MAX_HISTORY = 50;

// 🆕 操作履歴に追加
function addToHistory(operation) {
    // 現在位置より後の履歴を削除
    operationHistory = operationHistory.slice(0, currentHistoryIndex + 1);
    
    // 新しい操作を追加
    operationHistory.push({
        ...operation,
        timestamp: Date.now()
    });
    
    // 最大履歴数を超えた場合は古いものを削除
    if (operationHistory.length > MAX_HISTORY) {
        operationHistory.shift();
    } else {
        currentHistoryIndex++;
    }
    
    console.log(`📝 履歴追加: ${operation.type} (${currentHistoryIndex + 1}/${operationHistory.length})`);
    updateUndoRedoButtons();
}

// 🆕 Undo機能
function undo() {
    if (currentHistoryIndex < 0) {
        console.log('❌ Undo: 履歴がありません');
        showNotification('元に戻す操作がありません', 'warning', 2000);
        return;
    }
    
    const operation = operationHistory[currentHistoryIndex];
    console.log(`⏪ Undo実行: ${operation.type}`);
    
    switch (operation.type) {
        case 'split':
            undoSplit(operation);
            break;
        case 'delete':
            undoDelete(operation);
            break;
        case 'duplicate':
            undoDuplicate(operation);
            break;
        case 'rotate':
            undoRotate(operation);
            break;
        case 'resize':
            undoResize(operation);
            break;
    }
    
    currentHistoryIndex--;
    updateUndoRedoButtons();
    updateDisplay();
    showNotification(`${operation.type}を元に戻しました`, 'success', 2000);
}

// 🆕 Redo機能
function redo() {
    if (currentHistoryIndex >= operationHistory.length - 1) {
        console.log('❌ Redo: やり直す操作がありません');
        showNotification('やり直す操作がありません', 'warning', 2000);
        return;
    }
    
    currentHistoryIndex++;
    const operation = operationHistory[currentHistoryIndex];
    console.log(`⏩ Redo実行: ${operation.type}`);
    
    switch (operation.type) {
        case 'split':
            redoSplit(operation);
            break;
        case 'delete':
            redoDelete(operation);
            break;
        case 'duplicate':
            redoDuplicate(operation);
            break;
        case 'rotate':
            redoRotate(operation);
            break;
        case 'resize':
            redoResize(operation);
            break;
    }
    
    updateUndoRedoButtons();
    updateDisplay();
    showNotification(`${operation.type}をやり直しました`, 'success', 2000);
}

// 🔄 改良版パネル右クリックメニュー表示（視認性改善）
function showPanelContextMenu(e, panel) {
    // 既存のメニューを削除
    const existingMenu = document.querySelector('.panel-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.className = 'panel-context-menu';
    
    // テーマ検出
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    menu.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        background: ${isDark ? '#2d2d2d' : 'white'};
        color: ${isDark ? '#e0e0e0' : '#333'};
        border: 2px solid #667eea;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,${isDark ? '0.6' : '0.3'});
        z-index: 9999;
        min-width: 200px;
        font-size: 13px;
        overflow: hidden;
        backdrop-filter: blur(10px);
        animation: contextMenuSlideIn 0.2s ease;
    `;
    
    const menuItems = [
        { 
            text: '📐 横に分割', 
            action: () => splitPanelWithHistory(panel, 'horizontal'),
            key: 'H'
        },
        { 
            text: '📏 縦に分割', 
            action: () => splitPanelWithHistory(panel, 'vertical'),
            key: 'V'
        },
        { 
            text: '📋 複製', 
            action: () => duplicatePanelWithHistory(panel),
            key: 'D'
        },
        { 
            text: '🔄 90度回転', 
            action: () => rotatePanelWithHistory(panel),
            key: 'R'
        },
        { 
            text: '📏 サイズ調整', 
            action: () => startPanelResize(panel),
            key: 'S'
        },
        { text: '─────────', action: null }, // 区切り線
        { 
            text: '🗑️ 削除', 
            action: () => deletePanelWithHistory(panel), 
            className: 'delete-item',
            key: 'Del'
        },
        { 
            text: '❌ キャンセル', 
            action: () => closeContextMenu(),
            key: 'Esc'
        }
    ];
    
    menuItems.forEach(item => {
        if (item.text === '─────────') {
            const divider = document.createElement('div');
            divider.style.cssText = `
                height: 1px;
                background: ${isDark ? '#444' : '#eee'};
                margin: 4px 0;
            `;
            menu.appendChild(divider);
            return;
        }
        
        const menuItem = document.createElement('div');
        menuItem.className = `menu-item ${item.className || ''}`;
        
        menuItem.innerHTML = `
            <span class="menu-text">${item.text}</span>
            ${item.key ? `<span class="menu-key">${item.key}</span>` : ''}
        `;
        
        menuItem.style.cssText = `
            padding: 10px 16px;
            cursor: pointer;
            border-bottom: 1px solid ${isDark ? '#444' : '#eee'};
            transition: all 0.2s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
        `;
        
        menuItem.addEventListener('click', () => {
            if (item.action) {
                item.action();
            }
            closeContextMenu();
        });
        
        menuItem.addEventListener('mouseenter', () => {
            if (item.className === 'delete-item') {
                menuItem.style.background = isDark ? '#4a2c2c' : '#ffebee';
                menuItem.style.color = isDark ? '#ff6b6b' : '#d32f2f';
            } else {
                menuItem.style.background = isDark ? '#404040' : '#f0f4ff';
                menuItem.style.transform = 'translateX(4px)';
            }
        });
        
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.background = '';
            menuItem.style.color = isDark ? '#e0e0e0' : '#333';
            menuItem.style.transform = '';
        });
        
        menu.appendChild(menuItem);
    });
    
    document.body.appendChild(menu);
    
    // クリック外で閉じる
    setTimeout(() => {
        document.addEventListener('click', closeContextMenu, { once: true });
    }, 100);
}

// 🆕 履歴付き操作関数
function splitPanelWithHistory(panel, direction) {
    const originalPanel = JSON.parse(JSON.stringify(panel));
    
    splitPanel(panel, direction);
    
    addToHistory({
        type: 'split',
        originalPanel: originalPanel,
        newPanelId: Math.max(...panels.map(p => p.id)),
        direction: direction
    });
}

function deletePanelWithHistory(panel) {
    const originalPanel = JSON.parse(JSON.stringify(panel));
    const originalElements = {
        characters: characters.filter(c => c.panelId === panel.id),
        bubbles: speechBubbles.filter(b => b.panelId === panel.id)
    };
    
    deletePanel(panel);
    
    addToHistory({
        type: 'delete',
        originalPanel: originalPanel,
        originalElements: originalElements
    });
}

function duplicatePanelWithHistory(panel) {
    const originalPanelCount = panels.length;
    
    duplicatePanel(panel);
    
    const newPanel = panels[panels.length - 1];
    addToHistory({
        type: 'duplicate',
        originalPanel: JSON.parse(JSON.stringify(panel)),
        newPanel: JSON.parse(JSON.stringify(newPanel))
    });
}

function rotatePanelWithHistory(panel) {
    const originalPanel = JSON.parse(JSON.stringify(panel));
    
    rotatePanel(panel);
    
    addToHistory({
        type: 'rotate',
        panelId: panel.id,
        originalPanel: originalPanel,
        newPanel: JSON.parse(JSON.stringify(panel))
    });
}

// 🆕 Undo操作の実装
function undoSplit(operation) {
    // 新しく作成されたパネルを削除
    panels = panels.filter(p => p.id !== operation.newPanelId);
    
    // 元のパネルを復元
    const originalPanel = panels.find(p => p.id === operation.originalPanel.id);
    if (originalPanel) {
        Object.assign(originalPanel, operation.originalPanel);
    }
}

function undoDelete(operation) {
    // パネルを復元
    panels.push(operation.originalPanel);
    
    // 要素も復元
    characters.push(...operation.originalElements.characters);
    speechBubbles.push(...operation.originalElements.bubbles);
}

function undoDuplicate(operation) {
    // 複製されたパネルを削除
    panels = panels.filter(p => p.id !== operation.newPanel.id);
    
    // 複製された要素も削除（必要に応じて）
    characters = characters.filter(c => c.panelId !== operation.newPanel.id);
    speechBubbles = speechBubbles.filter(b => b.panelId !== operation.newPanel.id);
}

function undoRotate(operation) {
    const panel = panels.find(p => p.id === operation.panelId);
    if (panel) {
        Object.assign(panel, operation.originalPanel);
    }
}

// 🆕 Redo操作の実装
function redoSplit(operation) {
    splitPanel(panels.find(p => p.id === operation.originalPanel.id), operation.direction);
}

function redoDelete(operation) {
    deletePanel(panels.find(p => p.id === operation.originalPanel.id));
}

function redoDuplicate(operation) {
    duplicatePanel(panels.find(p => p.id === operation.originalPanel.id));
}

function redoRotate(operation) {
    const panel = panels.find(p => p.id === operation.panelId);
    if (panel) {
        Object.assign(panel, operation.newPanel);
    }
}

// 🆕 表示更新
function updateDisplay() {
    redrawCanvas();
    drawGuidelines();
    updateCharacterOverlay();
    updateBubbleOverlay();
    updateElementCount();
}

// 🆕 Undo/Redoボタンの状態更新
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
        undoBtn.disabled = currentHistoryIndex < 0;
        undoBtn.title = currentHistoryIndex >= 0 ? 
            `元に戻す: ${operationHistory[currentHistoryIndex]?.type}` : 
            '元に戻す操作がありません';
    }
    
    if (redoBtn) {
        redoBtn.disabled = currentHistoryIndex >= operationHistory.length - 1;
        redoBtn.title = currentHistoryIndex < operationHistory.length - 1 ? 
            `やり直し: ${operationHistory[currentHistoryIndex + 1]?.type}` : 
            'やり直す操作がありません';
    }
}

console.log('✅ コンテキストメニュー改善 + Undo/Redo機能 読み込み完了');


// interaction.jsに以下の関数を追加：

// 🔄 強化版startResize関数（完全置き換え）
function startResize(e, character, position) {
    console.log('🔄 リサイズ開始:', character.name, position);
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // スクロール位置を完全に固定
    lockScrollPosition();
    
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
        unlockScrollPosition();
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
    
    // より確実なイベント捕捉
    const options = { passive: false, capture: true };
    
    document.addEventListener('mousemove', handleResizeStable, options);
    document.addEventListener('mouseup', endResizeStable, options);
    window.addEventListener('mousemove', handleResizeStable, options);
    window.addEventListener('mouseup', endResizeStable, options);
    
    // 追加のスクロール防止
    document.addEventListener('wheel', preventAllInteraction, options);
    document.addEventListener('touchmove', preventAllInteraction, options);
    document.addEventListener('keydown', preventAllInteraction, options);
    
    console.log('🔒 完全リサイズモード開始');
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



// 🔄 安定版handleResize関数
function handleResizeStable(e) {
    if (!isResizing || !resizeStartData.character) return;
    
    e.preventDefault();
    e.stopImmediatePropagation();
    
    // スクロール位置を強制的に維持
    if (window.scrollX !== originalScrollPosition.x || window.scrollY !== originalScrollPosition.y) {
        window.scrollTo(originalScrollPosition.x, originalScrollPosition.y);
    }
    
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
    
    const sensitivity = 0.005;          // 高速調整
    const positionSensitivity = 0.6;    // 高速調整
    
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
    
    // 表示更新（スクロールを起こさないよう注意）
    requestAnimationFrame(() => {
        updateCharacterOverlay();
        updateControlsFromElement();
    });
    
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




// ===== interaction.js - 関数名統一修正 =====

// 🔧 既存のinitializeInteraction関数を正しい名前に変更
function initializeInteraction() {
    console.log('🖱️ インタラクションモジュール初期化');
    setupEventListeners();
}

// 🔧 setupEventListeners関数が存在することを確認
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
            if (typeof loadTemplate === 'function') {
                loadTemplate(this.dataset.template);
            } else {
                console.error('❌ loadTemplate関数が見つかりません');
            }
        });
    });
    
    // キャラ配置パターン
    document.querySelectorAll('.pattern-card').forEach(card => {
        card.addEventListener('click', function() {
            if (typeof applyCharacterLayout === 'function') {
                applyCharacterLayout(this.dataset.layout);
            } else {
                console.error('❌ applyCharacterLayout関数が見つかりません');
            }
        });
    });
    
    // キャラクター追加
    document.querySelectorAll('.char-item').forEach(item => {
        item.addEventListener('click', function() {
            if (typeof addCharacter === 'function') {
                addCharacter(this.dataset.char);
            } else {
                console.error('❌ addCharacter関数が見つかりません');
            }
        });
    });
    
    // 吹き出し追加
    document.querySelectorAll('.bubble-btn').forEach(btn => {
        if (btn.id === 'autoPlaceBubbles') {
            btn.addEventListener('click', function() {
                if (typeof autoPlaceBubbles === 'function') {
                    autoPlaceBubbles();
                } else {
                    console.error('❌ autoPlaceBubbles関数が見つかりません');
                }
            });
        } else if (btn.dataset.bubble) {
            btn.addEventListener('click', function() {
                if (typeof addBubble === 'function') {
                    addBubble(this.dataset.bubble);
                } else {
                    console.error('❌ addBubble関数が見つかりません');
                }
            });
        }
    });
    
    // シーン選択
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (typeof analyzeScene === 'function') {
                analyzeScene(this.dataset.scene);
            } else {
                console.error('❌ analyzeScene関数が見つかりません');
            }
        });
    });
    
    // 推奨設定適用
    const applyBtn = document.getElementById('applyRecommendation');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            if (typeof applyRecommendation === 'function') {
                applyRecommendation();
            } else {
                console.error('❌ applyRecommendation関数が見つかりません');
            }
        });
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
        showGuides.addEventListener('change', function() {
            if (typeof toggleGuides === 'function') {
                toggleGuides();
            } else {
                console.error('❌ toggleGuides関数が見つかりません');
            }
        });
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
        if (btn && typeof handler === 'function') {
            btn.addEventListener('click', handler);
        } else if (btn) {
            console.warn(`⚠️ ${id}のハンドラー関数が見つかりません`);
        }
    });
    
    // キーボードショートカット
    document.addEventListener('keydown', function(e) {
        if (typeof handleKeyDown === 'function') {
            handleKeyDown(e);
        } else {
            console.error('❌ handleKeyDown関数が見つかりません');
        }
    });
    
    console.log('✅ イベントリスナー設定完了');
}

// 🆕 関数存在チェック用のヘルパー
function checkFunction(funcName, context = 'setupEventListeners') {
    if (typeof window[funcName] !== 'function') {
        console.warn(`⚠️ ${context}: ${funcName}関数が見つかりません`);
        return false;
    }
    return true;
}

// 🆕 安全な関数呼び出し
function safeCall(funcName, ...args) {
    if (typeof window[funcName] === 'function') {
        try {
            return window[funcName](...args);
        } catch (error) {
            console.error(`❌ ${funcName}実行エラー:`, error);
        }
    } else {
        console.warn(`⚠️ ${funcName}関数が存在しません`);
    }
}

// 🔧 互換性を保つためのエイリアス
window.initializeInteraction = initializeInteraction;
window.setupEventListeners = setupEventListeners;



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

// ===== キーボード操作強化版 - handleKeyDown関数完全版 =====
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
                if (e.shiftKey) {
                    // Ctrl+Shift+Z または Cmd+Shift+Z でRedo
                    redo();
                    console.log('⏩ Ctrl+Shift+Z: Redo実行');
                } else {
                    // Ctrl+Z または Cmd+Z でUndo
                    undo();
                    console.log('⏪ Ctrl+Z: Undo実行');
                }
                break;
                
            case 'y':
                e.preventDefault();
                // Ctrl+Y または Cmd+Y でRedo（Windows標準）
                redo();
                console.log('⏩ Ctrl+Y: Redo実行');
                break;
                
            case 'd':
                e.preventDefault();
                // Ctrl+D でパネル複製
                if (selectedPanel) {
                    duplicatePanelWithHistory(selectedPanel);
                    console.log('⌨️ Ctrl+D: パネル複製');
                }
                break;
        }
        return;
    }
    
    // 単体キー
    switch(e.key) {
        case 'Delete':
            if (selectedPanel) {
                e.preventDefault();
                console.log('⌨️ Delete: パネル削除');
                deletePanelWithHistory(selectedPanel);
            } else if (selectedElement) {
                console.log('⌨️ Delete: 要素削除');
                deleteSelected();
            }
            break;
            
        case 'Backspace':
            // 🆕 Backspaceでも削除可能
            if (selectedPanel) {
                e.preventDefault();
                console.log('⌨️ Backspace: パネル削除');
                deletePanelWithHistory(selectedPanel);
            } else if (selectedElement) {
                e.preventDefault();
                console.log('⌨️ Backspace: 要素削除');
                deleteSelected();
            }
            break;
            
        case 'Escape':
            clearSelection();
            // コンテキストメニューも閉じる
            closeContextMenu();
            console.log('⌨️ Escape: 選択解除');
            break;
            
        case 'g':
            // ガイド表示切り替え
            const showGuides = document.getElementById('showGuides');
            if (showGuides) {
                showGuides.checked = !showGuides.checked;
                toggleGuides();
                console.log('⌨️ G: ガイド切り替え');
            }
            break;
            
        // 吹き出し編集機能
        case 'e':
            if (selectedBubble) {
                e.preventDefault();
                const bubbleElement = document.querySelector(`[data-bubble-id="${selectedBubble.id}"]`);
                if (bubbleElement) {
                    console.log('⌨️ E: 吹き出し編集開始');
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
                console.log('⌨️ Shift+E: 一括編集');
                editAllBubblesInPanel(selectedPanel.id);
            }
            break;
            
        // パネル編集機能
        case 'h':
            if (selectedPanel) {
                e.preventDefault();
                console.log('⌨️ H: 横分割');
                splitPanelWithHistory(selectedPanel, 'horizontal');
            } else {
                console.log('ℹ️ 分割するパネルを選択してください');
            }
            break;
            
        case 'v':
            if (selectedPanel) {
                e.preventDefault();
                console.log('⌨️ V: 縦分割');
                splitPanelWithHistory(selectedPanel, 'vertical');
            } else {
                console.log('ℹ️ 分割するパネルを選択してください');
            }
            break;
            
        case 'd':
            if (selectedPanel) {
                e.preventDefault();
                console.log('⌨️ D: 複製');
                duplicatePanelWithHistory(selectedPanel);
            } else {
                console.log('ℹ️ 複製するパネルを選択してください');
            }
            break;
            
        case 'r':
            if (selectedPanel) {
                e.preventDefault();
                console.log('⌨️ R: 回転');
                rotatePanelWithHistory(selectedPanel);
            } else {
                console.log('ℹ️ 回転するパネルを選択してください');
            }
            break;
            
        case 's':
            if (selectedPanel && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                console.log('⌨️ S: サイズ調整');
                startPanelResize(selectedPanel);
            }
            break;
            
        // 🆕 Undo/Redo（キーボードのみでも操作可能）
        case 'u':
            if (e.shiftKey) {
                // Shift+U でRedo
                e.preventDefault();
                redo();
                console.log('⌨️ Shift+U: Redo実行');
            } else {
                // U でUndo
                e.preventDefault();
                undo();
                console.log('⌨️ U: Undo実行');
            }
            break;
            
        // 🆕 ヘルプ表示
        case 'F1':
        case '?':
            e.preventDefault();
            showKeyboardHelp();
            console.log('⌨️ ヘルプ表示');
            break;
    }
}

// 🆕 キーボードヘルプ表示
function showKeyboardHelp() {
    const helpContent = `
        <div class="help-content">
            <h3>🎮 キーボードショートカット</h3>
            
            <div class="help-section">
                <h4>📐 パネル操作</h4>
                <div class="help-item"><kbd>H</kbd> 横分割</div>
                <div class="help-item"><kbd>V</kbd> 縦分割</div>
                <div class="help-item"><kbd>D</kbd> 複製</div>
                <div class="help-item"><kbd>R</kbd> 90度回転</div>
                <div class="help-item"><kbd>S</kbd> サイズ調整</div>
                <div class="help-item"><kbd>Delete</kbd> / <kbd>Backspace</kbd> 削除</div>
            </div>
            
            <div class="help-section">
                <h4>💬 吹き出し操作</h4>
                <div class="help-item"><kbd>E</kbd> 編集</div>
                <div class="help-item"><kbd>Shift+E</kbd> 一括編集</div>
                <div class="help-item">ダブルクリック 編集</div>
                <div class="help-item">右クリック 編集</div>
            </div>
            
            <div class="help-section">
                <h4>🔄 操作履歴</h4>
                <div class="help-item"><kbd>Ctrl+Z</kbd> 元に戻す</div>
                <div class="help-item"><kbd>Ctrl+Y</kbd> / <kbd>Ctrl+Shift+Z</kbd> やり直し</div>
                <div class="help-item"><kbd>U</kbd> 元に戻す</div>
                <div class="help-item"><kbd>Shift+U</kbd> やり直し</div>
            </div>
            
            <div class="help-section">
                <h4>⚡ その他</h4>
                <div class="help-item"><kbd>G</kbd> ガイド表示切り替え</div>
                <div class="help-item"><kbd>Ctrl+S</kbd> プロジェクト保存</div>
                <div class="help-item"><kbd>Ctrl+E</kbd> クリスタ用出力</div>
                <div class="help-item"><kbd>Escape</kbd> 選択解除</div>
                <div class="help-item"><kbd>F1</kbd> / <kbd>?</kbd> このヘルプ</div>
            </div>
        </div>
    `;
    
    if (typeof showModal === 'function') {
        showModal('キーボードショートカット', helpContent, [
            { text: '閉じる', class: 'btn-primary', onclick: 'closeModal(this)' }
        ]);
    } else {
        alert('キーボードショートカット:\n\nパネル操作: H(横分割) V(縦分割) D(複製) R(回転) S(サイズ)\n削除: Delete/Backspace\n元に戻す: Ctrl+Z または U\nやり直し: Ctrl+Y または Shift+U');
    }
}

console.log('✅ キーボード操作強化版 読み込み完了');
console.log('⌨️ 新機能: Backspace削除, Ctrl+Z/Y, U/Shift+U, F1ヘルプ');



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

// ===== コマ編集システム - interaction.jsに追加 =====

// 🆕 パネル編集モードの状態管理
let panelEditMode = false;
let panelSplitDirection = 'horizontal'; // 'horizontal' or 'vertical'

// 🆕 パネル編集イベントの追加
function addPanelEditEvents() {
    // パネル右クリックメニュー
    canvas.addEventListener('contextmenu', function(e) {
        const coords = getCanvasCoordinates(e);
        const clickedPanel = findPanelAt(coords.x, coords.y);
        
        if (clickedPanel) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📐 パネル右クリック:', clickedPanel.id);
            selectPanel(clickedPanel);
            showPanelContextMenu(e, clickedPanel);
        }
    });
    
    // パネルダブルクリックで分割
    canvas.addEventListener('dblclick', function(e) {
        const coords = getCanvasCoordinates(e);
        const clickedPanel = findPanelAt(coords.x, coords.y);
        
        if (clickedPanel) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📐 パネルダブルクリック分割:', clickedPanel.id);
            splitPanel(clickedPanel, 'horizontal');
        }
    });
    
    console.log('✅ パネル編集イベント設定完了');
}

// 🆕 パネル右クリックメニュー表示
function showPanelContextMenu(e, panel) {
    // 既存のメニューを削除
    const existingMenu = document.querySelector('.panel-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.className = 'panel-context-menu';
    menu.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        background: white;
        border: 2px solid #667eea;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        min-width: 180px;
        font-size: 12px;
        overflow: hidden;
    `;
    
    const menuItems = [
        { text: '📐 横に分割', action: () => splitPanel(panel, 'horizontal') },
        { text: '📏 縦に分割', action: () => splitPanel(panel, 'vertical') },
        { text: '📋 複製', action: () => duplicatePanel(panel) },
        { text: '🔄 90度回転', action: () => rotatePanel(panel) },
        { text: '📏 サイズ調整', action: () => startPanelResize(panel) },
        { text: '🗑️ 削除', action: () => deletePanel(panel), className: 'delete-item' },
        { text: '❌ キャンセル', action: () => closeContextMenu() }
    ];
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = `menu-item ${item.className || ''}`;
        menuItem.textContent = item.text;
        menuItem.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            transition: background 0.2s ease;
        `;
        
        menuItem.addEventListener('click', () => {
            item.action();
            closeContextMenu();
        });
        
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.background = item.className === 'delete-item' ? '#ffebee' : '#f0f4ff';
        });
        
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.background = '';
        });
        
        menu.appendChild(menuItem);
    });
    
    document.body.appendChild(menu);
    
    // クリック外で閉じる
    setTimeout(() => {
        document.addEventListener('click', closeContextMenu, { once: true });
    }, 100);
}

// 🆕 コンテキストメニューを閉じる
function closeContextMenu() {
    const menu = document.querySelector('.panel-context-menu');
    if (menu) {
        menu.remove();
    }
}

// 🆕 パネル分割機能
function splitPanel(panel, direction = 'horizontal') {
    console.log(`✂️ パネル分割: ${panel.id}, 方向: ${direction}`);
    
    // 既存のパネルサイズを調整
    const newWidth = direction === 'vertical' ? panel.width / 2 : panel.width;
    const newHeight = direction === 'horizontal' ? panel.height / 2 : panel.height;
    
    // 元のパネルをリサイズ
    panel.width = newWidth;
    panel.height = newHeight;
    
    // 新しいパネルを作成
    const newPanel = {
        id: Math.max(...panels.map(p => p.id)) + 1,
        x: direction === 'vertical' ? panel.x + newWidth : panel.x,
        y: direction === 'horizontal' ? panel.y + newHeight : panel.y,
        width: newWidth,
        height: newHeight
    };
    
    panels.push(newPanel);
    
    // 表示更新
    redrawCanvas();
    drawGuidelines();
    updateCharacterOverlay();
    updateBubbleOverlay();
    updateStatus();
    
    // 新しいパネルを選択
    selectPanel(newPanel);
    
    console.log(`✅ 分割完了: パネル${panel.id} → パネル${newPanel.id}`);
    showNotification(`パネル${panel.id}を${direction === 'horizontal' ? '横' : '縦'}に分割しました`, 'success', 2000);
}

// 🆕 パネル複製機能
function duplicatePanel(panel) {
    console.log('📋 パネル複製:', panel.id);
    
    const newPanel = {
        id: Math.max(...panels.map(p => p.id)) + 1,
        x: panel.x + 20,
        y: panel.y + 20,
        width: panel.width,
        height: panel.height
    };
    
    // キャンバス内に収まるように調整
    if (newPanel.x + newPanel.width > canvas.width) {
        newPanel.x = panel.x - 20;
    }
    if (newPanel.y + newPanel.height > canvas.height) {
        newPanel.y = panel.y - 20;
    }
    
    panels.push(newPanel);
    
    // 元のパネルの要素も複製（オプション）
    const originalElements = getElementsInPanel(panel.id);
    
    if (originalElements.characters.length > 0 || originalElements.bubbles.length > 0) {
        const shouldCopyElements = confirm('要素（キャラクター・吹き出し）も複製しますか？');
        
        if (shouldCopyElements) {
            // キャラクター複製
            originalElements.characters.forEach(char => {
                const newChar = {
                    ...char,
                    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    panelId: newPanel.id
                };
                characters.push(newChar);
            });
            
            // 吹き出し複製
            originalElements.bubbles.forEach(bubble => {
                const newBubble = {
                    ...bubble,
                    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    panelId: newPanel.id
                };
                speechBubbles.push(newBubble);
            });
        }
    }
    
    // 表示更新
    redrawCanvas();
    drawGuidelines();
    updateCharacterOverlay();
    updateBubbleOverlay();
    updateElementCount();
    
    // 新しいパネルを選択
    selectPanel(newPanel);
    
    console.log(`✅ 複製完了: パネル${panel.id} → パネル${newPanel.id}`);
    showNotification(`パネル${panel.id}を複製しました`, 'success', 2000);
}

// 🆕 パネル回転機能
function rotatePanel(panel) {
    console.log('🔄 パネル回転:', panel.id);
    
    // 幅と高さを入れ替え
    const tempWidth = panel.width;
    panel.width = panel.height;
    panel.height = tempWidth;
    
    // キャンバス内に収まるように位置調整
    if (panel.x + panel.width > canvas.width) {
        panel.x = canvas.width - panel.width;
    }
    if (panel.y + panel.height > canvas.height) {
        panel.y = canvas.height - panel.height;
    }
    
    // 表示更新
    redrawCanvas();
    drawGuidelines();
    updateCharacterOverlay();
    updateBubbleOverlay();
    
    console.log(`✅ 回転完了: パネル${panel.id} (${panel.width}x${panel.height})`);
    showNotification(`パネル${panel.id}を90度回転しました`, 'success', 2000);
}

// 🆕 パネル削除機能
function deletePanel(panel) {
    console.log('🗑️ パネル削除確認:', panel.id);
    
    // 要素がある場合は確認
    const elements = getElementsInPanel(panel.id);
    const hasElements = elements.characters.length > 0 || elements.bubbles.length > 0;
    
    let confirmMessage = `パネル${panel.id}を削除しますか？`;
    if (hasElements) {
        confirmMessage += `\n（${elements.characters.length}個のキャラクター、${elements.bubbles.length}個の吹き出しも削除されます）`;
    }
    
    if (!confirm(confirmMessage)) {
        console.log('❌ 削除キャンセル');
        return;
    }
    
    // パネルを削除
    panels = panels.filter(p => p.id !== panel.id);
    
    // 関連する要素も削除
    characters = characters.filter(char => char.panelId !== panel.id);
    speechBubbles = speechBubbles.filter(bubble => bubble.panelId !== panel.id);
    
    // 選択状態をクリア
    if (selectedPanel === panel) {
        clearSelection();
    }
    
    // 表示更新
    redrawCanvas();
    drawGuidelines();
    updateCharacterOverlay();
    updateBubbleOverlay();
    updateElementCount();
    
    console.log(`✅ 削除完了: パネル${panel.id}`);
    showNotification(`パネル${panel.id}を削除しました`, 'success', 2000);
}

// 🆕 パネルリサイズモード開始
function startPanelResize(panel) {
    console.log('📏 パネルリサイズモード:', panel.id);
    
    selectPanel(panel);
    
    // リサイズハンドルをパネルに追加
    addPanelResizeHandles(panel);
    
    showNotification('パネルの角をドラッグしてサイズ調整してください', 'info', 3000);
}

// 🆕 パネルリサイズハンドル追加
function addPanelResizeHandles(panel) {
    // 既存のハンドルを削除
    document.querySelectorAll('.panel-resize-handle').forEach(h => h.remove());
    
    const canvasRect = canvas.getBoundingClientRect();
    
    // 4つの角にハンドルを配置
    const handles = [
        { position: 'bottom-right', x: panel.x + panel.width, y: panel.y + panel.height }
    ];
    
    handles.forEach(handleInfo => {
        const handle = document.createElement('div');
        handle.className = 'panel-resize-handle';
        handle.style.cssText = `
            position: absolute;
            width: 16px;
            height: 16px;
            background: #667eea;
            border: 3px solid white;
            border-radius: 4px;
            cursor: se-resize;
            z-index: 1001;
            left: ${canvasRect.left + handleInfo.x - 8}px;
            top: ${canvasRect.top + handleInfo.y - 8}px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        `;
        
        // リサイズイベント
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            startPanelResizeDrag(e, panel, handleInfo.position);
        });
        
        document.body.appendChild(handle);
    });
    
    // 5秒後に自動で非表示
    setTimeout(() => {
        document.querySelectorAll('.panel-resize-handle').forEach(h => h.remove());
    }, 5000);
}

// 🆕 パネルリサイズドラッグ開始
function startPanelResizeDrag(e, panel, position) {
    console.log('📏 パネルリサイズ開始:', panel.id);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = panel.width;
    const startHeight = panel.height;
    
    const handleResize = (e) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        panel.width = Math.max(50, startWidth + deltaX);
        panel.height = Math.max(30, startHeight + deltaY);
        
        // キャンバス内に制限
        if (panel.x + panel.width > canvas.width) {
            panel.width = canvas.width - panel.x;
        }
        if (panel.y + panel.height > canvas.height) {
            panel.height = canvas.height - panel.y;
        }
        
        redrawCanvas();
        drawGuidelines();
        updateCharacterOverlay();
        updateBubbleOverlay();
        
        // ハンドル位置も更新
        const handle = document.querySelector('.panel-resize-handle');
        if (handle) {
            const canvasRect = canvas.getBoundingClientRect();
            handle.style.left = (canvasRect.left + panel.x + panel.width - 8) + 'px';
            handle.style.top = (canvasRect.top + panel.y + panel.height - 8) + 'px';
        }
    };
    
    const endResize = () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', endResize);
        
        // ハンドルを削除
        document.querySelectorAll('.panel-resize-handle').forEach(h => h.remove());
        
        console.log(`✅ リサイズ完了: パネル${panel.id} (${panel.width}x${panel.height})`);
        showNotification(`パネル${panel.id}のサイズを調整しました`, 'success', 2000);
    };
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', endResize);
}

// ===== リサイズ時のスクロール問題完全修正 =====

// 🔧 スクロール位置の完全固定システム
let originalScrollPosition = { x: 0, y: 0 };
let isScrollLocked = false;

// 🆕 スクロール位置保存・固定
function lockScrollPosition() {
    if (isScrollLocked) return;
    
    // 現在のスクロール位置を保存
    originalScrollPosition.x = window.scrollX || document.documentElement.scrollLeft || 0;
    originalScrollPosition.y = window.scrollY || document.documentElement.scrollTop || 0;
    
    console.log('📍 スクロール位置保存:', originalScrollPosition);
    
    isScrollLocked = true;
    
    // より強力なスクロール固定
    document.body.style.position = 'fixed';
    document.body.style.top = `-${originalScrollPosition.y}px`;
    document.body.style.left = `-${originalScrollPosition.x}px`;
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    
    // HTMLレベルでも固定
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    
    // 追加の安全策
    document.addEventListener('scroll', forceScrollPosition, { passive: false, capture: true });
    window.addEventListener('scroll', forceScrollPosition, { passive: false, capture: true });
}

// 🆕 スクロール位置強制復元
function forceScrollPosition(e) {
    if (!isScrollLocked) return;
    
    e.preventDefault();
    e.stopImmediatePropagation();
    
    // 即座に元の位置に戻す
    window.scrollTo(originalScrollPosition.x, originalScrollPosition.y);
    
    return false;
}

// 🆕 スクロールロック解除
function unlockScrollPosition() {
    if (!isScrollLocked) return;
    
    console.log('🔓 スクロール位置復元:', originalScrollPosition);
    
    isScrollLocked = false;
    
    // スタイルをリセット
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.overflow = '';
    
    document.documentElement.style.position = '';
    document.documentElement.style.width = '';
    document.documentElement.style.height = '';
    document.documentElement.style.overflow = '';
    
    // イベントリスナー削除
    document.removeEventListener('scroll', forceScrollPosition, { capture: true });
    window.removeEventListener('scroll', forceScrollPosition, { capture: true });
    
    // 元の位置に復元
    window.scrollTo(originalScrollPosition.x, originalScrollPosition.y);
    
    // さらに安全策：少し遅延して再度復元
    setTimeout(() => {
        window.scrollTo(originalScrollPosition.x, originalScrollPosition.y);
    }, 10);
}



// 🔄 安定版endResize関数
function endResizeStable(e) {
    if (!isResizing) return;
    
    console.log('🔓 リサイズ終了 - スクロール復元');
    
    isResizing = false;
    resizeStartData = {};
    
    // スクロールロック解除
    unlockScrollPosition();
    
    // イベントリスナー削除
    const options = { capture: true };
    document.removeEventListener('mousemove', handleResizeStable, options);
    document.removeEventListener('mouseup', endResizeStable, options);
    window.removeEventListener('mousemove', handleResizeStable, options);
    window.removeEventListener('mouseup', endResizeStable, options);
    document.removeEventListener('wheel', preventAllInteraction, options);
    document.removeEventListener('touchmove', preventAllInteraction, options);
    document.removeEventListener('keydown', preventAllInteraction, options);
    
    updateControlsFromElement();
}

// 🆕 すべてのインタラクションを防止
function preventAllInteraction(e) {
    if (isResizing) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }
}

// 🔄 強制終了の改良
window.forceEndDrag = function() {
    console.log('🛑 強制ドラッグ終了');
    
    isDragging = false;
    selectedElement = null;
    isResizing = false;
    resizeStartData = {};
    
    // スクロールロック解除
    unlockScrollPosition();
    
    // すべてのイベントリスナーを削除
    const options = { capture: true };
    document.removeEventListener('mousemove', handleResizeStable, options);
    document.removeEventListener('mouseup', endResizeStable, options);
    window.removeEventListener('mousemove', handleResizeStable, options);
    window.removeEventListener('mouseup', endResizeStable, options);
    document.removeEventListener('wheel', preventAllInteraction, options);
    document.removeEventListener('touchmove', preventAllInteraction, options);
    document.removeEventListener('keydown', preventAllInteraction, options);
};

console.log('✅ リサイズ時スクロール問題 完全修正版 読み込み完了');

// ===== 吹き出しリサイズ・縦書き機能 =====

// 🆕 吹き出しリサイズハンドル追加
function addBubbleResizeHandles(element, bubble) {
    // 既存のハンドルを削除
    element.querySelectorAll('.bubble-resize-handle').forEach(h => h.remove());
    
    const handles = [
        'bottom-right', 'top-left', 'top-right', 'bottom-left'
    ];
    
    handles.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `bubble-resize-handle ${position}`;
        handle.dataset.position = position;
        
        // リサイズイベント
        handle.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation();
            
            console.log('💬 吹き出しリサイズ開始:', position);
            startBubbleResize(e, bubble, position);
        }, { passive: false, capture: true });
        
        element.appendChild(handle);
    });
}

// 🆕 吹き出しリサイズ開始
function startBubbleResize(e, bubble, position) {
    console.log('💬 吹き出しリサイズ開始:', bubble.text.substring(0, 10), position);
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // スクロール位置を固定
    lockScrollPosition();
    
    isBubbleResizing = true;
    selectedElement = bubble;
    selectedBubble = bubble;
    
    const rect = canvas.getBoundingClientRect();
    const coords = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    const panel = panels.find(p => p.id === bubble.panelId);
    if (!panel) {
        unlockScrollPosition();
        return;
    }
    
    bubbleResizeStartData = {
        bubble: bubble,
        position: position,
        startX: coords.x,
        startY: coords.y,
        startWidth: bubble.width,
        startHeight: bubble.height,
        startScale: bubble.scale,
        panel: panel
    };
    
    // イベントリスナー設定
    const options = { passive: false, capture: true };
    document.addEventListener('mousemove', handleBubbleResize, options);
    document.addEventListener('mouseup', endBubbleResize, options);
    window.addEventListener('mousemove', handleBubbleResize, options);
    window.addEventListener('mouseup', endBubbleResize, options);
    
    console.log('💬 吹き出しリサイズモード開始');
}

// 🆕 吹き出しリサイズ処理
function handleBubbleResize(e) {
    if (!isBubbleResizing || !bubbleResizeStartData.bubble) return;
    
    e.preventDefault();
    e.stopImmediatePropagation();
    
    // スクロール位置維持
    if (window.scrollX !== originalScrollPosition.x || window.scrollY !== originalScrollPosition.y) {
        window.scrollTo(originalScrollPosition.x, originalScrollPosition.y);
    }
    
    const rect = canvas.getBoundingClientRect();
    const coords = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    const data = bubbleResizeStartData;
    const deltaX = coords.x - data.startX;
    const deltaY = coords.y - data.startY;
    
    const sensitivity = 0.5; // 吹き出し用の感度
    
    let newWidth = data.startWidth;
    let newHeight = data.startHeight;
    
    switch (data.position) {
        case 'bottom-right':
            newWidth = Math.max(40, data.startWidth + deltaX * sensitivity);
            newHeight = Math.max(25, data.startHeight + deltaY * sensitivity);
            break;
        case 'top-left':
            newWidth = Math.max(40, data.startWidth - deltaX * sensitivity);
            newHeight = Math.max(25, data.startHeight - deltaY * sensitivity);
            break;
        case 'top-right':
            newWidth = Math.max(40, data.startWidth + deltaX * sensitivity);
            newHeight = Math.max(25, data.startHeight - deltaY * sensitivity);
            break;
        case 'bottom-left':
            newWidth = Math.max(40, data.startWidth - deltaX * sensitivity);
            newHeight = Math.max(25, data.startHeight + deltaY * sensitivity);
            break;
    }
    
    // 最大サイズ制限
    newWidth = Math.min(300, newWidth);
    newHeight = Math.min(200, newHeight);
    
    data.bubble.width = newWidth;
    data.bubble.height = newHeight;
    
    // 表示更新
    requestAnimationFrame(() => {
        updateBubbleOverlay();
        updateControlsFromElement();
    });
    
    return false;
}

// 🆕 吹き出しリサイズ終了
function endBubbleResize(e) {
    if (!isBubbleResizing) return;
    
    console.log('💬 吹き出しリサイズ終了');
    
    isBubbleResizing = false;
    bubbleResizeStartData = {};
    
    // スクロールロック解除
    unlockScrollPosition();
    
    // イベントリスナー削除
    const options = { capture: true };
    document.removeEventListener('mousemove', handleBubbleResize, options);
    document.removeEventListener('mouseup', endBubbleResize, options);
    window.removeEventListener('mousemove', handleBubbleResize, options);
    window.removeEventListener('mouseup', endBubbleResize, options);
    
    updateControlsFromElement();
}

// 🔄 createBubbleElement関数の強化版（リサイズハンドル付き）
function createBubbleElement(bubble, panel) {
    const element = document.createElement('div');
    element.className = `speech-bubble ${bubble.type}`;
    
    // 縦書き対応
    if (bubble.vertical) {
        element.classList.add('vertical-text');
    }
    
    if (selectedBubble === bubble) {
        element.classList.add('selected');
    }
    
    element.dataset.bubbleId = bubble.id;
    
    // テキスト表示（縦書き対応）
    if (bubble.vertical) {
        element.innerHTML = createVerticalText(bubble.text);
    } else {
        element.textContent = bubble.text;
    }
    
    // 位置とサイズ計算
    const bubbleX = panel.x + (panel.width * bubble.x) - (bubble.width * bubble.scale / 2);
    const bubbleY = panel.y + (panel.height * bubble.y) - (bubble.height * bubble.scale / 2);
    
    // スタイル適用
    Object.assign(element.style, {
        left: bubbleX + 'px',
        top: bubbleY + 'px',
        width: (bubble.width * bubble.scale) + 'px',
        height: (bubble.height * bubble.scale) + 'px',
        cursor: 'move'
    });
    
    // ドラッグ機能
    addBubbleEditEvents(element, bubble, panel);
    
    // リサイズハンドル追加（選択時のみ）
    if (selectedBubble === bubble) {
        addBubbleResizeHandles(element, bubble);
    }
    
    // 吹き出しの尻尾を追加
    if (bubble.type !== 'narration') {
        const tail = createBubbleTail(bubble);
        element.appendChild(tail);
    }
    
    return element;
}

// 🆕 縦書きテキスト作成
function createVerticalText(text) {
    // 文字を縦に並べる
    const characters = text.split('');
    const verticalHTML = characters.map(char => {
        if (char === '\n' || char === ' ') {
            return '<br>';
        }
        return `<span class="vertical-char">${char}</span>`;
    }).join('');
    
    return `<div class="vertical-text-container">${verticalHTML}</div>`;
}

// 🆕 吹き出し編集時の縦書き切り替え
function startBubbleEdit(element, bubble) {
    selectBubble(bubble);
    
    // 編集用のテキストエリアを作成
    const editArea = document.createElement('textarea');
    editArea.className = 'bubble-edit-area';
    editArea.value = bubble.text;
    
    // 縦書きモード切り替えボタンを追加
    const verticalToggle = document.createElement('button');
    verticalToggle.className = 'vertical-toggle-btn';
    verticalToggle.textContent = bubble.vertical ? '横書き' : '縦書き';
    verticalToggle.style.cssText = `
        position: absolute;
        top: -30px;
        right: 0;
        background: #667eea;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        cursor: pointer;
        z-index: 1001;
    `;
    
    // スタイル設定
    Object.assign(editArea.style, {
        position: 'absolute',
        left: element.style.left,
        top: element.style.top,
        width: element.style.width,
        height: element.style.height,
        fontSize: '12px',
        fontFamily: 'inherit',
        border: '3px solid #ff6600',
        borderRadius: '20px',
        padding: '8px 12px',
        background: 'white',
        zIndex: '1000',
        resize: 'none',
        textAlign: bubble.vertical ? 'center' : 'center',
        lineHeight: '1.2',
        outline: 'none',
        boxShadow: '0 0 15px rgba(255, 102, 0, 0.7)',
        writingMode: bubble.vertical ? 'vertical-rl' : 'horizontal-tb'
    });
    
    // 元の要素を隠す
    element.style.opacity = '0.3';
    element.style.pointerEvents = 'none';
    
    // 編集エリアとボタンを追加
    const bubbleOverlay = document.getElementById('bubbleOverlay');
    const editContainer = document.createElement('div');
    editContainer.style.position = 'relative';
    editContainer.appendChild(editArea);
    editContainer.appendChild(verticalToggle);
    bubbleOverlay.appendChild(editContainer);
    
    // フォーカスして全選択
    editArea.focus();
    editArea.select();
    
    // 縦書き切り替えイベント
    verticalToggle.addEventListener('click', function(e) {
        e.preventDefault();
        bubble.vertical = !bubble.vertical;
        
        verticalToggle.textContent = bubble.vertical ? '横書き' : '縦書き';
        editArea.style.writingMode = bubble.vertical ? 'vertical-rl' : 'horizontal-tb';
        
        console.log('📝 縦書き切り替え:', bubble.vertical);
    });
    
    // 編集完了イベント
    const finishEdit = () => {
        const newText = editArea.value.trim() || '...';
        
        console.log('💾 編集完了:', bubble.text, '→', newText, '縦書き:', bubble.vertical);
        
        bubble.text = newText;
        
        // サイズを自動調整（縦書き対応）
        if (bubble.vertical) {
            adjustBubbleSizeVertical(bubble);
        } else {
            adjustBubbleSize(bubble);
        }
        
        // 編集エリアを削除
        if (editContainer.parentNode) {
            editContainer.parentNode.removeChild(editContainer);
        }
        
        // 元の要素を復元
        element.style.opacity = '';
        element.style.pointerEvents = '';
        
        // 表示を更新
        updateBubbleOverlay();
        updateStatus();
        
        // セリフ入力欄も更新
        const dialogueInput = document.getElementById('dialogueText');
        if (dialogueInput && selectedBubble === bubble) {
            dialogueInput.value = newText;
        }
    };
    
    // Enterで確定、ESCでキャンセル
    editArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            finishEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            
            // 縦書き状態を元に戻す
            bubble.vertical = bubble.vertical; // 元の状態を維持
            
            if (editContainer.parentNode) {
                editContainer.parentNode.removeChild(editContainer);
            }
            
            element.style.opacity = '';
            element.style.pointerEvents = '';
            
            console.log('❌ 編集キャンセル');
        }
    });
    
    // フォーカスが外れたら確定
    editArea.addEventListener('blur', function(e) {
        // ボタンクリック以外の場合のみ確定
        if (!e.relatedTarget || !e.relatedTarget.classList.contains('vertical-toggle-btn')) {
            finishEdit();
        }
    });
}

// 🆕 縦書き用サイズ調整
function adjustBubbleSizeVertical(bubble) {
    const textLength = bubble.text.length;
    const lineCount = Math.ceil(textLength / 8); // 縦書きは8文字で改行
    
    // 縦書きの場合は幅と高さを逆転
    bubble.height = Math.max(60, Math.min(250, textLength * 12 + 40));
    bubble.width = Math.max(35, lineCount * 25 + 25);
    
    console.log(`📏 縦書き吹き出しサイズ調整: ${bubble.width}x${bubble.height} (${textLength}文字)`);
}

// 🆕 グローバル変数に追加（main.jsに追加）
let isBubbleResizing = false;
let bubbleResizeStartData = {};

console.log('✅ 吹き出しリサイズ・縦書き機能 読み込み完了');

// ===== 不足している関数の追加 - interaction.jsに追加 =====

// 🆕 updateControlsFromElement関数
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
    
    console.log('🎛️ コントロール更新:', selectedElement?.id || 'なし');
}

// 🆕 updateSelectedElement関数
function updateSelectedElement() {
    if (!selectedElement) return;
    
    const scaleEl = document.getElementById('elementScale');
    const xEl = document.getElementById('elementX');
    const yEl = document.getElementById('elementY');
    
    if (scaleEl) selectedElement.scale = parseFloat(scaleEl.value);
    if (xEl) selectedElement.x = parseFloat(xEl.value);
    if (yEl) selectedElement.y = parseFloat(yEl.value);
    
    if (selectedCharacter) {
        if (typeof updateCharacterOverlay === 'function') {
            updateCharacterOverlay();
        }
    } else if (selectedBubble) {
        if (typeof updateBubbleOverlay === 'function') {
            updateBubbleOverlay();
        }
    }
    
    updateStatus();
    console.log('⚙️ 選択要素更新:', selectedElement?.id || 'なし');
}

// 🆕 selectCharacter関数
function selectCharacter(character) {
    selectedCharacter = character;
    selectedBubble = null;
    selectedPanel = null;
    selectedElement = character;
    
    if (typeof updateCharacterOverlay === 'function') {
        updateCharacterOverlay();
    }
    updateControlsFromElement();
    updateStatus();
    
    console.log('👤 キャラクター選択:', character.name);
    
    // 状況表示更新
    if (typeof updateSelectionStatus === 'function') {
        updateSelectionStatus(`キャラクター「${character.name}」を選択中`);
    }
    if (typeof updateOperationStatus === 'function') {
        updateOperationStatus('キャラクターが選択されました');
    }
}

// 🆕 selectPanel関数
function selectPanel(panel) {
    selectedPanel = panel;
    selectedCharacter = null;
    selectedBubble = null;
    selectedElement = null;
    
    if (typeof redrawCanvas === 'function') {
        redrawCanvas();
    }
    if (typeof drawGuidelines === 'function') {
        drawGuidelines();
    }
    updateStatus();
    
    console.log('📐 パネル選択:', panel.id);
    
    // 状況表示更新
    if (typeof updateSelectionStatus === 'function') {
        updateSelectionStatus(`パネル${panel.id}を選択中`);
    }
    if (typeof updateOperationStatus === 'function') {
        updateOperationStatus('パネルが選択されました');
    }
}

// 🆕 clearSelection関数
function clearSelection() {
    selectedPanel = null;
    selectedCharacter = null;
    selectedBubble = null;
    selectedElement = null;
    
    if (typeof redrawCanvas === 'function') {
        redrawCanvas();
    }
    if (typeof drawGuidelines === 'function') {
        drawGuidelines();
    }
    if (typeof updateCharacterOverlay === 'function') {
        updateCharacterOverlay();
    }
    if (typeof updateBubbleOverlay === 'function') {
        updateBubbleOverlay();
    }
    updateStatus();
    
    console.log('❌ 選択解除');
    
    // 状況表示更新
    if (typeof updateSelectionStatus === 'function') {
        updateSelectionStatus('何も選択されていません');
    }
    if (typeof updateOperationStatus === 'function') {
        updateOperationStatus('選択を解除しました');
    }
}

// 🆕 deleteSelected関数
function deleteSelected() {
    if (selectedCharacter) {
        characters = characters.filter(char => char.id !== selectedCharacter.id);
        selectedCharacter = null;
        if (typeof updateCharacterOverlay === 'function') {
            updateCharacterOverlay();
        }
        console.log('👤 キャラクター削除');
        
        if (typeof showNotification === 'function') {
            showNotification('キャラクターを削除しました', 'success', 2000);
        }
    } else if (selectedBubble) {
        speechBubbles = speechBubbles.filter(bubble => bubble.id !== selectedBubble.id);
        selectedBubble = null;
        if (typeof updateBubbleOverlay === 'function') {
            updateBubbleOverlay();
        }
        console.log('💬 吹き出し削除');
        
        if (typeof showNotification === 'function') {
            showNotification('吹き出しを削除しました', 'success', 2000);
        }
    } else if (selectedPanel) {
        const panelId = selectedPanel.id;
        
        // 確認ダイアログ
        const elements = getElementsInPanel ? getElementsInPanel(panelId) : { characters: [], bubbles: [] };
        const hasElements = elements.characters?.length > 0 || elements.bubbles?.length > 0;
        
        let confirmMessage = `パネル${panelId}を削除しますか？`;
        if (hasElements) {
            confirmMessage += `\n（${elements.characters?.length || 0}個のキャラクター、${elements.bubbles?.length || 0}個の吹き出しも削除されます）`;
        }
        
        if (confirm(confirmMessage)) {
            // パネルと関連要素を削除
            panels = panels.filter(p => p.id !== panelId);
            characters = characters.filter(char => char.panelId !== panelId);
            speechBubbles = speechBubbles.filter(bubble => bubble.panelId !== panelId);
            
            selectedPanel = null;
            
            // 表示更新
            if (typeof redrawCanvas === 'function') redrawCanvas();
            if (typeof drawGuidelines === 'function') drawGuidelines();
            if (typeof updateCharacterOverlay === 'function') updateCharacterOverlay();
            if (typeof updateBubbleOverlay === 'function') updateBubbleOverlay();
            if (typeof updateElementCount === 'function') updateElementCount();
            
            console.log('📐 パネル削除:', panelId);
            
            if (typeof showNotification === 'function') {
                showNotification(`パネル${panelId}を削除しました`, 'success', 2000);
            }
        }
    }
    
    selectedElement = null;
    updateStatus();
    if (typeof updateElementCount === 'function') {
        updateElementCount();
    }
}

// 🆕 toggleGuides関数
function toggleGuides() {
    if (typeof drawGuidelines === 'function') {
        drawGuidelines();
    }
    console.log('👁️ ガイドライン表示切り替え');
}

// 🆕 updateStatus関数
function updateStatus() {
    const selectedInfo = document.getElementById('selectedInfo');
    const panelInfo = document.getElementById('panelInfo');
    
    if (!selectedInfo || !panelInfo) return;
    
    if (selectedBubble) {
        const shortText = selectedBubble.text.length > 15 ? 
            selectedBubble.text.substring(0, 15) + '...' : 
            selectedBubble.text;
        selectedInfo.textContent = `吹き出し: ${shortText}`;
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

// 🆕 showKeyboardHints関数
function showKeyboardHints() {
    const hints = [
        'パネル操作: 右クリックでメニュー',
        'ダブルクリック: パネル分割',
        'H:横分割 V:縦分割 D:複製 R:回転',
        'E:吹き出し編集 Delete:削除'
    ];
    
    let currentHint = 0;
    
    const hintElement = document.createElement('div');
    hintElement.className = 'keyboard-hint';
    hintElement.textContent = hints[currentHint];
    document.body.appendChild(hintElement);
    
    // 3秒後に表示
    setTimeout(() => {
        hintElement.classList.add('show');
    }, 3000);
    
    // 5秒ごとにヒントを切り替え
    const hintInterval = setInterval(() => {
        currentHint = (currentHint + 1) % hints.length;
        hintElement.textContent = hints[currentHint];
    }, 5000);
    
    // 15秒後に非表示
    setTimeout(() => {
        hintElement.classList.remove('show');
        clearInterval(hintInterval);
        setTimeout(() => {
            if (hintElement.parentNode) {
                hintElement.parentNode.removeChild(hintElement);
            }
        }, 300);
    }, 15000);
    
    console.log('💡 キーボードヒント表示開始');
}

// 🆕 initializeUIControls関数
function initializeUIControls() {
    console.log('🎛️ UIコントロール初期化');
    
    // Undo/Redoボタンのイベント設定
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const helpBtn = document.getElementById('helpBtn');
    
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            if (typeof undo === 'function') {
                undo();
            }
            console.log('🖱️ Undoボタンクリック');
        });
    }
    
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            if (typeof redo === 'function') {
                redo();
            }
            console.log('🖱️ Redoボタンクリック');
        });
    }
    
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            if (typeof showKeyboardHelp === 'function') {
                showKeyboardHelp();
            } else {
                // フォールバック
                alert('キーボードショートカット:\n\nH: 横分割\nV: 縦分割\nD: 複製\nR: 回転\nE: 編集\nDelete: 削除\nCtrl+Z: 元に戻す\nCtrl+Y: やり直し');
            }
            console.log('🖱️ ヘルプボタンクリック');
        });
    }
    
    // 初期状態の更新
    if (typeof updateUndoRedoButtons === 'function') {
        updateUndoRedoButtons();
    }
    if (typeof updateOperationStatus === 'function') {
        updateOperationStatus('準備完了');
    }
    if (typeof updateHistoryStatus === 'function') {
        updateHistoryStatus();
    }
    if (typeof updateSelectionStatus === 'function') {
        updateSelectionStatus('何も選択されていません');
    }
    
    console.log('✅ UIコントロール初期化完了');
}

// 🆕 getElementsInPanel関数（簡易版）
function getElementsInPanel(panelId) {
    return {
        characters: characters.filter(char => char.panelId === panelId),
        bubbles: speechBubbles.filter(bubble => bubble.panelId === panelId)
    };
}

// グローバルに公開
window.updateControlsFromElement = updateControlsFromElement;
window.updateSelectedElement = updateSelectedElement;
window.selectCharacter = selectCharacter;
window.selectPanel = selectPanel;
window.clearSelection = clearSelection;
window.deleteSelected = deleteSelected;
window.toggleGuides = toggleGuides;
window.updateStatus = updateStatus;
window.showKeyboardHints = showKeyboardHints;
window.initializeUIControls = initializeUIControls;
window.getElementsInPanel = getElementsInPanel;

console.log('✅ 不足していた関数をすべて追加しました');

console.log('✅ interaction.js 読み込み完了');
