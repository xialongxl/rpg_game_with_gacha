// 全局DOM引用
const gameElements = {
    playerLevel: document.getElementById('player-level'),
    playerExp: document.getElementById('player-exp'),
    expToLevel: document.getElementById('exp-to-level'),
    playerHp: document.getElementById('player-hp'),
    playerMaxHp: document.getElementById('player-max-hp'),
    playerAttack: document.getElementById('player-attack'),
    playerDefense: document.getElementById('player-defense'),
    playerGold: document.getElementById('player-gold'),
    monsterHp: document.getElementById('monster-hp'),
    monsterAttack: document.getElementById('monster-attack'),
    battleCount: document.getElementById('battle-count'),
    battleLog: document.getElementById('battle-log'),
    fightButton: document.getElementById('fight-button'),
    gachaButton: document.getElementById('gacha-button'),
    healButton: document.getElementById('heal-button'),
    inventoryCount: document.getElementById('inventory-count'),
    inventoryList: document.getElementById('inventory-list'),
    mainHandSlot: document.getElementById('main-hand-slot'),
    offHandSlot: document.getElementById('off-hand-slot'),
    accessorySlot: document.getElementById('accessory-slot'),
    enhancePanel: document.getElementById('enhance-panel'),
    enhanceWeaponSelect: document.getElementById('enhance-weapon-select'),
    enhanceInfo: document.getElementById('enhance-info'),
    enhanceConfirmButton: document.getElementById('enhance-confirm-button'),
    enhanceCloseButton: document.getElementById('enhance-close-button'),
    openEnhanceButton: document.getElementById('open-enhance-button'),
    toast: document.getElementById('toast'),
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
    btnSingle: document.getElementById('wish-button'),
    btnMulti: document.getElementById('wish-button-10'),
    results: document.getElementById('wish-results')
};

// 初始化游戏
function initGame() {
    initGacha(); // 抽卡系统 (gacha.js)
    initRPG(); // RPG核心系统 (rpgCore.js)
    updateInventoryUI(); // 背包系统 (inventory.js)
    updateEquipmentUI(); // 装备系统 (equipment.js)
    initEnhance(); // 强化系统 (enhance.js)
}

// 启动游戏
initGame();