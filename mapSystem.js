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
let unlockedMaps = [1];
let isManualMapSwitch = false;
let isBossAvailable = false;

// 获取当前地图
function getCurrentMap(level) {
    return maps.find(map => level >= map.levelRange[0] && level <= map.levelRange[1]) || maps[maps.length - 1];
}

// 更新地图UI
function updateMapUI() {
    if (gameElements.mapInfo) {
        gameElements.mapInfo.textContent = `当前地图：${currentMap.name} (${currentMap.levelRange[0]}-${currentMap.levelRange[1]}级)`;
    }
    
    // 更新地图切换按钮状态
    const prevBtn = document.getElementById('prev-map-btn');
    const nextBtn = document.getElementById('next-map-btn');
    
    if (prevBtn) {
        prevBtn.disabled = !unlockedMaps.includes(currentMap.id - 1);
    }
    if (nextBtn) {
        nextBtn.disabled = !unlockedMaps.includes(currentMap.id + 1);
    }
    
    // 更新Boss按钮状态
    updateBossButton();
}

// 更新Boss按钮状态
function updateBossButton() {
    if (!gameElements.bossButton) return;
    
    const hintElement = document.getElementById('boss-button-hint');
    
    // 检查Boss是否可用
    isBossAvailable = player.level >= currentMap.levelRange[1] && 
                     !unlockedMaps.includes(currentMap.id + 1);
    
    if (isBossAvailable) {
        gameElements.bossButton.style.display = 'inline-block';
        if (hintElement) {
            hintElement.textContent = `可挑战：${currentMap.boss.name}`;
        }
        log(`达到${player.level}级！可挑战Boss：${currentMap.boss.name}`);
    } else {
        gameElements.bossButton.style.display = 'none';
        if (hintElement) {
            hintElement.textContent = unlockedMaps.includes(currentMap.id + 1) 
                ? "(已击败)" 
                : `(需达到${currentMap.levelRange[1]}级)`;
        }
    }
}

// 检查地图进度
function checkMapProgress() {
    if (isManualMapSwitch) {
        isManualMapSwitch = false;
        return;
    }
    
//    const newMap = getCurrentMap(player.level);
//    if (newMap.id !== currentMap.id) {
//        currentMap = newMap;
//        log(`进入新地图：${currentMap.name} (${currentMap.levelRange[0]}-${currentMap.levelRange[1]}级)`);
//        updateMapUI();
//    }
    
    // 更新Boss按钮状态
    updateBossButton();
}

// 生成Boss
function generateBoss() {
    isBossFight = true;
    const boss = currentMap.boss;
    monster.hp = boss.hp;
    monster.attack = boss.attack;
    monster.lai = boss.lai;
    playerPosition = 5;
    monsterPosition = 0;
    distance = Math.abs(playerPosition - monsterPosition) - 1;
    log(`挑战${currentMap.name}地图Boss：${boss.name}！（HP:${boss.hp} ATK:${boss.attack} LAI:${boss.lai}）`);
    updateGameUI();
}

// 结束Boss战
function endBossFight(playerWon) {
    if (!isBossFight) return;
    isBossFight = false;
    
    if (playerWon) {
        const goldReward = currentMap.id * 100;
        const expReward = currentMap.id * 50;
        player.gold += goldReward;
        player.exp += expReward;
        log(`获得奖励：${goldReward}金币，${expReward}经验值`);
        saveGame(AUTO_SAVE_SLOT, true);

        // 解锁下一地图
        const nextMapId = currentMap.id + 1;
        if (nextMapId <= maps.length && !unlockedMaps.includes(nextMapId)) {
            unlockedMaps.push(nextMapId);
            log(`解锁新地图：${maps.find(m => m.id === nextMapId).name}`);
        }
    } else {
        player.hp = player.maxHp;
        log(`挑战失败！可重新尝试`);
    }
    
    // 更新UI状态
    updateMapUI();
    checkMapProgress();
}

// 调整怪物强度
function adjustMonsterStats(monster) {
    if (!isBossFight) {
        const baseHp = 20 + (currentMap.id - 1) * 10;
        const baseAttack = 5 + (currentMap.id - 1) * 2;
        monster.maxHp = Math.round(monster.maxHp * (1 + (currentMap.id - 1) * 0.2)) + baseHp;
        monster.hp = monster.maxHp;
        monster.attack = Math.round(monster.attack * (1 + (currentMap.id - 1) * 0.2)) + baseAttack;
        monster.lai = Math.min(monster.lai + Math.floor(currentMap.id / 3), 6);
    }
}

// 初始化地图系统
function initMapSystem() {
    // 初始化Boss按钮
    if (gameElements.bossButton) {
        gameElements.bossButton.addEventListener('click', () => {
            if (!isFighting) {
                isFighting = true;
                generateBoss();
            }
        });
    }

    // 初始化地图切换按钮
    document.getElementById('prev-map-btn')?.addEventListener('click', () => {
        const prevMap = maps.find(m => m.id === currentMap.id - 1);
        if (prevMap && unlockedMaps.includes(prevMap.id)) {
            isManualMapSwitch = true;
            currentMap = prevMap;
            log(`手动切换至：${currentMap.name}`);
            updateMapUI();
            checkMapProgress();
        }
    });

    document.getElementById('next-map-btn')?.addEventListener('click', () => {
        const nextMap = maps.find(m => m.id === currentMap.id + 1);
        if (nextMap && unlockedMaps.includes(nextMap.id)) {
            isManualMapSwitch = true;
            currentMap = nextMap;
            log(`手动切换至：${currentMap.name}`);
            updateMapUI();
            checkMapProgress();
        }
    });

    // 初始状态更新
    updateMapUI();
    checkMapProgress();
}