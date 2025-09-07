// ===== UIモジュール =====

function initializeUI() {
    console.log('🎨 UIモジュール初期化');
    setupTheme();
    setupPageManagement();
    setupStatusUpdates();
    setupAccessibility();
}

// ===== テーマ管理 =====
function setupTheme() {
    console.log('🌙 テーマシステム初期化');
    
    const themeButton = document.getElementById('themeToggle');
    if (themeButton) {
        themeButton.addEventListener('click', toggleTheme);
        console.log('✅ ダークモードボタン設定完了');
    }
    
    // 初期テーマ適用
    const savedTheme = localStorage.getItem('theme') || 'light';
    console.log('🎨 保存済みテーマ:', savedTheme);
    applyTheme(savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    console.log('🔄 テーマ切り替え実行');
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log(`🎨 テーマ変更: ${currentTheme} → ${newTheme}`);
    
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
    
    // キャンバス再描画
    safeExecute('redrawCanvas');
    safeExecute('drawGuidelines');
    
    showNotification(`${newTheme === 'dark' ? 'ダーク' : 'ライト'}モードに切り替えました`, 'success', 2000);
}

function applyTheme(theme) {
    console.log('🎨 テーマ適用:', theme);
    
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // CSS変数で管理されているため、追加のスタイル設定は不要
}

function updateThemeButton(theme) {
    const button = document.getElementById('themeToggle');
    if (!button) return;
    
    if (theme === 'dark') {
        button.textContent = '☀️ ライトモード';
    } else {
        button.textContent = '🌙 ダークモード';
    }
    
    console.log('🔘 テーマボタン更新:', button.textContent);
}

// ===== ページ管理 =====
function setupPageManagement() {
    console.log('📄 ページ管理システム初期化');
    
    // ページタブのイベント設定
    const pageTabs = document.querySelectorAll('.page-tab');
    const addPageBtn = document.getElementById('addPageBtn');
    
    pageTabs.forEach(tab => {
        if (tab.id !== 'addPageBtn') {
            tab.addEventListener('click', function() {
                switchPage(parseInt(this.dataset.page));
            });
        }
    });
    
    if (addPageBtn) {
        addPageBtn.addEventListener('click', addPage);
    }
    
    updatePageInfo();
}

function switchPage(pageNum) {
    currentPage = pageNum;
    
    console.log('📄 ページ切り替え:', pageNum);
    
    // タブのアクティブ状態更新
    document.querySelectorAll('.page-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const targetTab = document.querySelector(`[data-page="${pageNum}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    updatePageInfo();
    showNotification(`ページ${pageNum}に切り替えました`, 'info', 1500);
}

function addPage() {
    const currentTabs = document.querySelectorAll('.page-tab:not(#addPageBtn)');
    const newPageNum = currentTabs.length + 1;
    
    console.log('📄 新しいページ追加:', newPageNum);
    
    // 新しいタブを作成
    const newTab = document.createElement('button');
    newTab.className = 'page-tab';
    newTab.dataset.page = newPageNum;
    newTab.textContent = `P${newPageNum}`;
    newTab.addEventListener('click', function() {
        switchPage(newPageNum);
    });
    
    // + ボタンの前に挿入
    const addButton = document.getElementById('addPageBtn');
    if (addButton && addButton.parentNode) {
        addButton.parentNode.insertBefore(newTab, addButton);
    }
    
    // 新しいページに切り替え
    switchPage(newPageNum);
    showNotification(`ページ${newPageNum}を追加しました`, 'success', 2000);
}

function updatePageInfo() {
    const pageInfo = document.querySelector('.page-info');
    if (pageInfo) {
        const totalPages = document.querySelectorAll('.page-tab:not(#addPageBtn)').length;
        pageInfo.textContent = `現在: ${currentPage}ページ目 / 全${totalPages}ページ`;
    }
}

// ===== ステータス更新 =====
function setupStatusUpdates() {
    // 定期的なステータス更新
    setInterval(updateUIStatus, 2000); // 2秒ごと
}

function updateUIStatus() {
    updateElementCount();
    updatePerformanceInfo();
}

function updatePerformanceInfo() {
    // メモリ使用量の監視（開発用）
    if (window.performance && window.performance.memory && localStorage.getItem('debugMode') === 'true') {
        const memory = window.performance.memory;
        const memoryMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
        
        // 100MBを超えた場合の警告
        if (memoryMB > 100) {
            console.warn(`💾 メモリ使用量が高くなっています: ${memoryMB}MB`);
            showNotification(`メモリ使用量: ${memoryMB}MB`, 'warning', 3000);
        }
    }
}

// ===== モーダル管理 =====
function showModal(title, content, buttons = []) {
    // 既存のモーダルを削除
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) existingModal.remove();
    
    const modal = createModalElement(title, content, buttons);
    document.body.appendChild(modal);
    
    // アニメーション
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    return modal;
}

function createModalElement(title, content, buttons) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const buttonsHtml = buttons.map(btn => 
        `<button class="btn ${btn.class || 'btn-secondary'}" onclick="${btn.onclick || 'closeModal(this)'}">${btn.text}</button>`
    ).join('');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${buttonsHtml}
            </div>
        </div>
    `;
    
    // ESCキーで閉じる
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModal(modal.querySelector('.modal-close'));
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    // モーダル外クリックで閉じる
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal.querySelector('.modal-close'));
        }
    });
    
    return modal;
}

function closeModal(element) {
    const modal = element ? element.closest('.modal-overlay') : document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// ===== プログレスバー =====
function showProgress(message, progress = 0) {
    let progressBar = document.getElementById('global-progress');
    
    if (!progressBar) {
        progressBar = createProgressBar();
        document.body.appendChild(progressBar);
    }
    
    const messageEl = progressBar.querySelector('.progress-message');
    const barEl = progressBar.querySelector('.progress-bar');
    
    if (messageEl) messageEl.textContent = message;
    if (barEl) barEl.style.width = Math.min(100, Math.max(0, progress)) + '%';
    
    progressBar.classList.add('show');
    
    return progressBar;
}

function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.id = 'global-progress';
    progressBar.className = 'progress-overlay';
    progressBar.innerHTML = `
        <div class="progress-content">
            <div class="progress-message">処理中...</div>
            <div class="progress-container">
                <div class="progress-bar"></div>
            </div>
        </div>
    `;
    
    return progressBar;
}

function hideProgress() {
    const progressBar = document.getElementById('global-progress');
    if (progressBar) {
        progressBar.classList.remove('show');
        setTimeout(() => {
            if (progressBar.parentNode) {
                progressBar.parentNode.removeChild(progressBar);
            }
        }, 300);
    }
}

// ===== ショートカットヘルプ =====
function showShortcutHelp() {
    const shortcuts = [
        { key: 'Ctrl+S', description: 'プロジェクト保存' },
        { key: 'Ctrl+E', description: 'クリスタ用データ出力' },
        { key: 'Ctrl+Z', description: '元に戻す' },
        { key: 'Ctrl+Y', description: 'やり直し' },
        { key: 'Delete', description: '選択要素を削除' },
        { key: 'Escape', description: '選択解除' },
        { key: 'H', description: 'パネル横分割' },
        { key: 'V', description: 'パネル縦分割' },
        { key: 'D', description: 'パネル複製' },
        { key: 'R', description: 'パネル回転' },
        { key: 'G', description: 'ガイドライン表示切り替え' },
        { key: 'Shift+ドラッグ', description: 'パネル移動' }
    ];
    
    const content = `
        <div class="shortcut-list">
            ${shortcuts.map(s => `
                <div class="shortcut-item">
                    <span class="shortcut-key">${s.key}</span>
                    <span class="shortcut-desc">${s.description}</span>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            💡 ヒント: パネルを右クリックするとコンテキストメニューが表示されます
        </div>
    `;
    
    showModal('⌨️ キーボードショートカット', content, [
        { text: '閉じる', class: 'btn-primary' }
    ]);
}

// ===== レスポンシブ対応 =====
function handleResize() {
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
    
    // ガイドキャンバスも同様に調整
    if (guideCanvas && guideCtx) {
        guideCanvas.width = rect.width * dpr;
        guideCanvas.height = rect.height * dpr;
        guideCtx.scale(dpr, dpr);
        
        guideCanvas.style.width = rect.width + 'px';
        guideCanvas.style.height = rect.height + 'px';
    }
    
    // 再描画
    safeExecute('redrawCanvas');
    safeExecute('drawGuidelines');
    
    console.log('📏 キャンバスサイズ調整:', rect.width, 'x', rect.height);
}

// ===== アクセシビリティ =====
function setupAccessibility() {
    console.log('♿ アクセシビリティ機能初期化');
    
    // キーボードナビゲーション
    document.addEventListener('keydown', handleAccessibilityKeys);
    
    // フォーカス管理
    setupFocusManagement();
    
    // ARIAラベルの更新
    updateAriaLabels();
}

function handleAccessibilityKeys(e) {
    // Tabキーでのフォーカス移動を改善
    if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        // 現在のフォーカス要素のインデックスを取得
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        // 次の要素にフォーカス（必要に応じてカスタム順序を実装）
        if (currentIndex >= 0) {
            console.log('⌨️ Tab移動:', currentIndex, '→', e.shiftKey ? currentIndex - 1 : currentIndex + 1);
        }
    }
}

function setupFocusManagement() {
    const focusableElements = document.querySelectorAll(
        'button, input, select, textarea'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.setAttribute('data-focused', 'true');
        });
        
        element.addEventListener('blur', function() {
            this.removeAttribute('data-focused');
        });
    });
}

function updateAriaLabels() {
    // 動的なARIAラベルの更新
    const canvas = document.getElementById('nameCanvas');
    if (canvas) {
        const panelCount = panels?.length || 0;
        const characterCount = characters?.length || 0;
        const bubbleCount = speechBubbles?.length || 0;
        
        canvas.setAttribute('aria-label', 
            `ネーム制作キャンバス。現在${panelCount}個のコマ、${characterCount}個のキャラクター、${bubbleCount}個の吹き出しがあります。`
        );
    }
    
    // 選択状態の通知
    const selectedInfo = document.getElementById('selectedInfo');
    if (selectedInfo) {
        selectedInfo.setAttribute('aria-live', 'polite');
    }
}

// ===== デバッグモード =====
function toggleDebugMode() {
    const isDebug = localStorage.getItem('debugMode') === 'true';
    const newDebugState = !isDebug;
    
    localStorage.setItem('debugMode', newDebugState.toString());
    
    if (newDebugState) {
        console.log('🔧 デバッグモード有効');
        showNotification('デバッグモードを有効にしました', 'info', 2000);
        
        // デバッグ情報を表示
        const debugInfo = safeExecute('showDebugStatus');
        if (debugInfo) {
            console.table(debugInfo);
        }
    } else {
        console.log('🔧 デバッグモード無効');
        showNotification('デバッグモードを無効にしました', 'info', 2000);
    }
}

// ===== イベントリスナー設定 =====
window.addEventListener('resize', handleResize);

// DOMContentLoaded時の初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 DOM読み込み完了 - UI初期化');
    
    // 少し遅延させてUI初期化（他のモジュールの読み込み完了を待つ）
    setTimeout(() => {
        if (typeof initializeUI === 'function') {
            initializeUI();
        }
    }, 100);
});

// ===== グローバル関数として公開 =====
window.initializeUI = initializeUI;
window.toggleTheme = toggleTheme;
window.switchPage = switchPage;
window.addPage = addPage;
window.showModal = showModal;
window.closeModal = closeModal;
window.showProgress = showProgress;
window.hideProgress = hideProgress;
window.showShortcutHelp = showShortcutHelp;
window.toggleDebugMode = toggleDebugMode;
window.updateAriaLabels = updateAriaLabels;

console.log('✅ ui.js 読み込み完了');
