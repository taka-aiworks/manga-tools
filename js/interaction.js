// ===== インタラクションモジュール =====

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
    canvas.addEventListener('click', handleCanvasClick);
    
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
    
    if (scaleEl) scaleEl.value = selectedElement.scale || 1.0;
    if (xEl) xEl.value = selectedElement.x || 0.5;
    if (yEl) yEl.value = selectedElement.y || 0.5;
    
    if (typeEl) {
        if (selectedCharacter) {
            typeEl.value = 'character';
        } else if (selectedBubble) {
            typeEl.value = 'bubble';
        }
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

// ===== キーボードショートカット =====
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

console.log('✅ interaction.js 読み込み完了');
