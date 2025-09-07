// ===== コンテンツ管理モジュール =====

// ===== キャラクター管理 =====
function addCharacter(type) {
    if (!selectedPanel) {
        showNotification('まずコマを選択してください', 'warning', 2000);
        return;
    }
    
    const character = {
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: selectedPanel.id,
        type: type,
        name: getCharacterName(type),
        x: 0.5,
        y: 0.6,
        scale: 0.8,
        rotation: 0,
        flip: false,
        facing: 'front',
        gaze: 'center',
        pose: 'standing',
        expression: 'neutral'
    };
    
    characters.push(character);
    updateCharacterOverlay();
    updateStatus();
    updateElementCount();
    
    console.log('👤 キャラクター追加:', character.name, 'in panel', selectedPanel.id);
    showNotification(`${character.name}を追加しました`, 'success', 2000);
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
    if (!selectedPanel) {
        showNotification('まずコマを選択してください', 'warning', 2000);
        return;
    }
    
    if (!characterLayouts[layoutName]) {
        console.warn('⚠️ 不明なレイアウト:', layoutName);
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
            facing: 'front',
            gaze: 'center',
            pose: 'standing',
            expression: 'neutral',
            ...pos
        };
        characters.push(character);
    });
    
    updateCharacterOverlay();
    updateStatus();
    updateElementCount();
    
    showNotification(`${layoutName}レイアウトを適用しました`, 'success', 2000);
}

function updateCharacterOverlay() {
    const overlay = document.getElementById('characterOverlay');
    if (!overlay) return;
    
    overlay.innerHTML = '';
    
    characters.forEach(character => {
        const panel = panels.find(p => p.id === character.panelId);
        if (!panel) return;
        
        const element = createCharacterElement(character, panel);
        overlay.appendChild(element);
    });
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
    
    // 選択状態の反映
    if (selectedCharacter === character) {
        element.classList.add('selected');
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
    
    // 位置とサイズ設定
    updateCharacterElementPosition(element, character, panel);
    element.style.cursor = 'move';
    
    // イベントリスナー
    addCharacterEvents(element, character, panel);
    
    return element;
}

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
}

function addCharacterEvents(element, character, panel) {
    element.addEventListener('mousedown', function(e) {
        console.log('👤 キャラクタークリック:', character.name);
        e.stopPropagation();
        e.preventDefault();
        
        if (isDragging) {
            isDragging = false;
            selectedElement = null;
        }
        
        selectCharacter(character);
        
        isDragging = true;
        selectedElement = character;
        
        const coords = getCanvasCoordinates(e);
        dragOffset.x = coords.x - (panel.x + panel.width * character.x);
        dragOffset.y = coords.y - (panel.y + panel.height * character.y);
        
        console.log('🚀 キャラクタードラッグ開始');
    });
}

// ===== 吹き出し管理 =====
function addBubble(bubbleType) {
    if (!selectedPanel) {
        showNotification('まずコマを選択してください', 'warning', 2000);
        return;
    }
    
    const dialogueText = document.getElementById('dialogueText')?.value.trim() || '';
    
    if (!dialogueText && bubbleType !== 'narration') {
        showNotification('セリフを入力してください', 'warning', 2000);
        return;
    }
    
    const bubble = {
        id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: selectedPanel.id,
        type: bubbleType,
        text: dialogueText || 'テキスト',
        x: 0.5,
        y: 0.3,
        scale: 1.0,
        width: Math.max(60, dialogueText.length * 8 + 20),
        height: 40,
        vertical: false
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
    showNotification('吹き出しを追加しました', 'success', 2000);
}

function autoPlaceBubbles() {
    if (!selectedPanel) {
        showNotification('まずコマを選択してください', 'warning', 2000);
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
    showNotification('吹き出しを自動配置しました', 'success', 2000);
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

function createBubbleElement(bubble, panel) {
    const element = document.createElement('div');
    element.className = `speech-bubble ${bubble.type}`;
    
    // 縦書き対応
    if (bubble.vertical) {
        element.classList.add('vertical-text');
    }
    
    // 選択状態の反映
    if (selectedBubble === bubble) {
        element.classList.add('selected');
    }
    
    element.dataset.bubbleId = bubble.id;
    
    // テキスト表示
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
    
    // イベントリスナー
    addBubbleEvents(element, bubble, panel);
    
    // 吹き出しの尻尾を追加
    if (bubble.type !== 'narration') {
        const tail = createBubbleTail(bubble);
        element.appendChild(tail);
    }
    
    return element;
}

function createVerticalText(text) {
    const characters = text.split('');
    const verticalHTML = characters.map(char => {
        if (char === '\n' || char === ' ') {
            return '<br>';
        }
        return `<span class="vertical-char">${char}</span>`;
    }).join('');
    
    return `<div class="vertical-text-container">${verticalHTML}</div>`;
}

function createBubbleTail(bubble) {
    const tail = document.createElement('div');
    tail.className = 'bubble-tail bottom-left';
    
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

function addBubbleEvents(element, bubble, panel) {
    let clickCount = 0;
    let lastClickTime = 0;
    
    element.addEventListener('mousedown', function(e) {
        const currentTime = Date.now();
        clickCount++;
        
        console.log(`💬 吹き出しクリック${clickCount}回目:`, bubble.text.substring(0, 10));
        
        e.stopPropagation();
        e.preventDefault();
        
        // ダブルクリック判定（400ms以内の2回目のクリック）
        if (clickCount === 2 && (currentTime - lastClickTime) < 400) {
            console.log('💬 ダブルクリック検出 - 編集開始');
            startBubbleEdit(element, bubble);
            clickCount = 0;
            return;
        }
        
        // シングルクリックの処理（遅延実行）
        if (clickCount === 1) {
            lastClickTime = currentTime;
            
            setTimeout(() => {
                if (clickCount === 1) {
                    console.log('💬 シングルクリック - ドラッグ開始');
                    
                    selectBubble(bubble);
                    isDragging = true;
                    selectedElement = bubble;
                    
                    const coords = getCanvasCoordinates(e);
                    dragOffset.x = coords.x - (panel.x + panel.width * bubble.x);
                    dragOffset.y = coords.y - (panel.y + panel.height * bubble.y);
                }
                clickCount = 0;
            }, 200);
        }
    });
    
    // 右クリックで編集
    element.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('💬 右クリック編集:', bubble.text);
        startBubbleEdit(element, bubble);
    });
}

function startBubbleEdit(element, bubble) {
    selectBubble(bubble);
    
    // 編集用のテキストエリアを作成
    const editArea = document.createElement('textarea');
    editArea.className = 'bubble-edit-area';
    editArea.value = bubble.text;
    
    // 縦書きモード切り替えボタン
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
        textAlign: 'center',
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
        
        // サイズを自動調整
        adjustBubbleSize(bubble);
        
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
        
        showNotification('吹き出しを編集しました', 'success', 2000);
    };
    
    // Enterで確定、ESCでキャンセル
    editArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            finishEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            
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
        if (!e.relatedTarget || !e.relatedTarget.classList.contains('vertical-toggle-btn')) {
            finishEdit();
        }
    });
}

function adjustBubbleSize(bubble) {
    const textLength = bubble.text.length;
    
    if (bubble.vertical) {
        // 縦書きの場合
        const lineCount = Math.ceil(textLength / 8);
        bubble.height = Math.max(60, Math.min(250, textLength * 12 + 40));
        bubble.width = Math.max(35, lineCount * 25 + 25);
    } else {
        // 横書きの場合
        const lineCount = Math.ceil(textLength / 12);
        bubble.width = Math.max(60, Math.min(220, textLength * 8 + 30));
        bubble.height = Math.max(35, lineCount * 22 + 25);
    }
    
    console.log(`📏 吹き出しサイズ調整: ${bubble.width}x${bubble.height} (${textLength}文字)`);
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
    if (!recommendation) {
        showNotification('推奨設定が見つかりません', 'warning', 2000);
        return;
    }
    
    console.log('✨ 推奨設定適用:', currentScene);
    
    // テンプレート適用
    safeExecute('loadTemplate', recommendation.template);
    
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
    
    showNotification('推奨設定を適用しました', 'success', 2000);
}

// ===== ユーティリティ関数 =====
function getElementsInPanel(panelId) {
    return {
        characters: characters.filter(char => char.panelId === panelId),
        bubbles: speechBubbles.filter(bubble => bubble.panelId === panelId)
    };
}

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

// ===== グローバル関数として公開 =====
window.addCharacter = addCharacter;
window.applyCharacterLayout = applyCharacterLayout;
window.updateCharacterOverlay = updateCharacterOverlay;
window.addBubble = addBubble;
window.autoPlaceBubbles = autoPlaceBubbles;
window.updateBubbleOverlay = updateBubbleOverlay;
window.analyzeScene = analyzeScene;
window.applyRecommendation = applyRecommendation;
window.getElementsInPanel = getElementsInPanel;
window.getContentStats = getContentStats;

console.log('✅ content.js 読み込み完了');
