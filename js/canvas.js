// ===== キャンバス描画モジュール =====

function initializeCanvas() {
    console.log('🎨 キャンバスモジュール初期化');
    
    if (!canvas || !ctx) {
        console.error('❌ キャンバス要素が見つかりません');
        return;
    }
    
    // キャンバス設定
    setupCanvasSettings();
    
    // 高DPI対応
    setHighDPICanvas();
    
    console.log('✅ キャンバス初期化完了');
}

// ===== キャンバス基本設定 =====
function setupCanvasSettings() {
    if (!ctx) return;
    
    // アンチエイリアシング有効化
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // テキスト描画の品質向上
    ctx.textRenderingOptimization = 'optimizeQuality';
}

function setHighDPICanvas() {
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
}

// ===== メイン描画機能 =====
function redrawCanvas() {
    if (!ctx || !canvas) return;
    
    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景描画（テーマに応じて色を変更）
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#404040' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // パネル描画
    if (Array.isArray(panels)) {
        panels.forEach(panel => {
            drawPanel(panel, panel === selectedPanel);
        });
    }
}

function drawPanel(panel, isSelected = false) {
    if (!ctx || !panel) return;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // パネル枠の色とスタイル設定
    ctx.strokeStyle = isSelected ? '#ff8833' : (isDark ? '#e0e0e0' : '#000000');
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.fillStyle = isDark ? 'rgba(64, 64, 64, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    
    // パネル背景
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    
    // パネル枠線
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
    
    // パネル番号
    ctx.fillStyle = isSelected ? '#ff8833' : (isDark ? '#b0b0b0' : '#666666');
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${panel.id}`, panel.x + 10, panel.y + 10);
    
    // 選択時の追加表示
    if (isSelected) {
        // 選択インジケーター
        ctx.fillStyle = '#ff8833';
        ctx.font = '12px Arial';
        ctx.fillText('選択中', panel.x + panel.width - 50, panel.y + 10);
        
        // コーナーハンドル
        drawCornerHandles(panel);
    }
}

function drawCornerHandles(panel) {
    if (!ctx) return;
    
    const handleSize = 8;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    ctx.fillStyle = isDark ? '#ff8833' : '#ff6600';
    
    // 4つのコーナーハンドル
    const corners = [
        [panel.x, panel.y], // 左上
        [panel.x + panel.width - handleSize, panel.y], // 右上
        [panel.x, panel.y + panel.height - handleSize], // 左下
        [panel.x + panel.width - handleSize, panel.y + panel.height - handleSize] // 右下
    ];
    
    corners.forEach(([x, y]) => {
        ctx.fillRect(x, y, handleSize, handleSize);
    });
}

// ===== ガイドライン描画 =====
function drawGuidelines() {
    if (!guideCtx || !guideCanvas) return;
    
    const showGuides = document.getElementById('showGuides');
    if (!showGuides || !showGuides.checked) {
        guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
        return;
    }
    
    guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    guideCtx.strokeStyle = isDark ? '#00ff88' : '#00ff00';
    guideCtx.lineWidth = 1;
    guideCtx.setLineDash([3, 3]);
    guideCtx.globalAlpha = 0.6;
    
    if (Array.isArray(panels)) {
        panels.forEach(panel => {
            drawPanelGuidelines(panel);
        });
    }
    
    guideCtx.setLineDash([]);
    guideCtx.globalAlpha = 1.0;
}

function drawPanelGuidelines(panel) {
    if (!guideCtx) return;
    
    // 三分割線
    const thirdX = panel.width / 3;
    const thirdY = panel.height / 3;
    
    // 縦線（左右の三分割）
    guideCtx.beginPath();
    guideCtx.moveTo(panel.x + thirdX, panel.y);
    guideCtx.lineTo(panel.x + thirdX, panel.y + panel.height);
    guideCtx.moveTo(panel.x + thirdX * 2, panel.y);
    guideCtx.lineTo(panel.x + thirdX * 2, panel.y + panel.height);
    guideCtx.stroke();
    
    // 横線（上下の三分割）
    guideCtx.beginPath();
    guideCtx.moveTo(panel.x, panel.y + thirdY);
    guideCtx.lineTo(panel.x + panel.width, panel.y + thirdY);
    guideCtx.moveTo(panel.x, panel.y + thirdY * 2);
    guideCtx.lineTo(panel.x + panel.width, panel.y + thirdY * 2);
    guideCtx.stroke();
    
    // 中心線（薄く表示）
    guideCtx.save();
    guideCtx.setLineDash([1, 3]);
    guideCtx.globalAlpha = 0.3;
    
    // 中心縦線
    guideCtx.beginPath();
    guideCtx.moveTo(panel.x + panel.width / 2, panel.y);
    guideCtx.lineTo(panel.x + panel.width / 2, panel.y + panel.height);
    guideCtx.stroke();
    
    // 中心横線
    guideCtx.beginPath();
    guideCtx.moveTo(panel.x, panel.y + panel.height / 2);
    guideCtx.lineTo(panel.x + panel.width, panel.y + panel.height / 2);
    guideCtx.stroke();
    
    guideCtx.restore();
}

// ===== 座標・判定ユーティリティ =====
function getCanvasCoordinates(e) {
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function isPointInPanel(x, y, panel) {
    if (!panel) return false;
    
    return x >= panel.x && x <= panel.x + panel.width &&
           y >= panel.y && y <= panel.y + panel.height;
}

function isPointInCornerHandle(x, y, panel) {
    if (!panel) return false;
    
    const handleSize = 8;
    
    // 4つのコーナーハンドルをチェック
    const corners = [
        { x: panel.x, y: panel.y }, // 左上
        { x: panel.x + panel.width - handleSize, y: panel.y }, // 右上
        { x: panel.x, y: panel.y + panel.height - handleSize }, // 左下
        { x: panel.x + panel.width - handleSize, y: panel.y + panel.height - handleSize } // 右下
    ];
    
    return corners.some(corner => 
        x >= corner.x && x <= corner.x + handleSize &&
        y >= corner.y && y <= corner.y + handleSize
    );
}

function findPanelAt(x, y) {
    if (!Array.isArray(panels)) return null;
    
    // 後ろから検索（上に描画されているものを優先）
    for (let i = panels.length - 1; i >= 0; i--) {
        if (isPointInPanel(x, y, panels[i])) {
            return panels[i];
        }
    }
    return null;
}

// ===== イベント関連 =====
function toggleGuides() {
    drawGuidelines();
    console.log('👁️ ガイドライン表示切り替え');
}

// ===== レスポンシブ対応 =====
function handleCanvasResize() {
    if (!canvas || !ctx) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // 高DPI対応
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // 再描画
    redrawCanvas();
    drawGuidelines();
    
    console.log('📏 キャンバスサイズ調整:', rect.width, 'x', rect.height);
}

// ===== 初期化時のイベント設定 =====
window.addEventListener('resize', handleCanvasResize);

// ===== グローバル関数として公開 =====
window.initializeCanvas = initializeCanvas;
window.redrawCanvas = redrawCanvas;
window.drawGuidelines = drawGuidelines;
window.getCanvasCoordinates = getCanvasCoordinates;
window.isPointInPanel = isPointInPanel;
window.isPointInCornerHandle = isPointInCornerHandle;
window.findPanelAt = findPanelAt;
window.toggleGuides = toggleGuides;

console.log('✅ canvas.js 読み込み完了');
