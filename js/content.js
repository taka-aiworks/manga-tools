// ===== コンテンツ管理モジュール =====

// ===== キャラクター管理 =====
function addCharacter(type) {
    if (!selectedPanel) {
        alert('❌ まずコマを選択してください');
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
    
    console.log('👤 キャラクター追加:', character.name, 'in panel', selectedPanel.id);
}

function getCharacterName(type) {
    const names = {
        'hero': '主人公',
        'heroine': 'ヒロイン',
        'rival': 'ライバル',
        'friend': '友人'
    };
    return names[type] || 'キャラクター';
}

function applyCharacterLayout(layoutName) {
    if (!selectedPanel || !characterLayouts[layoutName]) {
        if (!selectedPanel) {
            alert('❌ まずコマを選択してください');
        }
        return;
    }
    
    console.log('👥 キャラ配置パターン適用:', layoutName);
    
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

// updateCharacterOverlay関数を完全に書き換え
function updateCharacterOverlay() {
    const overlay = document.getElementById('characterOverlay');
    if (!overlay) return;
    
    overlay.innerHTML = '';
    
    characters.forEach(character => {
        const panel = panels.find(p => p.id === character.panelId);
        if (!panel) return;
        
        const element = createCharacterElement(character, panel);
        overlay.appendChild(element);
        
        // 選択されたキャラクターのみリサイズハンドルを表示
        if (selectedCharacter === character) {
            const handles = element.querySelectorAll('.resize-handle');
            handles.forEach(handle => {
                handle.style.display = 'block';
            });
        } else {
            const handles = element.querySelectorAll('.resize-handle');
            handles.forEach(handle => {
                handle.style.display = 'none';
            });
        }
    });
}

// 位置更新専用関数
function updateCharacterElementPosition(element, character, panel) {
    const charX = panel.x + (panel.width * character.x) - 30;
    const charY = panel.y + (panel.height * character.y) - 20;
    const charWidth = 60 * character.scale;
    const charHeight = 40 * character.scale;
    
    Object.assign(element.style, {
        left: charX + 'px',
        top: charY + 'px',
        width: charWidth + 'px',
        height: charHeight + 'px'
    });
    
    // 選択状態の更新
    if (selectedCharacter === character) {
        element.classList.add('selected');
    } else {
        element.classList.remove('selected');
    }
}

function createCharacterElement(character, panel) {
    const element = document.createElement('div');
    element.className = 'character-placeholder';
    element.dataset.charId = character.id;
    
    // キャラクターの向きと視線を反映
    if (character.facing) {
        element.classList.add(`character-facing-${character.facing}`);
    }
    if (character.gaze) {
        element.classList.add(`gaze-${character.gaze}`);
    }
    
    // 人型キャラクター構造を作成
    element.innerHTML = `
        <div class="character-body">
            <div class="character-head">
                <div class="character-eyes">
                    <div class="character-eye"></div>
                    <div class="character-eye"></div>
                </div>
            </div>
            <div class="character-arms"></div>
            <div class="character-torso"></div>
            <div class="character-legs">
                <div class="character-leg"></div>
                <div class="character-leg"></div>
            </div>
        </div>
        <div class="character-name">${character.name}</div>
    `;
    
    // ===== リサイズハンドルを追加 =====
    addResizeHandles(element, character);
    
    // 初期位置設定
    updateCharacterElementPosition(element, character, panel);
    element.style.cursor = 'move';
    
    // イベントリスナー（移動用）
    addCharacterMoveEvents(element, character, panel);
    
    return element;
}

// リサイズハンドル追加関数
function addResizeHandles(element, character) {
    const handles = [
        'top-left', 'top-right', 'bottom-left', 'bottom-right',
        'top', 'bottom', 'left', 'right'
    ];
    
    handles.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${position}`;
        handle.dataset.position = position;
        
        // リサイズイベント
        handle.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            e.preventDefault();
            startResize(e, character, position);
        });
        
        element.appendChild(handle);
    });
}

// キャラクター移動イベント（分離）
function addCharacterMoveEvents(element, character, panel) {
    let clickCount = 0;
    
    element.addEventListener('mousedown', function(e) {
        // リサイズハンドルクリックの場合はスキップ
        if (e.target.classList.contains('resize-handle')) {
            return;
        }
        
        clickCount++;
        console.log('👤 キャラクタークリック:', character.name, 'count:', clickCount);
        
        e.stopPropagation();
        e.preventDefault();
        
        setTimeout(() => { clickCount = 0; }, 200);
        
        if (clickCount > 1) {
            console.log('🚫 重複クリック無視');
            return;
        }
        
        if (isDragging) {
            console.log('⚠️ 既にドラッグ中 - 無視');
            return;
        }
        
        selectCharacter(character);
        
        isDragging = true;
        selectedElement = character;
        
        const coords = getCanvasCoordinates(e);
        dragOffset.x = coords.x - (panel.x + panel.width * character.x);
        dragOffset.y = coords.y - (panel.y + panel.height * character.y);
        
        console.log('🚀 ドラッグ開始');
    });
}

// ===== 吹き出し管理 =====
function addBubble(bubbleType) {
    if (!selectedPanel) {
        alert('❌ まずコマを選択してください');
        return;
    }
    
    const dialogueText = document.getElementById('dialogueText')?.value.trim() || '';
    
    if (!dialogueText && bubbleType !== 'narration') {
        alert('❌ セリフを入力してください');
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
    updateStatus();
    updateElementCount();
    
    // テキストエリアをクリア
    const dialogueInput = document.getElementById('dialogueText');
    if (dialogueInput) {
        dialogueInput.value = '';
    }
    
    console.log('💬 吹き出し追加:', bubbleType, bubble.text);
}

function autoPlaceBubbles() {
    if (!selectedPanel) {
        alert('❌ まずコマを選択してください');
        return;
    }
    
    const panelBubbles = speechBubbles.filter(b => b.panelId === selectedPanel.id);
    const panelCharacters = characters.filter(c => c.panelId === selectedPanel.id);
    
    console.log('✨ 吹き出し自動配置:', panelBubbles.length, '個');
    
    panelBubbles.forEach((bubble, index) => {
        if (panelCharacters.length > 0) {
            // キャラクターの上に配置
            const character = panelCharacters[index % panelCharacters.length];
            bubble.x = character.x;
            bubble.y = Math.max(0.1, character.y - 0.3);
        } else {
            // キャラクターがいない場合は上部に配置
            bubble.x = 0.2 + (index * 0.3);
            bubble.y = 0.2;
        }
    });
    
    updateBubbleOverlay();
}

function updateBubbleOverlay() {
    const overlay = document.getElementById('bubbleOverlay');
    if (!overlay) return;
    
    overlay.innerHTML = '';
    
    speechBubbles.forEach(bubble => {
        const panel = panels.find(p => p.id === bubble.panelId);
        if (!panel) return;
        
        const element = createBubbleElement(bubble, panel);
        overlay.appendChild(element);
    });
}

// ===== content.jsのcreateBubbleElement関数を以下に置き換えてください =====

// 🔄 置き換え：createBubbleElement関数（ドラッグ機能付き）
function createBubbleElement(bubble, panel) {
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
    
    // スタイル適用
    Object.assign(element.style, {
        left: bubbleX + 'px',
        top: bubbleY + 'px',
        width: (bubble.width * bubble.scale) + 'px',
        height: (bubble.height * bubble.scale) + 'px',
        cursor: 'move'
    });
    
    // ===== ドラッグ機能を追加 =====
    addBubbleDragEvents(element, bubble, panel);
    
    // 吹き出しの尻尾を追加
    if (bubble.type !== 'narration') {
        const tail = createBubbleTail(bubble);
        element.appendChild(tail);
    }
    
    return element;
}

function createBubbleTail(bubble) {
    const tail = document.createElement('div');
    tail.className = 'bubble-tail bottom-left';
    
    // 吹き出しタイプに応じて尻尾の色を変更
    const tailColors = {
        'normal': '#333',
        'shout': '#333',
        'whisper': '#999',
        'thought': '#333'
    };
    
    const color = tailColors[bubble.type] || '#333';
    tail.style.borderTopColor = color;
    
    return tail;
}

// ===== 高度な吹き出し機能 =====
// 🔄 adjustBubbleSize関数の改良（content.jsに追加または置き換え）
function adjustBubbleSize(bubble) {
    const textLength = bubble.text.length;
    const lineCount = Math.ceil(textLength / 12); // 12文字で改行
    
    // 幅の調整
    bubble.width = Math.max(60, Math.min(220, textLength * 8 + 30));
    
    // 高さの調整
    bubble.height = Math.max(35, lineCount * 22 + 25);
    
    console.log(`📏 吹き出しサイズ調整: ${bubble.width}x${bubble.height} (${textLength}文字)`);
}

// 🆕 一括文字編集機能
function editAllBubblesInPanel(panelId) {
    const panelBubbles = speechBubbles.filter(b => b.panelId === panelId);
    
    if (panelBubbles.length === 0) {
        alert('❌ このパネルには吹き出しがありません');
        return;
    }
    
    const texts = panelBubbles.map(b => b.text).join('\n');
    const newTexts = prompt('パネル内の吹き出しテキスト（1行1個）:', texts);
    
    if (newTexts === null) return; // キャンセル
    
    const newTextArray = newTexts.split('\n').map(t => t.trim()).filter(t => t);
    
    panelBubbles.forEach((bubble, index) => {
        if (index < newTextArray.length) {
            bubble.text = newTextArray[index];
            adjustBubbleSize(bubble);
        }
    });
    
    updateBubbleOverlay();
    updateStatus();
    
    console.log(`📝 パネル${panelId}の吹き出し一括編集完了`);
}

function formatBubbleText(bubble) {
    // 長いテキストを自動改行
    const maxCharsPerLine = 10;
    const text = bubble.text;
    
    if (text.length <= maxCharsPerLine) {
        return text;
    }
    
    const lines = [];
    for (let i = 0; i < text.length; i += maxCharsPerLine) {
        lines.push(text.substring(i, i + maxCharsPerLine));
    }
    
    return lines.join('\n');
}

// ===== テンプレート拡張 =====
function addCustomTemplate(name, panelData) {
    templates[name] = panelData;
    console.log('📚 カスタムテンプレート追加:', name);
}

function saveAsTemplate() {
    if (panels.length === 0) {
        alert('❌ パネルがありません');
        return;
    }
    
    const templateName = prompt('テンプレート名を入力してください:');
    if (!templateName) return;
    
    const templateData = JSON.parse(JSON.stringify(panels));
    addCustomTemplate(templateName, templateData);
    
    alert(`✅ テンプレート "${templateName}" を保存しました`);
}

// ===== パネル操作 =====
function duplicatePanel(panel) {
    const newPanel = {
        ...panel,
        id: panels.length + 1,
        x: panel.x + 20,
        y: panel.y + 20
    };
    
    panels.push(newPanel);
    redrawCanvas();
    drawGuidelines();
    
    console.log('📋 パネル複製:', newPanel.id);
}

function resizePanel(panel, width, height) {
    panel.width = Math.max(50, width);
    panel.height = Math.max(30, height);
    
    redrawCanvas();
    drawGuidelines();
    updateCharacterOverlay();
    updateBubbleOverlay();
    
    console.log('📐 パネルリサイズ:', panel.id, `${panel.width}x${panel.height}`);
}

// ===== コンテンツ検索・フィルター =====
function findCharactersByPanel(panelId) {
    return characters.filter(char => char.panelId === panelId);
}

function findBubblesByPanel(panelId) {
    return speechBubbles.filter(bubble => bubble.panelId === panelId);
}

function findCharactersByType(type) {
    return characters.filter(char => char.type === type);
}

function getElementsInPanel(panelId) {
    return {
        characters: findCharactersByPanel(panelId),
        bubbles: findBubblesByPanel(panelId)
    };
}

// ===== コンテンツ統計 =====
function getContentStats() {
    return {
        totalPanels: panels.length,
        totalCharacters: characters.length,
        totalBubbles: speechBubbles.length,
        panelsWithCharacters: new Set(characters.map(c => c.panelId)).size,
        panelsWithBubbles: new Set(speechBubbles.map(b => b.panelId)).size,
        averageCharactersPerPanel: characters.length / panels.length || 0,
        averageBubblesPerPanel: speechBubbles.length / panels.length || 0
    };
}

// ===== バリデーション =====
function validateContent() {
    const issues = [];
    
    // 空のパネルチェック
    panels.forEach(panel => {
        const elements = getElementsInPanel(panel.id);
        if (elements.characters.length === 0 && elements.bubbles.length === 0) {
            issues.push(`パネル${panel.id}: 要素がありません`);
        }
    });
    
    // セリフのないキャラクターチェック
    characters.forEach(char => {
        const panelBubbles = findBubblesByPanel(char.panelId);
        if (panelBubbles.length === 0) {
            issues.push(`パネル${char.panelId}: ${char.name}にセリフがありません`);
        }
    });
    
    return issues;
}

// 🆕 吹き出し文字編集機能 - content.jsに追加
function createBubbleElement(bubble, panel) {
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
    
    // スタイル適用
    Object.assign(element.style, {
        left: bubbleX + 'px',
        top: bubbleY + 'px',
        width: (bubble.width * bubble.scale) + 'px',
        height: (bubble.height * bubble.scale) + 'px',
        cursor: 'move'
    });
    
    // ===== 文字編集機能を追加 =====
    addBubbleEditEvents(element, bubble, panel);
    
    // ドラッグ機能を追加
    addBubbleDragEvents(element, bubble, panel);
    
    // 吹き出しの尻尾を追加
    if (bubble.type !== 'narration') {
        const tail = createBubbleTail(bubble);
        element.appendChild(tail);
    }
    
    return element;
}

// 🆕 吹き出し編集イベント追加
function addBubbleEditEvents(element, bubble, panel) {
    // ダブルクリックで編集モード
    element.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        console.log('✏️ 吹き出し編集開始:', bubble.text);
        
        // ドラッグ状態を強制終了
        isDragging = false;
        selectedElement = null;
        
        startBubbleEdit(element, bubble);
    });
    
    // 右クリックでも編集可能
    element.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📝 右クリック編集:', bubble.text);
        startBubbleEdit(element, bubble);
    });
}

// 🆕 吹き出し編集開始
function startBubbleEdit(element, bubble) {
    // 選択状態にする
    selectBubble(bubble);
    
    // 編集用のテキストエリアを作成
    const editArea = document.createElement('textarea');
    editArea.className = 'bubble-edit-area';
    editArea.value = bubble.text;
    
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
        textAlign: 'center',
        lineHeight: '1.2',
        outline: 'none',
        boxShadow: '0 0 15px rgba(255, 102, 0, 0.7)'
    });
    
    // 元の要素を隠す
    element.style.opacity = '0.3';
    element.style.pointerEvents = 'none';
    
    // 編集エリアを追加
    const bubbleOverlay = document.getElementById('bubbleOverlay');
    bubbleOverlay.appendChild(editArea);
    
    // フォーカスして全選択
    editArea.focus();
    editArea.select();
    
    // 編集完了イベント
    const finishEdit = () => {
        const newText = editArea.value.trim() || '...';
        
        console.log('💾 編集完了:', bubble.text, '→', newText);
        
        // テキストを更新
        bubble.text = newText;
        element.textContent = newText;
        
        // サイズを自動調整
        adjustBubbleSize(bubble);
        
        // 編集エリアを削除
        if (editArea.parentNode) {
            editArea.parentNode.removeChild(editArea);
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
    
    // Enterで確定
    editArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            finishEdit();
        } else if (e.key === 'Escape') {
            // ESCでキャンセル
            e.preventDefault();
            
            // 編集エリアを削除
            if (editArea.parentNode) {
                editArea.parentNode.removeChild(editArea);
            }
            
            // 元の要素を復元
            element.style.opacity = '';
            element.style.pointerEvents = '';
            
            console.log('❌ 編集キャンセル');
        }
    });
    
    // フォーカスが外れたら確定
    editArea.addEventListener('blur', finishEdit);
    
    // 自動リサイズ（入力に応じてサイズ調整）
    editArea.addEventListener('input', function() {
        const textLength = this.value.length;
        const minWidth = 60;
        const maxWidth = 200;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, textLength * 8 + 40));
        
        this.style.width = newWidth + 'px';
        
        // 高さも調整
        const lineCount = Math.ceil(textLength / 10);
        const newHeight = Math.max(30, lineCount * 20 + 20);
        this.style.height = newHeight + 'px';
    });
}





console.log('✅ content.js 読み込み完了');
