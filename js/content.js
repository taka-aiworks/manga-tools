// ===== コンテンツ管理モジュール =====

// content.js の addCharacter 関数も履歴対応
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
    
    // 履歴に追加
    addToHistory({
        type: 'addCharacter',
        character: JSON.parse(JSON.stringify(character))
    });
    
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
    
    // 選択時のリサイズハンドルを追加
    if (selectedCharacter === character) {
        addCharacterResizeHandles(element);
    }
    
    // 位置とサイズ設定
    updateCharacterElementPosition(element, character, panel);
    element.style.cursor = 'move';
    
    // イベントリスナー
    addCharacterEvents(element, character, panel);
    
    return element;
}

// 1. キャラクターリサイズハンドルの修正版
function addCharacterResizeHandles(element) {
    const handleSize = 12; // ハンドルサイズを大きく
    const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    
    // 既存のハンドルを削除
    element.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
    
    handles.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${position}`;
        
        // より目立つスタイル設定
        Object.assign(handle.style, {
            position: 'absolute',
            width: handleSize + 'px',
            height: handleSize + 'px',
            background: '#ff6600',
            border: '2px solid #fff',
            borderRadius: '6px',
            cursor: getCursorStyle(position),
            zIndex: '1001',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            // ハンドルを要素の外側に配置
            pointerEvents: 'auto'
        });
        
        // 位置設定（要素の境界線上に配置）
        const offset = -handleSize / 2;
        switch(position) {
            case 'top-left':
                handle.style.top = offset + 'px';
                handle.style.left = offset + 'px';
                break;
            case 'top-right':
                handle.style.top = offset + 'px';
                handle.style.right = offset + 'px';
                break;
            case 'bottom-left':
                handle.style.bottom = offset + 'px';
                handle.style.left = offset + 'px';
                break;
            case 'bottom-right':
                handle.style.bottom = offset + 'px';
                handle.style.right = offset + 'px';
                break;
        }
        
        // データ属性でコーナータイプを設定
        handle.dataset.corner = position;
        
        element.appendChild(handle);
    });
    
    console.log('✅ キャラクターリサイズハンドル追加完了');
}

function getCursorStyle(position) {
    const cursors = {
        'top-left': 'nw-resize',
        'top-right': 'ne-resize',
        'bottom-left': 'sw-resize',
        'bottom-right': 'se-resize'
    };
    return cursors[position] || 'pointer';
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

// 2. キャラクターイベント処理の修正版
function addCharacterEvents(element, character, panel) {
    if (!element || !character || !panel) {
        console.error('❌ addCharacterEvents: 必要なパラメータがありません');
        return;
    }
    
    // グローバル変数の初期化
    if (typeof window.isDragging === 'undefined') window.isDragging = false;
    if (typeof window.isResizing === 'undefined') window.isResizing = false;
    if (typeof window.selectedElement === 'undefined') window.selectedElement = null;
    if (typeof window.dragOffset === 'undefined') window.dragOffset = {x: 0, y: 0};
    if (typeof window.resizeStartData === 'undefined') window.resizeStartData = {};
    
    // メインの mousedown イベント
    element.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        console.log('👤 キャラクタークリック:', character.name);
        selectCharacter(character);
        
        // リサイズハンドルかどうかチェック
        const resizeHandle = e.target.closest('.resize-handle');
        
        if (resizeHandle) {
            console.log('🔧 リサイズハンドル検出:', resizeHandle.dataset.corner);
            startCharacterResize(character, resizeHandle.dataset.corner, e);
        } else {
            console.log('🚀 キャラクタードラッグ開始');
            startCharacterDrag(character, e, panel);
        }
    });
}


// 4. キャラクタードラッグ開始の新規追加
function startCharacterDrag(character, e, panel) {
    window.isDragging = true;
    window.selectedElement = character;
    
    const coords = getCanvasCoordinates ? getCanvasCoordinates(e) : {x: e.clientX, y: e.clientY};
    
    window.dragOffset.x = coords.x - (panel.x + panel.width * character.x);
    window.dragOffset.y = coords.y - (panel.y + panel.height * character.y);
    
    console.log('🚀 ドラッグ開始:', character.name, 'オフセット:', window.dragOffset);
}


// 5. キャラクターリサイズ処理の修正版
function handleCharacterResize(character, mouseX, mouseY) {
    if (!character || !window.resizeStartData || !window.resizeStartData.cornerType) {
        return;
    }
    
    try {
        const deltaX = mouseX - window.resizeStartData.startX;
        const deltaY = mouseY - window.resizeStartData.startY;
        
        // より敏感で直感的なリサイズ計算
        let scaleChange = 0;
        const sensitivity = 0.005; // 感度調整
        
        switch(window.resizeStartData.cornerType) {
            case 'bottom-right':
                scaleChange = (deltaX + deltaY) * sensitivity;
                break;
            case 'top-left':
                scaleChange = -(deltaX + deltaY) * sensitivity;
                break;
            case 'top-right':
                scaleChange = (deltaX - deltaY) * sensitivity;
                break;
            case 'bottom-left':
                scaleChange = (-deltaX + deltaY) * sensitivity;
                break;
        }
        
        const newScale = Math.max(0.2, Math.min(4.0, window.resizeStartData.startScale + scaleChange));
        character.scale = newScale;
        
        console.log(`🔧 リサイズ実行: ${character.name} スケール: ${newScale.toFixed(2)}`);
        
        // 表示更新
        if (typeof updateCharacterOverlay === 'function') {
            updateCharacterOverlay();
        }
        if (typeof updateControlsFromElement === 'function') {
            updateControlsFromElement();
        }
        
    } catch (error) {
        console.error('❌ handleCharacterResize エラー:', error);
    }
}


// interaction.js の dragElement 関数の安全版
function dragElement(element, x, y) {
    // 安全性チェック
    if (!element || !element.panelId) {
        console.error('❌ dragElement: elementまたはpanelIdが未定義');
        return;
    }
    
    const panel = panels ? panels.find(p => p.id === element.panelId) : null;
    if (!panel) {
        console.error('❌ dragElement: 対応するパネルが見つかりません', element.panelId);
        return;
    }
    
    try {
        // パネル内の相対位置に変換
        const dragOffsetX = window.dragOffset ? window.dragOffset.x : 0;
        const dragOffsetY = window.dragOffset ? window.dragOffset.y : 0;
        
        const newX = (x - dragOffsetX - panel.x) / panel.width;
        const newY = (y - dragOffsetY - panel.y) / panel.height;
        
        // パネル内に制限して安全に設定
        element.x = Math.max(0, Math.min(1, newX));
        element.y = Math.max(0, Math.min(1, newY));
        
        console.log('📍 要素移動:', element.x.toFixed(3), element.y.toFixed(3));
        
        // 表示更新
        if (selectedCharacter && typeof safeExecute === 'function') {
            safeExecute('updateCharacterOverlay');
        } else if (selectedBubble && typeof safeExecute === 'function') {
            safeExecute('updateBubbleOverlay');
        }
        
        if (typeof updateControlsFromElement === 'function') {
            updateControlsFromElement();
        }
        
    } catch (error) {
        console.error('❌ dragElement エラー:', error);
    }
}

// グローバル変数の初期化を確実にする関数
function initializeInteractionGlobals() {
    if (typeof window.isDragging === 'undefined') window.isDragging = false;
    if (typeof window.isResizing === 'undefined') window.isResizing = false;
    if (typeof window.selectedElement === 'undefined') window.selectedElement = null;
    if (typeof window.dragOffset === 'undefined') window.dragOffset = {x: 0, y: 0};
    if (typeof window.resizeStartData === 'undefined') window.resizeStartData = {};
    
    console.log('✅ インタラクショングローバル変数初期化完了');
}

// アプリ起動時に呼び出し
window.addEventListener('DOMContentLoaded', initializeInteractionGlobals);
window.addEventListener('load', initializeInteractionGlobals);

// キャラクターリサイズハンドルを追加する関数も修正
function addCharacterResizeHandles(element) {
    const handleSize = 8;
    const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    
    // 既存のハンドルを削除
    element.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
    
    handles.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${position}`;
        handle.style.cssText = `
            position: absolute;
            width: ${handleSize}px;
            height: ${handleSize}px;
            background: #ff6600;
            border: 1px solid #fff;
            cursor: ${position.includes('top') ? (position.includes('left') ? 'nw-resize' : 'ne-resize') : (position.includes('left') ? 'sw-resize' : 'se-resize')};
            z-index: 1000;
            border-radius: 2px;
        `;
        
        // 位置設定
        switch(position) {
            case 'top-left':
                handle.style.top = '0px';
                handle.style.left = '0px';
                break;
            case 'top-right':
                handle.style.top = '0px';
                handle.style.right = '0px';
                break;
            case 'bottom-left':
                handle.style.bottom = '0px';
                handle.style.left = '0px';
                break;
            case 'bottom-right':
                handle.style.bottom = '0px';
                handle.style.right = '0px';
                break;
        }
        
        // ハンドルにイベントを追加
        handle.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            console.log('🔧 ハンドル直接クリック:', position);
        });
        
        element.appendChild(handle);
    });
    
    console.log('✅ リサイズハンドル追加完了');
}


// 3. キャラクターリサイズ開始の修正版
function startCharacterResize(character, cornerType, e) {
    console.log('🔧 キャラクターリサイズ開始:', character.name, cornerType);
    
    window.isResizing = true;
    window.selectedElement = character;
    
    const coords = getCanvasCoordinates ? getCanvasCoordinates(e) : {x: e.clientX, y: e.clientY};
    
    window.resizeStartData = {
        startX: coords.x,
        startY: coords.y,
        startScale: character.scale || 1.0,
        cornerType: cornerType,
        character: character
    };
    
    console.log('🔧 リサイズデータ設定:', window.resizeStartData);
    
    // リサイズ中のマウス移動をドキュメントレベルで監視
    const handleResizeMove = (moveEvent) => {
        if (window.isResizing && window.resizeStartData.character === character) {
            const moveCoords = getCanvasCoordinates ? getCanvasCoordinates(moveEvent) : {x: moveEvent.clientX, y: moveEvent.clientY};
            handleCharacterResize(character, moveCoords.x, moveCoords.y);
        }
    };
    
    const handleResizeEnd = () => {
        console.log('🔧 リサイズ終了');
        window.isResizing = false;
        window.selectedElement = null;
        window.resizeStartData = {};
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
}


// ===== 吹き出し管理 =====
// 6. 吹き出し作成の修正版（縦書きデフォルト対応）
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
        vertical: true  // デフォルトを縦書きに設定
    };
    
    speechBubbles.push(bubble);
    
    // 履歴に追加
    if (typeof addToHistory === 'function') {
        addToHistory({
            type: 'addBubble',
            bubble: JSON.parse(JSON.stringify(bubble))
        });
    }
    
    updateBubbleOverlay();
    updateStatus();
    updateElementCount();
    
    // テキストエリアをクリア
    const dialogueInput = document.getElementById('dialogueText');
    if (dialogueInput) {
        dialogueInput.value = '';
    }
    
    console.log('💬 吹き出し追加:', bubbleType, bubble.text, '縦書き:', bubble.vertical);
    showNotification('縦書き吹き出しを追加しました', 'success', 2000);
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

// 7. 縦書き吹き出し要素作成の修正版
function createBubbleElement(bubble, panel) {
    const element = document.createElement('div');
    element.className = `speech-bubble ${bubble.type}`;
    element.dataset.bubbleId = bubble.id;
    
    // 縦書き設定の強化
    if (bubble.vertical) {
        element.classList.add('vertical-text');
        console.log('📝 縦書きクラス追加:', bubble.text);
    }
    
    // 選択状態の反映
    if (selectedBubble === bubble) {
        element.classList.add('selected');
    }
    
    // 位置とサイズ計算
    const bubbleX = panel.x + (panel.width * bubble.x) - (bubble.width * bubble.scale / 2);
    const bubbleY = panel.y + (panel.height * bubble.y) - (bubble.height * bubble.scale / 2);
    
    // 基本スタイル適用
    Object.assign(element.style, {
        left: bubbleX + 'px',
        top: bubbleY + 'px',
        width: (bubble.width * bubble.scale) + 'px',
        height: (bubble.height * bubble.scale) + 'px',
        cursor: 'move',
        position: 'absolute',
        background: 'white',
        border: '2px solid #333',
        borderRadius: '20px',
        padding: '8px 12px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        zIndex: '100',
        boxSizing: 'border-box'
    });
    
    // 縦書きスタイルの強制適用
    if (bubble.vertical) {
        Object.assign(element.style, {
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            direction: 'rtl',
            textAlign: 'center',
            lineHeight: '1.2'
        });
        
        // 縦書き用のHTML構造
        element.innerHTML = createVerticalTextHTML(bubble.text);
        console.log('📝 縦書きスタイル適用完了:', bubble.text);
    } else {
        element.textContent = bubble.text;
        Object.assign(element.style, {
            writingMode: 'horizontal-tb',
            textOrientation: 'mixed',
            direction: 'ltr'
        });
    }
    
    // イベントリスナー
    addBubbleEvents(element, bubble, panel);
    
    // 吹き出しの尻尾を追加
    if (bubble.type !== 'narration') {
        const tail = createBubbleTail(bubble);
        element.appendChild(tail);
    }
    
    return element;
}


// 8. 縦書きテキストHTML作成の修正版
function createVerticalTextHTML(text) {
    console.log('📝 縦書きHTML作成:', text);
    
    // 文字を1つずつ分割して縦書き構造を作成
    const characters = text.split('');
    const verticalChars = characters.map(char => {
        if (char === '\n') {
            return '<br>';
        } else if (char === ' ') {
            return '<span style="display:block; height:0.5em;"></span>';
        }
        return `<span style="display:block; text-align:center; line-height:1.1; margin:0; padding:0;">${char}</span>`;
    }).join('');
    
    return `<div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        height: 100%; 
        width: 100%;
        writing-mode: vertical-rl; 
        text-orientation: upright;
        overflow: hidden;
    ">${verticalChars}</div>`;
}




// createVerticalText 関数も修正
function createVerticalText(text) {
    console.log('📝 縦書きテキスト作成:', text);
    
    // シンプルな縦書き実装
    const characters = text.split('');
    const verticalHTML = characters.map(char => {
        if (char === '\n') {
            return '<br>';
        } else if (char === ' ') {
            return '<span style="display:block; height:0.5em;"></span>';
        }
        return `<span style="display:block; text-align:center; line-height:1.2; margin:1px 0;">${char}</span>`;
    }).join('');
    
    return `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; writing-mode:vertical-rl; text-orientation:upright;">${verticalHTML}</div>`;
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
    let editingInProgress = false;  // 編集中フラグを追加
    
    element.addEventListener('mousedown', function(e) {
        // 編集中は通常のマウスダウンを無視
        if (editingInProgress) {
            console.log('💬 編集中のため操作無視');
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        
        console.log('💬 吹き出しクリック:', bubble.text.substring(0, 10));
        
        e.stopPropagation();
        e.preventDefault();
        
        selectBubble(bubble);
        isDragging = true;
        selectedElement = bubble;
        
        const coords = getCanvasCoordinates(e);
        dragOffset.x = coords.x - (panel.x + panel.width * bubble.x);
        dragOffset.y = coords.y - (panel.y + panel.height * bubble.y);
        
        console.log('🚀 吹き出しドラッグ開始');
    });
    
    // 右クリックで編集（修正版）
    element.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 編集中でない場合のみ開始
        if (!editingInProgress) {
            console.log('💬 右クリック編集開始:', bubble.text);
            editingInProgress = true;
            selectBubble(bubble);
            startBubbleEdit(element, bubble, () => {
                editingInProgress = false;  // 編集完了時にフラグを解除
            });
        }
    });
    
    // ダブルクリックでも編集可能
    element.addEventListener('dblclick', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 編集中でない場合のみ開始
        if (!editingInProgress) {
            console.log('💬 ダブルクリック編集開始:', bubble.text);
            editingInProgress = true;
            selectBubble(bubble);
            startBubbleEdit(element, bubble, () => {
                editingInProgress = false;  // 編集完了時にフラグを解除
            });
        }
    });
}

function startBubbleEdit(element, bubble, onComplete) {
    selectBubble(bubble);
    
    // 編集用のテキストエリアを作成
    const editArea = document.createElement('textarea');
    editArea.className = 'bubble-edit-area';
    editArea.value = bubble.text;
    
    // 書字方向切り替えボタン
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
    
    // 書字方向切り替えイベント
    verticalToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        bubble.vertical = !bubble.vertical;
        
        verticalToggle.textContent = bubble.vertical ? '横書き' : '縦書き';
        editArea.style.writingMode = bubble.vertical ? 'vertical-rl' : 'horizontal-tb';
        
        console.log('📝 書字方向切り替え:', bubble.vertical ? '縦書き' : '横書き');
    });
    
    // 編集完了処理
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
        
        // 元の要素を復元（ホバー状態をクリア）
        element.style.opacity = '';
        element.style.pointerEvents = '';
        element.style.filter = '';
        element.classList.remove('hover');
        
        // 表示を更新
        updateBubbleOverlay();
        updateStatus();
        
        // セリフ入力欄も更新
        const dialogueInput = document.getElementById('dialogueText');
        if (dialogueInput && selectedBubble === bubble) {
            dialogueInput.value = newText;
        }
        
        showNotification('吹き出しを編集しました', 'success', 2000);
        
        // 編集完了コールバックを実行
        if (onComplete) onComplete();
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
            
            // 元の要素を復元
            element.style.opacity = '';
            element.style.pointerEvents = '';
            element.style.filter = '';
            element.classList.remove('hover');
            
            console.log('❌ 編集キャンセル');
            
            // キャンセル時もコールバックを実行
            if (onComplete) onComplete();
        }
    });
    
    // フォーカスが外れたら確定
    editArea.addEventListener('blur', function(e) {
        if (!e.relatedTarget || !e.relatedTarget.classList.contains('vertical-toggle-btn')) {
            setTimeout(() => {
                if (document.contains(editArea)) {
                    finishEdit();
                }
            }, 100);
        }
    });
}


// 9. 吹き出しサイズ調整の修正版（縦書き対応）
function adjustBubbleSize(bubble) {
    const textLength = bubble.text.length;
    
    if (bubble.vertical) {
        // 縦書きの場合：高さを文字数に比例、幅を控えめに
        bubble.height = Math.max(80, Math.min(300, textLength * 16 + 40));
        bubble.width = Math.max(40, Math.min(80, 50));  // 縦書きは幅を狭く
    } else {
        // 横書きの場合：従来通り
        const lineCount = Math.ceil(textLength / 12);
        bubble.width = Math.max(60, Math.min(220, textLength * 8 + 30));
        bubble.height = Math.max(35, lineCount * 22 + 25);
    }
    
    console.log(`📏 吹き出しサイズ調整: ${bubble.width}x${bubble.height} (${textLength}文字, ${bubble.vertical ? '縦書き' : '横書き'})`);
}


// 新規CSSスタイルを動的に追加
function addVerticalTextStyles() {
    if (document.getElementById('vertical-text-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'vertical-text-styles';
    style.textContent = `
        .speech-bubble.vertical-text {
            writing-mode: vertical-rl !important;
            text-orientation: upright !important;
            direction: rtl !important;
        }
        
        .resize-handle {
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }
        
        .resize-handle:hover {
            opacity: 1;
            transform: scale(1.1);
        }
        
        .character-placeholder.selected .resize-handle {
            display: block;
        }
        
        .character-placeholder:not(.selected) .resize-handle {
            display: none;
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ 縦書きスタイル追加完了');
}

// 初期化時にスタイルを追加
document.addEventListener('DOMContentLoaded', addVerticalTextStyles);
if (document.readyState !== 'loading') {
    addVerticalTextStyles();
}



// ===== 選択関数 =====
function selectCharacter(character) {
    selectedCharacter = character;
    selectedBubble = null;
    selectedPanel = null;
    selectedElement = character;
    
    safeExecute('updateCharacterOverlay');
    safeExecute('updateStatus');
    
    console.log('👤 キャラクター選択:', character.name);
}

function selectBubble(bubble) {
    selectedBubble = bubble;
    selectedCharacter = null;
    selectedPanel = null;
    selectedElement = bubble;
    
    safeExecute('updateBubbleOverlay');
    safeExecute('updateStatus');
    
    console.log('💬 吹き出し選択:', bubble.text.substring(0, 15));
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
window.startCharacterResize = startCharacterResize;
window.addCharacterResizeHandles = addCharacterResizeHandles;
window.selectCharacter = selectCharacter;
window.selectBubble = selectBubble;

console.log('✅ content.js 読み込み完了（完全修正版 - 元ファイルベース＋必要修正のみ）');
