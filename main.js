const gameElements = {
    playerLevel: document.getElementById('player-level'),
    playerExp: document.getElementById('player-exp'),
    expToLevel: document.getElementById('exp-to-level'),
    playerHp: document.getElementById('player-hp'),
    playerMaxHp: document.getElementById('player-max-hp'),
    playerAttack: document.getElementById('player-attack'),
    playerDefense: document.getElementById('player-defense'),
    playerGold: document.getElementById('player-gold'),
    inventoryCount: document.getElementById('inventory-count'),
    monsterHp: document.getElementById('monster-hp'),
    monsterAttack: document.getElementById('monster-attack'),
    monsterLai: document.getElementById('monster-lai'),
    battleCount: document.getElementById('battle-count'),
    playerLai: document.getElementById('player-lai'),
    distance: document.getElementById('distance'),
    distanceGrid: document.getElementById('distance-grid'),
    battleLog: document.getElementById('battle-log'),
    fightButton: document.getElementById('fight-button'),
    bossButton: document.getElementById('boss-button'),
    gachaButton: document.getElementById('gacha-button'),
    healButton: document.getElementById('heal-button'),
    openEnhanceButton: document.getElementById('open-enhance-button'),
    moveForwardButton: document.getElementById('move-forward-button'),
    moveBackwardButton: document.getElementById('move-backward-button'),
    attackButton: document.getElementById('attack-button'),
    battleActions: document.getElementById('battle-actions'),
    inventoryList: document.getElementById('inventory-list'),
    mainHandSlot: document.getElementById('main-hand-slot'),
    offHandSlot: document.getElementById('off-hand-slot'),
    accessorySlot: document.getElementById('accessory-slot'),
    enhancePanel: document.getElementById('enhance-panel'),
    enhanceWeaponSelect: document.getElementById('enhance-weapon-select'),
    enhanceInfo: document.getElementById('enhance-info'),
    enhanceConfirmButton: document.getElementById('enhance-confirm-button'),
    enhanceCloseButton: document.getElementById('enhance-close-button'),
    results: document.getElementById('wish-results'),
    btnSingle: document.getElementById('wish-button'),
    btnMulti: document.getElementById('wish-button-10'),
    pityCount: document.getElementById('pity-count'),
    pityProgress: document.getElementById('pity-progress'),
    count7: document.getElementById('count-7'),
    count6: document.getElementById('count-6'),
    count5: document.getElementById('count-5'),
    count4: document.getElementById('count-4'),
    count3: document.getElementById('count-3'),
    count2: document.getElementById('count-2'),
    count1: document.getElementById('count-1'),
    wishCount: document.getElementById('wish-count'),
    toast: document.getElementById('toast'),
    mapInfo: document.getElementById('map-info')
};

function initGame() {
    console.log('initGame开始，检查DOM引用');
    for (const [key, element] of Object.entries(gameElements)) {
        if (!element) {
            console.error(`DOM元素未找到: ${key}`);
        }
    }
    initGacha(); // gacha.js
    initRPG(); // rpgCore.js
    updateInventoryUI(); // inventory.js
    if (typeof updateEquipmentUI === 'function') {
        updateEquipmentUI(); // equipment.js
    } else {
        console.error('updateEquipmentUI 未定义');
    }
    initEnhance(); // enhance.js
    initMapSystem(); // mapSystem.js
}

// 确保DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});