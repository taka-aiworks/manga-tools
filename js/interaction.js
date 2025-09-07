// ===== インタラクションモジュール（修正版） =====

function initializeInteraction() {
    console.log('🖱️ インタラクションモジュール初期化');
    setupEventListeners();
}

// ===== イベントリスナー設定 =====
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
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('dblclick', handleDoubleClick);
    
    // グローバルイベント
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    
    // UI要素のイベント
    setupUIEventListeners();
    
    console.log('✅ イベントリスナー設定完了');
}

function setupUIEventListeners() {
    // テンプレート選択
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', function() {
            safeExecute('loadTemplate', this.dataset.template);
        });
    });
    
    // キャラ配置パターン
    document.querySelectorAll('.pattern-card').forEach(card => {
        card.addEventListener('click', function() {
            safeExecute('applyCharacterLayout', this.dataset.layout);
        });
    });
    
    // キャラクター追加
    document.querySelectorAll('.char-item').forEach(item => {
        item.addEventListener('click', function() {
            safeExecute('addCharacter', this.dataset.char);
        });
    });
    
    // 吹き出し追加
    document.querySelectorAll('.bubble-btn').forEach(btn => {
        if (btn.id === 'autoPlaceBubbles') {
            btn.addEventListener('click', () => safeExecute('autoPlaceBubbles'));
        } else if (btn.dataset.bubble) {
            btn.addEventListener('click', function() {
                safeExecute('addBubble', this.dataset.bubble);
            });
        }
    });
    
    // シーン選択
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            safeExecute('analyzeScene', this.dataset.scene);
        });
    });
    
    // 推奨設定適用
    const applyBtn = document.getElementById('applyRecommendation');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => safeExecute('applyRecommendation'));
    }
    
    // 詳細調整
    setupControlEvents();
    
    // 出力機能
    setupExportEvents();
}

function setupControlEvents() {
    const controls = {
        'elementScale': updateSelectedElement,
        'elementX': updateSelectedElement,
        'elementY': updateSelectedElement,
        'characterFacing': updateCharacterSettings,
        'characterGaze': updateCharacterSettings,
        'characterPose': updateCharacterSettings,
        'characterExpression': updateCharacterSettings
    };
    
    Object.entries(controls).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', handler);
        }
    });
    
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
}

function setupExportEvents() {
    const exportButtons = {
        'exportToClipStudio': 'exportToClipStudio',
        'exportToPDF': 'exportToPDF',
        'exportToPNG': 'exportToPNG',
        'saveProject': 'saveProject'
    };
    
    Object.entries(exportButtons).forEach(([id, functionName]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => safeExecute(functionName));
        }
    });
}

// ===== マウスイベント処理 =====
function handleMouseDown(e) {
    console.log('🖱️ マウスダウン');
    
    const coords = getCanvasCoordinates(e);
    const clickedPanel = findPanelAt(coords.x, coords.y);
    
    if (clickedPanel) {
        if (e.shiftKey) {
            // Shiftクリックでパネルドラッグ
            startPanelDrag(e, clickedPanel);
        } else {
            // 通常クリックで選択
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
    
    if (selectedElement.id && panels.includes(selectedElement)) {
        // パネルドラッグ
        dragPanel(selectedElement, coords.x, coords.y);
    } else if (selectedElement.panelId) {
        // キャラクターまたは吹き出しドラッグ
        dragElement(selectedElement, coords.x, coords.y);
    }
}

function handleMouseUp(e) {
    if (isDragging) {
        console.log('🖱️ ドラッグ終了');
        isDragging = false;
        selectedElement = null;
    }
}

function handleGlobalMouseUp(e) {
    // キャンバス外でマウスが離された場合の処理
    if (isDragging) {
        console.log('🖱️ グローバルマウスアップ - ドラッグ強制終了');
        isDragging = false;
        selectedElement = null;
    }
}

function handleContextMenu(e) {
    const coords = getCanvasCoordinates(e);
    const clickedPanel = findPanelAt(coords.x, coords.y);
    
    if (clickedPanel) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📐 パネル右クリック:', clickedPanel.id);
        selectPanel(clickedPanel);
        showPanelContextMenu(e, clickedPanel);
    }
}

function handleDoubleClick(e) {
    const coords = getCanvasCoordinates(e);
    const clickedPanel = findPanelAt(coords.x, coords.y);
    
    if (clickedPanel) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📐 パネルダブルクリック分割:', clickedPanel.id);
        splitPanelWithHistory(clickedPanel, 'horizontal');
    }
}

// ===== ドラッグ処理 =====
function startPanelDrag(e, panel) {
    isDragging = true;
    selectedElement = panel;
    
    const coords = getCanvasCoordinates(e);
    dragOffset.x = coords.x - panel.x;
    dragOffset.y = coords.y - panel.y;
    
    console.log('🚀 パネルドラッグ開始');
}

function dragPanel(panel, x, y) {
    panel.x = x - dragOffset.x;
    panel.y = y - dragOffset.y;
    
    // キャンバス内に制限
    panel.x = Math.max(0, Math.min(canvas.width - panel.width, panel.x));
    panel.y = Math.max(0, Math.min(canvas.height - panel.height, panel.y));
    
    redrawCanvas();
    drawGuidelines();
    safeExecute('updateCharacterOverlay');
    safeExecute('updateBubbleOverlay');
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
        safeExecute('updateCharacterOverlay');
    } else if (selectedBubble) {
        safeExecute('updateBubbleOverlay');
    }
    
    updateControlsFromElement();
}

// ===== 選択処理 =====
function selectPanel(panel) {
    selectedPanel = panel;
    selectedCharacter = null;
    selectedBubble = null;
    selectedElement = null;
    
    redrawCanvas();
    drawGuidelines();
    updateStatus();
    
    console.log('📐 パネル選択:', panel.id);
}

function selectCharacter(character) {
    selectedCharacter = character;
    selectedBubble = null;
    selectedPanel = null;
    selectedElement = character;
    
    safeExecute('updateCharacterOverlay');
    updateControlsFromElement();
    updateStatus();
    
    console.log('👤 キャラクター選択:', character.name);
}

function selectBubble(bubble) {
    selectedBubble = bubble;
    selectedCharacter = null;
    selectedPanel = null;
    selectedElement = bubble;
    
    safeExecute('updateBubbleOverlay');
    updateControlsFromElement();
    updateStatus();
    
    console.log('💬 吹き出し選択:', bubble.text.substring(0, 15));
}

function clearSelection() {
    selectedPanel = null;
    selectedCharacter = null;
    selectedBubble = null;
    selectedElement = null;
    
    redrawCanvas();
    drawGuidelines();
    safeExecute('updateCharacterOverlay');
    safeExecute('updateBubbleOverlay');
    updateStatus();
    
    console.log('❌ 選択解除');
}

// ===== コンテキストメニュー =====
function showPanelContextMenu(e, panel) {
    // 既存のメニューを削除
    const existingMenu = document.querySelector('.panel-context-menu');
    if (existingMenu) existingMenu.remove();
    
    const menu = document.createElement('div');
    menu.className = 'panel-context-menu';
    
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
    `;
    
    const menuItems = [
        { text: '📐 横に分割', action: () => splitPanelWithHistory(panel, 'horizontal'), key: 'H' },
        { text: '📏 縦に分割', action: () => splitPanelWithHistory(panel, 'vertical'), key: 'V' },
        { text: '📋 複製', action: () => duplicatePanelWithHistory(panel), key: 'D' },
        { text: '🔄 90度回転', action: () => rotatePanelWithHistory(panel), key: 'R' },
        { text: '─────────', action: null },
        { text: '🗑️ 削除', action: () => deletePanelWithHistory(panel), className: 'delete-item', key: 'Del' },
        { text: '❌ キャンセル', action: closeContextMenu, key: 'Esc' }
    ];
    
    menuItems.forEach(item => {
        if (item.text === '─────────') {
            const divider = document.createElement('div');
            divider.style.cssText = `height: 1px; background: ${isDark ? '#444' : '#eee'}; margin: 4px 0;`;
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
        `;
        
        menuItem.addEventListener('click', () => {
            if (item.action) item.action();
            closeContextMenu();
        });
        
        menuItem.addEventListener('mouseenter', () => {
            if (item.className === 'delete-item') {
                menuItem.style.background = isDark ? '#4a2c2c' : '#ffebee';
                menuItem.style.color = isDark ? '#ff6b6b' : '#d32f2f';
            } else {
                menuItem.style.background = isDark ? '#404040' : '#f0f4ff';
            }
        });
        
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.background = '';
            menuItem.style.color = isDark ? '#e0e0e0' : '#333';
        });
        
        menu.appendChild(menuItem);
    });
    
    document.body.appendChild(menu);
    
    // クリック外で閉じる
    setTimeout(() => {
        document.addEventListener('click', closeContextMenu, { once: true });
    }, 100);
}

function closeContextMenu() {
    const menu = document.querySelector('.panel-context-menu');
    if (menu) menu.remove();
}

// ===== 操作履歴管理 =====
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

function undo() {
    if (currentHistoryIndex < 0) {
        console.log('❌ Undo: 履歴がありません');
        showNotification('元に戻す操作がありません', 'warning', 2000);
        return;
    }
    
    const operation = operationHistory[currentHistoryIndex];
    console.log(`⏪ Undo実行: ${operation.type}`);
    
    executeUndoOperation(operation);
    
    currentHistoryIndex--;
    updateUndoRedoButtons();
    updateDisplay();
    showNotification(`${operation.type}を元に戻しました`, 'success', 2000);
}

function redo() {
    if (currentHistoryIndex >= operationHistory.length - 1) {
        console.log('❌ Redo: やり直す操作がありません');
        showNotification('やり直す操作がありません', 'warning', 2000);
        return;
    }
    
    currentHistoryIndex++;
    const operation = operationHistory[currentHistoryIndex];
    console.log(`⏩ Redo実行: ${operation.type}`);
    
    executeRedoOperation(operation);
    
    updateUndoRedoButtons();
    updateDisplay();
    showNotification(`${operation.type}をやり直しました`, 'success', 2000);
}

function executeUndoOperation(operation) {
    switch (operation.type) {
        case 'split':
            panels = panels.filter(p => p.id !== operation.newPanelId);
            const originalPanel = panels.find(p => p.id === operation.originalPanel.id);
            if (originalPanel) Object.assign(originalPanel, operation.originalPanel);
            break;
        case 'delete':
            panels.push(operation.originalPanel);
            characters.push(...(operation.originalElements.characters || []));
            speechBubbles.push(...(operation.originalElements.bubbles || []));
            break;
        case 'duplicate':
            panels = panels.filter(p => p.id !== operation.newPanel.id);
            characters = characters.filter(c => c.panelId !== operation.newPanel.id);
            speechBubbles = speechBubbles.filter(b => b.panelId !== operation.newPanel.id);
            break;
        case 'rotate':
            const panel = panels.find(p => p.id === operation.panelId);
            if (panel) Object.assign(panel, operation.originalPanel);
            break;
    }
}

function executeRedoOperation(operation) {
    switch (operation.type) {
        case 'split':
            splitPanel(panels.find(p => p.id === operation.originalPanel.id), operation.direction);
            break;
        case 'delete':
            deletePanel(panels.find(p => p.id === operation.originalPanel.id));
            break;
        case 'duplicate':
            duplicatePanel(panels.find(p => p.id === operation.originalPanel.id));
            break;
        case 'rotate':
            const panel = panels.find(p => p.id === operation.panelId);
            if (panel) Object.assign(panel, operation.newPanel);
            break;
    }
}

// ===== 履歴付き操作関数 =====
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
    const originalPanel = JSON.parse(JSON.stringify(panel));
    duplicatePanel(panel);
    
    const newPanel = panels[panels.length - 1];
    addToHistory({
        type: 'duplicate',
        originalPanel: originalPanel,
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

// ===== パネル操作関数 =====
function splitPanel(panel, direction = 'horizontal') {
    console.log(`✂️ パネル分割: ${panel.id}, 方向: ${direction}`);
    
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
    updateDisplay();
    selectPanel(newPanel);
    
    console.log(`✅ 分割完了: パネル${panel.id} → パネル${newPanel.id}`);
    showNotification(`パネル${panel.id}を${direction === 'horizontal' ? '横' : '縦'}に分割しました`, 'success', 2000);
}

function duplicatePanel(panel) {
    console.log('📋 パネル複製:', panel.id);
    
    const newPanel = {
        id: Math.max(...panels.map(p => p.id)) + 1,
        x: Math.min(panel.x + 20, canvas.width - panel.width),
        y: Math.min(panel.y + 20, canvas.height - panel.height),
        width: panel.width,
        height: panel.height
    };
    
    panels.push(newPanel);
    updateDisplay();
    selectPanel(newPanel);
    
    console.log(`✅ 複製完了: パネル${panel.id} → パネル${newPanel.id}`);
    showNotification(`パネル${panel.id}を複製しました`, 'success', 2000);
}

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
    
    updateDisplay();
    
    console.log(`✅ 回転完了: パネル${panel.id} (${panel.width}x${panel.height})`);
    showNotification(`パネル${panel.id}を90度回転しました`, 'success', 2000);
}

function deletePanel(panel) {
    console.log('🗑️ パネル削除:', panel.id);
    
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
    
    updateDisplay();
    
    console.log(`✅ 削除完了: パネル${panel.id}`);
    showNotification(`パネル${panel.id}を削除しました`, 'success', 2000);
}

// ===== コントロール更新 =====
function updateControlsFromElement() {
    if (!selectedElement) return;
    
    const scaleEl = document.getElementById('elementScale');
    const xEl = document.getElementById('elementX');
    const yEl = document.getElementById('elementY');
    const characterSettings = document.getElementById('characterSettings');
    
    if (scaleEl) scaleEl.value = selectedElement.scale || 1.0;
    if (xEl) xEl.value = selectedElement.x || 0.5;
    if (yEl) yEl.value = selectedElement.y || 0.5;
    
    if (selectedCharacter && characterSettings) {
        characterSettings.style.display = 'block';
        updateCharacterControls();
    } else if (characterSettings) {
        characterSettings.style.display = 'none';
    }
}

function updateCharacterControls() {
    const controls = ['characterFacing', 'characterGaze', 'characterPose', 'characterExpression'];
    const defaults = { facing: 'front', gaze: 'center', pose: 'standing', expression: 'neutral' };
    
    controls.forEach(control => {
        const element = document.getElementById(control);
        const property = control.replace('character', '').toLowerCase();
        if (element) {
            element.value = selectedCharacter[property] || defaults[property];
        }
    });
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
        safeExecute('updateCharacterOverlay');
    } else if (selectedBubble) {
        safeExecute('updateBubbleOverlay');
    }
    
    updateStatus();
}

function updateCharacterSettings() {
    if (!selectedCharacter) return;
    
    const controls = {
        'characterFacing': 'facing',
        'characterGaze': 'gaze',
        'characterPose': 'pose',
        'characterExpression': 'expression'
    };
    
    Object.entries(controls).forEach(([elementId, property]) => {
        const element = document.getElementById(elementId);
        if (element) {
            selectedCharacter[property] = element.value;
        }
    });
    
    safeExecute('updateCharacterOverlay');
}

// ===== 削除機能（修正版 - 統一対応） =====
function deleteSelected() {
    if (selectedCharacter) {
        console.log('🗑️ キャラクター削除:', selectedCharacter.name);
        characters = characters.filter(char => char.id !== selectedCharacter.id);
        selectedCharacter = null;
        safeExecute('updateCharacterOverlay');
        showNotification('キャラクターを削除しました', 'success', 2000);
    } else if (selectedBubble) {
        console.log('🗑️ 吹き出し削除:', selectedBubble.text.substring(0, 10));
        speechBubbles = speechBubbles.filter(bubble => bubble.id !== selectedBubble.id);
        selectedBubble = null;
        safeExecute('updateBubbleOverlay');
        showNotification('吹き出しを削除しました', 'success', 2000);
    } else if (selectedPanel) {
        console.log('🗑️ パネル削除:', selectedPanel.id);
        deletePanelWithHistory(selectedPanel);
        return;
    } else {
        console.log('❌ 削除対象が選択されていません');
        showNotification('削除する要素を選択してください', 'warning', 2000);
        return;
    }
    
    selectedElement = null;
    updateStatus();
    updateElementCount();
}

// ===== キーボードショートカット（修正版） =====
function handleKeyDown(e) {
    // Ctrl/Cmd キーとの組み合わせ
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                safeExecute('saveProject');
                break;
            case 'e':
                e.preventDefault();
                safeExecute('exportToClipStudio');
                break;
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                break;
            case 'y':
                e.preventDefault();
                redo();
                break;
            case 'd':
                e.preventDefault();
                if (selectedPanel) {
                    duplicatePanelWithHistory(selectedPanel);
                }
                break;
        }
        return;
    }
    
    // 単体キー（修正版 - Backspaceも追加）
    switch(e.key) {
        case 'Delete':
        case 'Backspace':  // Backspaceキーも追加
            if (selectedPanel || selectedCharacter || selectedBubble) {
                e.preventDefault();
                console.log('⌨️ キーボード削除実行:', e.key);
                deleteSelected();
            }
            break;
        case 'Escape':
            clearSelection();
            closeContextMenu();
            break;
        case 'h':
            if (selectedPanel) {
                e.preventDefault();
                splitPanelWithHistory(selectedPanel, 'horizontal');
            }
            break;
        case 'v':
            if (selectedPanel) {
                e.preventDefault();
                splitPanelWithHistory(selectedPanel, 'vertical');
            }
            break;
        case 'd':
            if (selectedPanel) {
                e.preventDefault();
                duplicatePanelWithHistory(selectedPanel);
            }
            break;
        case 'r':
            if (selectedPanel) {
                e.preventDefault();
                rotatePanelWithHistory(selectedPanel);
            }
            break;
        case 'g':
            const showGuides = document.getElementById('showGuides');
            if (showGuides) {
                showGuides.checked = !showGuides.checked;
                toggleGuides();
            }
            break;
        case 'F1':
        case '?':
            e.preventDefault();
            showKeyboardHelp();
            break;
    }
}

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
                <div class="help-item"><kbd>Delete</kbd> / <kbd>Backspace</kbd> 削除</div>
            </div>
            
            <div class="help-section">
                <h4>🔄 操作履歴</h4>
                <div class="help-item"><kbd>Ctrl+Z</kbd> 元に戻す</div>
                <div class="help-item"><kbd>Ctrl+Y</kbd> / <kbd>Ctrl+Shift+Z</kbd> やり直し</div>
            </div>
            
            <div class="help-section">
                <h4>🎭 要素操作</h4>
                <div class="help-item"><kbd>Delete</kbd> / <kbd>Backspace</kbd> 選択要素を削除</div>
                <div class="help-item">選択された要素（パネル・キャラ・吹き出し）を削除</div>
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
