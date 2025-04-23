const maps = [
    // 森林之地 (1-10级)
    { 
        id: 1,
        name: "森林之地",
        levelRange: [1, 10],
        boss: {
            name: "巨狼王",
            hp: calculateBossHp(1),       // 原100 → 450 (4.5倍)
            attack: calculateBossAtk(1),    // 原20 → 35 (1.75倍)
            lai: 2
        }
    },
    // 火焰沙漠 (11-20级)
    { 
        id: 2,
        name: "火焰沙漠",
        levelRange: [11, 20],
        boss: {
            name: "沙蝎王",
            hp: calculateBossHp(2),     // 原150 → 1800 (12倍)
            attack: calculateBossAtk(2),   // 原30 → 70 (2.3倍)
            lai: 3
        }
    },
    // 冰霜山脉 (21-30级)
    { 
        id: 3,
        name: "冰霜山脉",
        levelRange: [21, 30],
        boss: {
            name: "冰龙",
            hp: calculateBossHp(3),     // 原200 → 4300 (21.5倍)
            attack: calculateBossAtk(3),  // 原40 → 110 (2.75倍)
            lai: 4
        }
    },
    // 幽暗沼泽 (31-40级)
    { 
        id: 4,
        name: "幽暗沼泽",
        levelRange: [31, 40],
        boss: {
            name: "毒蛙领主",
            hp: calculateBossHp(4),     // 原250 → 7800 (31倍)
            attack: calculateBossAtk(4),  // 原50 → 160 (3.2倍)
            lai: 5
        }
    },
    // 雷霆峡谷 (41-50级)
    { 
        id: 5,
        name: "雷霆峡谷",
        levelRange: [41, 50],
        boss: {
            name: "雷鹰王",
            hp: calculateBossHp(5),    // 原300 → 12500 (41倍)
            attack: calculateBossAtk(5),  // 原60 → 220 (3.7倍)
            lai: 6
        }
    },
    // 星陨荒原 (51-60级)
    { 
        id: 6,
        name: "星陨荒原",
        levelRange: [51, 60],
        boss: {
            name: "陨石巨兽",
            hp: calculateBossHp(6),   // 原400 → 18000 (45倍)
            attack: calculateBossAtk(6), // 原70 → 290 (4.1倍)
            lai: 6
        }
    },
    // 灵魂墓地 (61-70级)
    { 
        id: 7,
        name: "灵魂墓地",
        levelRange: [61, 70],
        boss: {
            name: "幽魂君主",
            hp: calculateBossHp(7),    // 原500 → 25000 (50倍)
            attack: calculateBossAtk(7),  // 原80 → 370 (4.6倍)
            lai: 8
        }
    },
    // 熔岩深渊 (71-80级)
    { 
        id: 8,
        name: "熔岩深渊",
        levelRange: [71, 80],
        boss: {
            name: "火焰魔王",
            hp: calculateBossHp(8),   // 原600 → 33000 (55倍)
            attack: calculateBossAtk(8), // 原90 → 460 (5.1倍)
            lai: 9
        }
    },
    // 天空之城 (81-90级)
    { 
        id: 9,
        name: "天空之城",
        levelRange: [81, 90],
        boss: {
            name: "圣光守护者",
            hp: calculateBossHp(9),   // 原800 → 42000 (52.5倍)
            attack: calculateBossAtk(9), // 原100 → 560 (5.6倍)
            lai: 10
        }
    },
    // 混沌深渊 (91-99级)
    { 
        id: 10,
        name: "混沌深渊",
        levelRange: [91, 99],
        boss: {
            name: "终焉魔神",
            hp: calculateBossHp(10),    // 原1000 → 52000 (52倍)
            attack: calculateBossAtk(10), // 原120 → 670 (5.6倍)
            lai: 10
        }
    }
];

const enemyTemplates = {
    // 森林之地 (1-10级)
    1: [
        { name: "地精", minLevel: 1, maxLevel: 3, minExp: 5, maxExp: 15, lai: 1 },
        { name: "哥布林", minLevel: 2, maxLevel: 4, minExp: 10, maxExp: 20, lai: 2 },
        { name: "野狼", minLevel: 3, maxLevel: 5, minExp: 15, maxExp: 25, lai: 2 },
        { name: "毒蜘蛛", minLevel: 4, maxLevel: 6, minExp: 20, maxExp: 30, lai: 2 },
        { name: "树精", minLevel: 5, maxLevel: 7, minExp: 25, maxExp: 35, lai: 1 },
        { name: "巨蜂", minLevel: 6, maxLevel: 8, minExp: 30, maxExp: 40, lai: 3 },
        { name: "沼泽蛙", minLevel: 7, maxLevel: 9, minExp: 35, maxExp: 45, lai: 1 },
        { name: "食人花", minLevel: 8, maxLevel: 10, minExp: 40, maxExp: 50, lai: 1 }
    ],
    
    // 火焰沙漠 (11-20级)
    2: [
        { name: "沙漠蝎子", minLevel: 11, maxLevel: 13, minExp: 50, maxExp: 60, lai: 2 },
        { name: "沙虫", minLevel: 12, maxLevel: 14, minExp: 55, maxExp: 65, lai: 1 },
        { name: "木乃伊", minLevel: 13, maxLevel: 15, minExp: 60, maxExp: 70, lai: 1 },
        { name: "火焰蜥蜴", minLevel: 14, maxLevel: 16, minExp: 65, maxExp: 75, lai: 3 },
        { name: "秃鹫", minLevel: 15, maxLevel: 17, minExp: 70, maxExp: 80, lai: 4 },
        { name: "沙暴元素", minLevel: 16, maxLevel: 18, minExp: 75, maxExp: 85, lai: 5 },
        { name: "骷髅战士", minLevel: 17, maxLevel: 19, minExp: 80, maxExp: 90, lai: 2 },
        { name: "烈日幽灵", minLevel: 18, maxLevel: 20, minExp: 85, maxExp: 95, lai: 6 }
    ],
    
    // 冰霜山脉 (21-30级)
    3: [
        { name: "雪狼", minLevel: 21, maxLevel: 23, minExp: 100, maxExp: 110, lai: 2 },
        { name: "冰霜巨人", minLevel: 22, maxLevel: 24, minExp: 105, maxExp: 115, lai: 1 },
        { name: "寒冰幽魂", minLevel: 23, maxLevel: 25, minExp: 110, maxExp: 120, lai: 6 },
        { name: "雪人", minLevel: 24, maxLevel: 26, minExp: 115, maxExp: 125, lai: 1 },
        { name: "冰晶蜘蛛", minLevel: 25, maxLevel: 27, minExp: 120, maxExp: 130, lai: 2 },
        { name: "暴风雪熊", minLevel: 26, maxLevel: 28, minExp: 125, maxExp: 135, lai: 1 },
        { name: "冰川海豹", minLevel: 27, maxLevel: 29, minExp: 130, maxExp: 140, lai: 1 },
        { name: "极光妖精", minLevel: 28, maxLevel: 30, minExp: 135, maxExp: 145, lai: 7 }
    ],
    
    // 幽暗沼泽 (31-40级)
    4: [
        { name: "沼泽鳄鱼", minLevel: 31, maxLevel: 33, minExp: 150, maxExp: 160, lai: 1 },
        { name: "毒蛙", minLevel: 32, maxLevel: 34, minExp: 155, maxExp: 165, lai: 2 },
        { name: "腐化树人", minLevel: 33, maxLevel: 35, minExp: 160, maxExp: 170, lai: 1 },
        { name: "泥浆怪", minLevel: 34, maxLevel: 36, minExp: 165, maxExp: 175, lai: 1 },
        { name: "瘟疫鼠", minLevel: 35, maxLevel: 37, minExp: 170, maxExp: 180, lai: 1 },
        { name: "暗影蛇", minLevel: 36, maxLevel: 38, minExp: 175, maxExp: 185, lai: 3 },
        { name: "变异蚊群", minLevel: 37, maxLevel: 39, minExp: 180, maxExp: 190, lai: 4 },
        { name: "沼泽女巫", minLevel: 38, maxLevel: 40, minExp: 185, maxExp: 195, lai: 9 }
    ],
    
    // 雷霆峡谷 (41-50级)
    5: [
        { name: "雷电元素", minLevel: 41, maxLevel: 43, minExp: 200, maxExp: 210, lai: 6 },
        { name: "风暴鹰", minLevel: 42, maxLevel: 44, minExp: 205, maxExp: 215, lai: 5 },
        { name: "静电傀儡", minLevel: 43, maxLevel: 45, minExp: 210, maxExp: 220, lai: 8 },
        { name: "雷云精怪", minLevel: 44, maxLevel: 46, minExp: 215, maxExp: 225, lai: 7 },
        { name: "导电蜈蚣", minLevel: 45, maxLevel: 47, minExp: 220, maxExp: 230, lai: 2 },
        { name: "磁力魔像", minLevel: 46, maxLevel: 48, minExp: 225, maxExp: 235, lai: 1 },
        { name: "闪电蜥蜴", minLevel: 47, maxLevel: 49, minExp: 230, maxExp: 240, lai: 3 },
        { name: "风暴召唤者", minLevel: 48, maxLevel: 50, minExp: 235, maxExp: 245, lai: 9 }
    ],
    
    // 星陨荒原 (51-60级)
    6: [
        { name: "陨石兽", minLevel: 51, maxLevel: 53, minExp: 250, maxExp: 260, lai: 1 },
        { name: "星界观察者", minLevel: 52, maxLevel: 54, minExp: 255, maxExp: 265, lai: 8 },
        { name: "水晶傀儡", minLevel: 53, maxLevel: 55, minExp: 260, maxExp: 270, lai: 1 },
        { name: "虚空蠕虫", minLevel: 54, maxLevel: 56, minExp: 265, maxExp: 275, lai: 1 },
        { name: "辐射蝎", minLevel: 55, maxLevel: 57, minExp: 270, maxExp: 280, lai: 2 },
        { name: "星尘精灵", minLevel: 56, maxLevel: 58, minExp: 275, maxExp: 285, lai: 7 },
        { name: "重力元素", minLevel: 57, maxLevel: 59, minExp: 280, maxExp: 290, lai: 6 },
        { name: "异界入侵者", minLevel: 58, maxLevel: 60, minExp: 285, maxExp: 295, lai: 3 }
    ],
    
    // 灵魂墓地 (61-70级)
    7: [
        { name: "怨灵", minLevel: 61, maxLevel: 63, minExp: 300, maxExp: 310, lai: 6 },
        { name: "骷髅法师", minLevel: 62, maxLevel: 64, minExp: 305, maxExp: 315, lai: 9 },
        { name: "食尸鬼", minLevel: 63, maxLevel: 65, minExp: 310, maxExp: 320, lai: 1 },
        { name: "死亡骑士", minLevel: 64, maxLevel: 66, minExp: 315, maxExp: 325, lai: 2 },
        { name: "缚灵", minLevel: 65, maxLevel: 67, minExp: 320, maxExp: 330, lai: 7 },
        { name: "尸巫", minLevel: 66, maxLevel: 68, minExp: 325, maxExp: 335, lai: 8 },
        { name: "幽灵龙", minLevel: 67, maxLevel: 69, minExp: 330, maxExp: 340, lai: 5 },
        { name: "亡者之主", minLevel: 68, maxLevel: 70, minExp: 335, maxExp: 345, lai: 4 }
    ],
    
    // 熔岩深渊 (71-80级)
    8: [
        { name: "熔岩恶魔", minLevel: 71, maxLevel: 73, minExp: 350, maxExp: 360, lai: 4 },
        { name: "火元素", minLevel: 72, maxLevel: 74, minExp: 355, maxExp: 365, lai: 7 },
        { name: "炎魔", minLevel: 73, maxLevel: 75, minExp: 360, maxExp: 370, lai: 3 },
        { name: "地狱犬", minLevel: 74, maxLevel: 76, minExp: 365, maxExp: 375, lai: 2 },
        { name: "岩浆巨兽", minLevel: 75, maxLevel: 77, minExp: 370, maxExp: 380, lai: 1 },
        { name: "烈焰凤凰", minLevel: 76, maxLevel: 78, minExp: 375, maxExp: 385, lai: 5 },
        { name: "焦土守卫", minLevel: 77, maxLevel: 79, minExp: 380, maxExp: 390, lai: 8 },
        { name: "硫磺毒蝎", minLevel: 78, maxLevel: 80, minExp: 385, maxExp: 395, lai: 2 }
    ],
    
    // 天空之城 (81-90级)
    9: [
        { name: "天使", minLevel: 81, maxLevel: 83, minExp: 400, maxExp: 410, lai: 5 },
        { name: "云巨人", minLevel: 82, maxLevel: 84, minExp: 405, maxExp: 415, lai: 1 },
        { name: "狮鹫", minLevel: 83, maxLevel: 85, minExp: 410, maxExp: 420, lai: 4 },
        { name: "光之精灵", minLevel: 84, maxLevel: 86, minExp: 415, maxExp: 425, lai: 7 },
        { name: "风暴领主", minLevel: 85, maxLevel: 87, minExp: 420, maxExp: 430, lai: 6 },
        { name: "神圣守卫", minLevel: 86, maxLevel: 88, minExp: 425, maxExp: 435, lai: 8 },
        { name: "天界战马", minLevel: 87, maxLevel: 89, minExp: 430, maxExp: 440, lai: 3 },
        { name: "预言者", minLevel: 88, maxLevel: 90, minExp: 435, maxExp: 445, lai: 9 }
    ],
    
    // 混沌深渊 (91-99级)
    10: [
        { name: "虚空行者", minLevel: 91, maxLevel: 93, minExp: 450, maxExp: 460, lai: 8 },
        { name: "混沌魔", minLevel: 92, maxLevel: 94, minExp: 455, maxExp: 465, lai: 4 },
        { name: "暗黑龙", minLevel: 93, maxLevel: 95, minExp: 460, maxExp: 470, lai: 5 },
        { name: "扭曲造物", minLevel: 94, maxLevel: 96, minExp: 465, maxExp: 475, lai: 1 },
        { name: "熵增兽", minLevel: 95, maxLevel: 97, minExp: 470, maxExp: 480, lai: 2 },
        { name: "时间吞噬者", minLevel: 96, maxLevel: 98, minExp: 475, maxExp: 485, lai: 7 },
        { name: "空间撕裂者", minLevel: 97, maxLevel: 99, minExp: 480, maxExp: 490, lai: 6 },
        { name: "终焉使者", minLevel: 98, maxLevel: 99, minExp: 485, maxExp: 495, lai: 9 }
    ]
};

// 获取当前地图的敌人池
function getCurrentEnemyTemplates() {
    return enemyTemplates[currentMap.id] || enemyTemplates[1];
}

// 辅助函数：根据地图ID计算推荐玩家属性
//function getRecommendedStats(mapId) {
//    return {
//        minHp: Math.floor(maps[mapId-1].boss.hp / 10),
//        minAttack: Math.floor(maps[mapId-1].boss.hp / 25),
//        minDefense: Math.floor(maps[mapId-1].boss.attack / 3)
//    };
//}



let currentMap = maps[0];
let unlockedMaps = [1];
let isManualMapSwitch = false;
let isBossAvailable = false;


// Boss血量公式：500 * mapID^1.8 + 随机波动(5%-15%)
function calculateBossHp(mapID) {
    const baseHp = 500 * Math.pow(mapID, 1.8);
    const randomFactor = 1 + (Math.random() * 0.1 + 0.05); // 5%-15%波动
    return Math.floor(baseHp * randomFactor); 
}
// Boss攻击力公式：30 * mapID^1.5 + 随机波动(5%-10%) 
function calculateBossAtk(mapID) {
    const baseAtk = 30 * Math.pow(mapID, 1.5);
    const randomFactor = 1 + (Math.random() * 0.05 + 0.05); // 5%-10%波动
    return Math.floor(baseAtk * randomFactor);
}



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
    monster.name = boss.name;
    monster.hp = boss.hp;
    monster.maxHp = monster.hp;
    monster.attack = boss.attack;
    monster.lai = boss.lai;
    playerPosition = 5;
    monsterPosition = 0;
    distance = Math.abs(playerPosition - monsterPosition) - 1;
    log(`挑战${currentMap.name}地图王：${boss.name}！（生命值:${boss.hp} 攻击力:${boss.attack} 直线攻击距离:${boss.lai}）`);
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
        // 基于地图ID的难度加成
        const mapBonus = currentMap.id - 1;
        
        // 调整属性
        monster.maxHp = Math.round(monster.maxHp * (1 + mapBonus * 0.15));
        monster.hp = monster.maxHp;
        monster.attack = Math.round(monster.attack * (1 + mapBonus * 0.1));
        monster.lai = Math.min(monster.lai + Math.floor(mapBonus / 3), 6);
        monster.exp = Math.round(monster.exp * (1 + mapBonus * 0.2));
        monster.gold = Math.round(monster.gold * (1 + mapBonus * 0.15));
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