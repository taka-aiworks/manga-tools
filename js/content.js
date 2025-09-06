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

// createCharacterElement関数の最後に追加
function createCharacterElement(character, panel) {
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
    
    // スタイル適用
    Object.assign(element.style, {
        left: charX + 'px',
        top: charY + 'px',
        width: charWidth + 'px',
        height: charHeight + 'px',
        cursor: 'move'
    });
    
    // 変形適用
    let transform = '';
    if (character.rotation) {
        transform += `rotate(${character.rotation}deg) `;
    }
    if (character.flip) {
        transform += 'scaleX(-1) ';
    }
    if (transform) {
        element.style.transform = transform.trim();
    }
    
    // ===== ここを追加 =====
    element.addEventListener('mousedown', function(e) {
        console.log('👤 キャラクター要素クリック:', character.name);
        e.stopPropagation();
        e.preventDefault();
        selectCharacter(character);
        startDragging(e, character);
    });
    
    element.addEventListener('click', function(e) {
        console.log('👤 キャラクター要素click:', character.name);
        e.stopPropagation();
    });
    
    return element;
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
function adjustBubbleSize(bubble) {
    // テキストの長さに応じて吹き出しサイズを調整
    const textLength = bubble.text.length;
    const lineCount = Math.ceil(textLength / 10); // 10文字で改行と仮定
    
    bubble.width = Math.max(60, Math.min(200, textLength * 8 + 20));
    bubble.height = Math.max(30, lineCount * 20 + 20);
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

console.log('✅ content.js 読み込み完了');
