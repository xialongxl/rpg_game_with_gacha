const maps = [
    { id: 1, name: "森林之地", levelRange: [1, 10], boss: { name: "巨狼王", hp: 100, attack: 20, lai: 2 } },
    { id: 2, name: "火焰沙漠", levelRange: [11, 20], boss: { name: "沙蝎王", hp: 150, attack: 30, lai: 3 } },
    { id: 3, name: "冰霜山脉", levelRange: [21, 30], boss: { name: "冰龙", hp: 200, attack: 40, lai: 3 } },
    { id: 4, name: "幽暗沼泽", levelRange: [31, 40], boss: { name: "毒蛙领主", hp: 250, attack: 50, lai: 4 } },
    { id: 5, name: "雷霆峡谷", levelRange: [41, 50], boss: { name: "雷鹰王", hp: 300, attack: 60, lai: 4 } },
    { id: 6, name: "星陨荒原", levelRange: [51, 60], boss: { name: "陨石巨兽", hp: 400, attack: 70, lai: 4 } },
    { id: 7, name: "灵魂墓地", levelRange: [61, 70], boss: { name: "幽魂君主", hp: 500, attack: 80, lai: 5 } },
    { id: 8, name: "熔岩深渊", levelRange: [71, 80], boss: { name: "火焰魔王", hp: 600, attack: 90, lai: 5 } },
    { id: 9, name: "天空之城", levelRange: [81, 90], boss: { name: "圣光守护者", hp: 800, attack: 100, lai: 5 } },
    { id: 10, name: "混沌深渊", levelRange: [91, 99], boss: { name: "终焉魔神", hp: 1000, attack: 120, lai: 6 } }
];

let currentMap = maps[0];
let unlockedMaps = [1]; // 已解锁地图（初始解锁地图1）

// 获取当前地图
function getCurrentMap(level) {
    return maps.find(map => level >= map.levelRange[0] && level <= map.levelRange[1]) || maps[maps.length - 1];
}

// 更新地图UI
function updateMapUI() {
    if (gameElements.mapInfo) {
        gameElements.mapInfo.textContent = `当前地图：${currentMap.name} (${currentMap.levelRange[0]}-${currentMap.levelRange[1]}级)`;
    }
}

// 检查地图进度（在玩家升级时调用）
function checkMapProgress() {
    const newMap = getCurrentMap(player.level);
    if (newMap.id !== currentMap.id) {
        currentMap = newMap;
        log(`进入新地图：${currentMap.name} (${currentMap.levelRange[0]}-${currentMap.levelRange[1]}级)`);
        updateMapUI();
    }
    // 显示Boss挑战按钮
    if (player.level >= currentMap.levelRange[1] && !unlockedMaps.includes(currentMap.id + 1) && gameElements.bossButton) {
        log(`达到${player.level}级！可挑战地图${currentMap.name} Boss：${currentMap.boss.name}`);
        gameElements.bossButton.style.display = 'inline-block';
    } else if (gameElements.bossButton) {
        gameElements.bossButton.style.display = 'none';
    }
}

// 生成Boss（供rpgCore.js调用）
function generateBoss() {
    isBossFight = true;
    const boss = currentMap.boss;
    monster.hp = boss.hp;
    monster.attack = boss.attack;
    monster.lai = boss.lai;
    playerPosition = 5; // DQ初始化
    monsterPosition = 0;
    distance = Math.abs(playerPosition - monsterPosition) - 1; // 距离=4
    log(`挑战地图${currentMap.name} Boss：${boss.name}！（生命值: ${boss.hp}, 攻击力: ${boss.attack}, 攻击距离: ${boss.lai}）`);
    updateGameUI();
}

// 结束Boss战（在endBattle中调用）
function endBossFight(playerWon) {
    if (!isBossFight) return;
    isBossFight = false;
    if (playerWon) {
        if (currentMap.id < maps.length) {
            unlockedMaps.push(currentMap.id + 1);
            log(`击败${currentMap.boss.name}！解锁地图${currentMap.id + 1}：${maps[currentMap.id].name}`);
        } else {
            log(`击败${currentMap.boss.name}！混沌深渊已通关，可继续挑战！`);
        }
        const goldReward = currentMap.id * 100;
        const expReward = currentMap.id * 50;
        player.gold += goldReward;
        player.exp += expReward;
        log(`获得奖励：${goldReward}金币，${expReward}经验值`);
        if (gameElements.bossButton) {
            gameElements.bossButton.style.display = 'none';
        }
        checkMapProgress();
    } else {
        player.hp = player.maxHp; // 失败后恢复HP，免费重试
        log(`被${currentMap.boss.name}击败！可重新挑战`);
    }
}

// 调整怪物强度（供generateMonster调用）
function adjustMonsterStats(monster) {
    if (!isBossFight) {
        const baseHp = 20 + (currentMap.id - 1) * 10;
        const baseAttack = 5 + (currentMap.id - 1) * 2;
        monster.hp = Math.round(monster.hp * (1 + (currentMap.id - 1) * 0.2)) + baseHp;
        monster.attack = Math.round(monster.attack * (1 + (currentMap.id - 1) * 0.2)) + baseAttack;
        monster.lai = Math.min(monster.lai + Math.floor(currentMap.id / 3), 6);
    }
}

// 初始化地图系统
function initMapSystem() {
    // 检查DOM元素
    if (!gameElements.mapInfo) {
        console.error('Map info element not found');
    }
    if (!gameElements.bossButton) {
        console.error('Boss button element not found');
    }
    // 初始化UI
    updateMapUI();
    // Boss战按钮
    if (gameElements.bossButton) {
        gameElements.bossButton.addEventListener('click', () => {
            if (isFighting) {
                log('战斗中，无法挑战Boss！');
                return;
            }
            isFighting = true;
            generateBoss();
        });
    }
    // 检查初始地图
    checkMapProgress();
}