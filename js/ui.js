// ===== UIモジュール =====

function initializeUI() {
    console.log('🎨 UIモジュール初期化');
    setupTheme();
    setupUIEventListeners();
}

// ===== ダークモード機能 =====
function setupTheme() {
    console.log('🌙 テーマシステム初期化');
    
    // ダークモードボタンのイベントリスナー
    const themeButton = document.getElementById('themeToggle');
    if (themeButton) {
        themeButton.addEventListener('click', toggleTheme);
        console.log('✅ ダークモードボタン設定完了');
    } else {
        console.warn('⚠️ ダークモードボタンが見つかりません');
    }
    
    // 初期テーマ適用
    initTheme();
}

function initTheme() {
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
    
    // キャンバス再描画（背景色変更のため）
    if (typeof redrawCanvas === 'function') {
        redrawCanvas();
    }
    if (typeof drawGuidelines === 'function') {
        drawGuidelines();
    }
}

function applyTheme(theme) {
    console.log('🎨 テーマ適用:', theme);
    
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // 強制的にスタイルを適用（確実性のため）
    if (theme === 'dark') {
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#e0e0e0';
    } else {
        document.body.style.backgroundColor = '#f0f0f0';
        document.body.style.color = '#333';
    }
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

// ===== UIイベントリスナー =====
function setupUIEventListeners() {
    console.log('🎛️ UIイベントリスナー設定');
    
    // ページタブ
    setupPageTabs();
    
    // ステータス更新の定期実行
    setInterval(updateUIStatus, 1000);
}

function setupPageTabs() {
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
}

// ===== ページ管理 =====
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
    
    // ページ情報更新
    updatePageInfo();
    
    // TODO: 実際のページデータの保存・読み込み
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
    
    // ページ情報更新
    updatePageInfo();
}

function updatePageInfo() {
    const pageInfo = document.querySelector('.page-info');
    if (pageInfo) {
        const totalPages = document.querySelectorAll('.page-tab:not(#addPageBtn)').length;
        pageInfo.textContent = `現在: ${currentPage}ページ目 / 全${totalPages}ページ`;
    }
}

// ===== ステータス更新 =====
function updateUIStatus() {
    // 要素数の更新
    updateElementCount();
    
    // 選択状態の更新
    updateSelectionStatus();
    
    // パフォーマンス情報の更新
    updatePerformanceInfo();
}

function updateSelectionStatus() {
    const selectedInfo = document.getElementById('selectedInfo');
    if (!selectedInfo) return;
    
    if (selectedBubble) {
        const shortText = selectedBubble.text.length > 15 
            ? selectedBubble.text.substring(0, 15) + '...' 
            : selectedBubble.text;
        selectedInfo.textContent = `💬 吹き出し: ${shortText}`;
    } else if (selectedCharacter) {
        selectedInfo.textContent = `👤 キャラクター: ${selectedCharacter.name}`;
    } else if (selectedPanel) {
        selectedInfo.textContent = `📐 コマ${selectedPanel.id}`;
    } else {
        selectedInfo.textContent = 'コマを選択してください';
    }
}

function updatePerformanceInfo() {
    // メモリ使用量やレンダリング情報の表示（開発用）
    if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        const memoryMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
        
        // デバッグ用（本番では非表示）
        if (localStorage.getItem('debugMode') === 'true') {
            console.log(`💾 メモリ使用量: ${memoryMB}MB`);
        }
    }
}


function createNotificationElement(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    return notification;
}

function getNotificationIcon(type) {
    const icons = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
    };
    return icons[type] || icons.info;
}

// ===== モーダル管理 =====
function showModal(title, content, buttons = []) {
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
        `<button class="btn ${btn.class || 'btn-secondary'}" onclick="${btn.onclick}">${btn.text}</button>`
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
    
    return modal;
}

function closeModal(element) {
    const modal = element.closest('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// ===== ツールチップ =====
function initializeTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');
    
    elementsWithTooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const text = e.target.dataset.tooltip;
    if (!text) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);
    
    // 位置調整
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    // アニメーション
    setTimeout(() => {
        tooltip.classList.add('show');
    }, 10);
    
    e.target._tooltip = tooltip;
}

function hideTooltip(e) {
    const tooltip = e.target._tooltip;
    if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 200);
        delete e.target._tooltip;
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
    
    messageEl.textContent = message;
    barEl.style.width = progress + '%';
    
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
        { key: 'Delete', description: '選択要素を削除' },
        { key: 'Escape', description: '選択解除' },
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
    `;
    
    showModal('⌨️ キーボードショートカット', content, [
        { text: '閉じる', class: 'btn-primary', onclick: 'closeModal(this)' }
    ]);
}

// ===== レスポンシブ対応 =====
function handleResize() {
    // キャンバスのサイズ調整
    if (canvas && ctx) {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // 高DPI対応
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        // 再描画
        if (typeof redrawCanvas === 'function') {
            redrawCanvas();
        }
    }
}

// ===== アクセシビリティ =====
function initializeAccessibility() {
    // キーボードナビゲーション
    document.addEventListener('keydown', handleAccessibilityKeys);
    
    // フォーカス管理
    setupFocusManagement();
    
    // ARIAラベルの動的更新
    updateAriaLabels();
}

function handleAccessibilityKeys(e) {
    // Tab移動の改善
    if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
            'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        // カスタムTab順序の実装（必要に応じて）
    }
}

function setupFocusManagement() {
    // フォーカス可能な要素にスタイル適用
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
        canvas.setAttribute('aria-label', 
            `ネーム制作キャンバス。現在${panels.length}個のコマ、${characters.length}個のキャラクター、${speechBubbles.length}個の吹き出しがあります。`
        );
    }
}

// ===== 初期化とイベント設定 =====
window.addEventListener('resize', handleResize);
document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();
    initializeAccessibility();
});

console.log('✅ ui.js 読み込み完了');
