// 全局游戏元素引用
const gameElements = {
    // 玩家状态
    playerName: document.getElementById('player-name'),
    playerLevel: document.getElementById('player-level'),
    playerExp: document.getElementById('player-exp'),
    expToLevel: document.getElementById('exp-to-level'),
    playerHp: document.getElementById('player-hp'),
    playerMaxHp: document.getElementById('player-max-hp'),
    playerAttack: document.getElementById('player-attack'),
    playerDefense: document.getElementById('player-defense'),
    playerGold: document.getElementById('player-gold'),
    playerLai: document.getElementById('player-lai'),
    
    // 怪物状态
    monsterName: document.getElementById('monster-name'),
    monsterHp: document.getElementById('monster-hp'),
    monsterMaxHp: document.getElementById('monster-max-hp'),
    monsterAttack: document.getElementById('monster-attack'),
    monsterLai: document.getElementById('monster-lai'),
    
    // 战斗相关
    battleCount: document.getElementById('battle-count'),
    battleLog: document.getElementById('battle-log'),
    distance: document.getElementById('distance'),
    distanceGrid: document.getElementById('distance-grid'),
    
    // 按钮
    fightButton: document.getElementById('fight-button'),
    bossButton: document.getElementById('boss-button'),
    moveForwardButton: document.getElementById('move-forward-button'),
    moveBackwardButton: document.getElementById('move-backward-button'),
    attackButton: document.getElementById('attack-button'),
    healButton: document.getElementById('heal-button'),
    battleActions: document.getElementById('battle-actions'),
    openEnhanceButton: document.getElementById('open-enhance-button'),
    
    // 抽卡界面元素
    wishButton: document.getElementById('wish-button'),
    wishButton10: document.getElementById('wish-button-10'),
    results: document.getElementById('wish-results'),
    pityCount: document.getElementById('pity-count'),
    pityProgress: document.getElementById('pity-progress'),
    wishCount: document.getElementById('wish-count'),
    count7: document.getElementById('count-7'),
    count6: document.getElementById('count-6'),
    count5: document.getElementById('count-5'),
    count4: document.getElementById('count-4'),
    count3: document.getElementById('count-3'),
    count2: document.getElementById('count-2'),
    count1: document.getElementById('count-1'),
    
    // 背包相关
    inventoryCount: document.getElementById('inventory-count'),
    inventoryList: document.getElementById('inventory-list'),
    
    // 装备相关
    mainHandSlot: document.getElementById('main-hand-slot'),
    offHandSlot: document.getElementById('off-hand-slot'),
    accessorySlot: document.getElementById('accessory-slot'),
    
    // 强化相关
    enhancePanel: document.getElementById('enhance-panel'),
    enhanceWeaponSelect: document.getElementById('enhance-weapon-select'),
    enhanceInfo: document.getElementById('enhance-info'),
    enhanceConfirmButton: document.getElementById('enhance-confirm-button'),
    enhanceCloseButton: document.getElementById('enhance-close-button'),
    
    // 地图相关
    mapInfo: document.getElementById('map-info'),
    
    // 存档相关
    quickSaveBtn: document.getElementById('quick-save-btn'),
    quickLoadBtn: document.getElementById('quick-load-btn'),
    manageSavesBtn: document.getElementById('manage-saves-btn')
};

// 游戏状态
let gameState = {
    isInitialized: false,
    isFighting: false,
    isBossFight: false,
    currentSection: 'game-section'
};

// 切换界面
function switchSection(sectionId) {
    // 隐藏所有界面
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 取消所有导航按钮激活状态
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // 显示目标界面
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        gameState.currentSection = sectionId;
        
        // 根据目标界面更新特定UI
        switch(sectionId) {
            case 'game-section':
                updateGameUI();
                updateMapUI();
                break;
            case 'inventory-section':
                updateInventoryUI();
                updateEquipmentUI();
                if (typeof updateEnhancePanel === 'function') updateEnhancePanel();
                break;
            case 'gacha-section':
                if (typeof updateStats === 'function') updateStats();
                updateGameUI();
                break;
        }
    }
    
    // 激活对应导航按钮
    const targetButton = document.querySelector(`.nav-button[data-section="${sectionId}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
}

// 初始化导航按钮
function initNavigation() {
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            switchSection(sectionId);
        });
    });
}

// 显示Toast提示
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// 移除闪烁效果
function removeBlinkClasses() {
    const elements = [
        gameElements.playerHp,
        gameElements.playerMaxHp,
        gameElements.playerAttack,
        gameElements.playerDefense,
        gameElements.monsterHp
    ];
    
    elements.forEach(element => {
        if (element) {
            element.classList.remove('blink');
        }
    });
}

// 更新所有UI
function updateAllUI() {
    updateGameUI();
    updateInventoryUI();
    updateEquipmentUI();
    updateMapUI();
    if (typeof updateEnhancePanel === 'function') updateEnhancePanel();
    if (typeof updateStats === 'function') updateStats();
}

// 预加载资源
function preloadResources() {
    const images = [
        'https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/broadsword.png',
        'https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/relic-blade.png',
        'https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/wizard-staff.png',
        'https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/pocket-bow.png',
        'https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/spell-book.png',
        'https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/bowie-knife.png',
        'https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/templar-shield.png'
    ];
    
    images.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

/*
// 初始化存档系统
function initSaveSystem() {
    // 初始化快速保存/加载按钮
    if (gameElements.quickSaveBtn) {
        gameElements.quickSaveBtn.addEventListener('click', () => {
            if (typeof saveGame === 'function') {
                saveGame();
            } else {
                showToast('存档系统未初始化');
            }
        });
    }

    if (gameElements.quickLoadBtn) {
        gameElements.quickLoadBtn.addEventListener('click', () => {
            if (typeof loadGame === 'function') {
                if (loadGame()) {
                    updateAllUI();
                    showToast('游戏已加载');
                }
            } else {
                showToast('存档系统未初始化');
            }
        });
    }

    if (gameElements.manageSavesBtn) {
        gameElements.manageSavesBtn.addEventListener('click', () => {
            if (typeof showSaveManager === 'function') {
                showSaveManager();
            } else {
                showToast('存档管理功能未初始化');
            }
        });
    }

    // 检查是否有存档
    if (typeof checkForSave === 'function') {
        checkForSave();
    }
}
    */

// 初始化游戏
function initGame() {
    if (gameState.isInitialized) return;
    
    // 初始化各子系统
    initNavigation();
    if (typeof initRPG === 'function') initRPG();
    if (typeof initGacha === 'function') initGacha();
    if (typeof initInventory === 'function') initInventory();
    if (typeof initEquipment === 'function') initEquipment();
    if (typeof initEnhance === 'function') initEnhance();
    if (typeof initMapSystem === 'function') initMapSystem();
    initSaveSystem();
    
    // 每100ms检查一次闪烁效果是否需要移除
    setInterval(removeBlinkClasses, 100);
    
    // 初始显示游戏界面
    switchSection('game-section');
    
    // 预加载资源
    preloadResources();
    
    // 标记为已初始化
    gameState.isInitialized = true;
    
    // 显示欢迎消息
    setTimeout(() => {
        log('欢迎来到幻想RPG与抽卡联动游戏！');
        log('使用导航按钮在不同界面间切换');
    }, 500);
}

// 游戏加载完成后初始化
if (document.readyState === 'complete') {
    initGame();
} else {
    document.addEventListener('DOMContentLoaded', initGame);
}

// 暴露全局API
window.game = {
    elements: gameElements,
    state: gameState,
    switchSection,
    showToast,
    updateAllUI
};