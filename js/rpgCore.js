//辅助函数
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let player = {
    name: localStorage.getItem('playerName') || "无名",
    level: 1,
    exp: 0,
    expToLevel: 50,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 0,
    gold: 10000,
    inventory: [],
    inventoryCapacity: 9999,
    equipment: { mainHand: null, offHand: null, accessory: null },
    currentSlot: 'slot0',
    version:20250424000039217
};

// 配置表：星级对应的减伤基数（可自由调整）
const STAR_REDUCTION_RATE = {
    1: 0.30,  // 1星减伤30%
    2: 0.25,
    3: 0.20,
    4: 0.15,
    5: 0.10,
    6: 0.05,
    7: 0.01   // 7星减伤1%
};

// 在player对象下方添加名称管理函数
function initNameSystem() {
    const nameDisplay = document.getElementById('display-name');
    const nameInput = document.getElementById('name-input');
    const editBtn = document.getElementById('edit-name-btn');
    
    // 初始化显示
    nameDisplay.textContent = player.name;
    
    // 改名按钮点击事件
    editBtn.addEventListener('click', () => {
        nameInput.value = player.name;
        nameDisplay.style.display = 'none';
        nameInput.style.display = 'inline-block';
        nameInput.focus();
        editBtn.textContent = '保存';
    });
    
    // 输入框事件处理
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveName();
        }
    });
    
    nameInput.addEventListener('blur', saveName);
    
    function saveName() {
        const newName = nameInput.value.trim() || '无名';
        player.name = newName;
        nameDisplay.textContent = newName;
        nameInput.style.display = 'none';
        nameDisplay.style.display = 'inline';
        editBtn.textContent = '改名';
        
        // 更新日志中的名称引用
        log(`玩家名称已变更为: ${newName}`);
        updateGameUI();
        saveGame(AUTO_SAVE_SLOT, true);
    }
}

let monster = { name: "无名", maxHp:0, hp: 0, attack: 0, lai: 0 };

// 添加在 monster 变量下方
let chargeSystem = {
    level: 0,        // 当前蓄力阶段(0-3)
    isCharging: false,
    chargeTimer: null,
    multipliers: [1.0, 2.0, 2.5, 3.0], // 各阶段倍率
    xKeyPressed: false, // 新增：跟踪X键状态
    hasChargedThisTurn: false, // 新增：标记本回合是否已蓄力
    skillNames: ["", "轻", "重", "超"], // 索引0为空，对应无蓄力状态
    skillLv: ["", "！", "！！", "！！！"],
    skillTags: ["", "地动山摇！", "山崩地裂！！", "毁天灭地！！！"]
};

let battleCount = 0;
let isFighting = false;
let isBossFight = false;
let playerPosition = 5; // 玩家格子索引（初始格子5）
let monsterPosition = 0; // 怪物格子索引（初始格子0）
let distance = Math.abs(playerPosition - monsterPosition) - 1; // 初始距离=4

// 创建玩家和怪物方块
function createPlayerCell() {
    const playerCell = document.createElement('div');
    playerCell.className = 'player-cell';
    return playerCell;
}

function createMonsterCell() {
    const monsterCell = document.createElement('div');
    monsterCell.className = 'monster-cell';
    return monsterCell;
}

// 更新游戏主UI
function updateGameUI() {
    mainHand = player.equipment.mainHand;
    offHand = player.equipment.offHand;
    gameElements.playerLevel.textContent = player.level;
    gameElements.playerExp.textContent = player.exp;
    gameElements.expToLevel.textContent = player.expToLevel;
    gameElements.playerHp.textContent = player.hp;
    gameElements.playerMaxHp.textContent = player.maxHp;
    gameElements.playerAttack.textContent = player.attack;
    gameElements.playerDefense.textContent = player.defense;
    gameElements.playerGold.textContent = player.gold;
    gameElements.monsterHp.textContent = monster.hp;
    gameElements.monsterAttack.textContent = monster.attack;
    gameElements.monsterLai.textContent = monster.lai;
    gameElements.battleCount.textContent = battleCount;
    gameElements.inventoryCount.textContent = player.inventory.length;

    // 更新血条和文字
    const healthBar = document.querySelector('.health-bar');
    const healthText = document.getElementById('health-text');
    if (healthBar && healthText) {
        const hpPercent = (player.hp / player.maxHp) * 100;
        healthBar.style.width = `${hpPercent}%`;
        healthText.textContent = `生命值：${player.hp}/${player.maxHp}`;
    }

    // 更新经验条和文字
    const expBar = document.querySelector('.exp-bar');
    const expText = document.getElementById('exp-text');
    if (expBar && expText) {
        const expPercent = (player.exp / player.expToLevel) * 100;
        expBar.style.width = `${expPercent}%`;
        expText.textContent = `经验值：${player.exp}/${player.expToLevel}`;
    }

    
    // 更新DQ显示
    distance = Math.abs(playerPosition - monsterPosition) - 1;
    if (gameElements.distance) {
        gameElements.distance.textContent = distance;
    }
    if (gameElements.distanceGrid) {
        const cells = gameElements.distanceGrid.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            cell.innerHTML = '';
            if (index === monsterPosition) {
                cell.appendChild(createMonsterCell());
            }
            if (index === playerPosition) {
                cell.appendChild(createPlayerCell());
            }
        });
    }

    // 更新玩家LAI
    const lai = player.equipment.mainHand ? player.equipment.mainHand.lai : 1;
    gameElements.playerLai.textContent = lai;

    // 控制战斗按钮 - 修改这里：不再覆盖Boss按钮状态
    gameElements.fightButton.style.display = isFighting ? 'none' : 'inline-block';
    gameElements.battleActions.style.display = isFighting ? 'flex' : 'none';
    gameElements.healButton.disabled = player.gold < 10 || player.hp >= player.maxHp || isFighting;
    
    // 确保在战斗结束后检查Boss按钮状态
    if (!isFighting) {
        checkMapProgress();
    }

    // 更新蓄力显示
    updateChargeUI();
    
    // 双手剑类武器提示
    //const weapon = player.equipment.mainHand;
    const chargeHint = document.getElementById('charge-hint');
    if (chargeHint) {
        chargeHint.style.display = (mainHand && mainHand.type === '双手剑') ? 'block' : 'none';
    }

}

// 记录战斗日志
function log(message) {
    gameElements.battleLog.innerHTML += `<p>${message}</p>`;
    gameElements.battleLog.scrollTop = gameElements.battleLog.scrollHeight;
}

// 检查玩家是否升级
function checkLevelUp() {
    while (player.exp >= player.expToLevel) {
        player.level++;
        player.exp -= player.expToLevel;
        player.expToLevel = player.level * 50;
        player.maxHp += 20;
        player.hp = player.maxHp;
        player.attack += 5;
        player.defense += 2;
        log(`${player.name}升级到 ${player.level} 级！生命值上限+20，攻击力+5，防御力+2，生命值已回满`);
        gameElements.playerMaxHp.classList.add('blink');
        gameElements.playerHp.classList.add('blink');
        gameElements.playerAttack.classList.add('blink');
        gameElements.playerDefense.classList.add('blink');
        checkMapProgress();
    }
    updateGameUI();
}

// 生成新怪物
function generateMonster() {
    battleCount++;
    
    // 获取当前地图的敌人模板
    const templates = getCurrentEnemyTemplates();
    const playerLevel = player.level;
    
    // 筛选适合当前玩家等级的敌人
    const suitableEnemies = templates.filter(
        enemy => playerLevel >= enemy.minLevel && playerLevel <= enemy.maxLevel
    );
    
    // 随机选择一个敌人模板
    const template = suitableEnemies[Math.floor(Math.random() * suitableEnemies.length)] || templates[0];
    
    // 计算敌人等级（玩家等级±3范围内）
    const enemyLevel = Math.max(
        playerLevel - 3 + Math.floor(Math.random() * 7), 
        1
    );
    
    // 计算敌人属性（使用新的成长公式）
    const maxHp = random(
        Math.floor(50 + 5 * enemyLevel * Math.pow(1.09015, enemyLevel)),
        Math.floor(150 + 10 * enemyLevel * Math.pow(1.09015, enemyLevel))
    );
    
    const attack = random(
        Math.floor(5 + 2 * enemyLevel * Math.pow(1.052, enemyLevel)),
        Math.floor(20 + 5 * enemyLevel * Math.pow(1.052, enemyLevel))
    );
    
    const gold = random(
        Math.floor(10 + 2 * enemyLevel * Math.pow(1.1181, enemyLevel)),
        Math.floor(50 + 5 * enemyLevel * Math.pow(1.1181, enemyLevel))
    );
    
    // 创建敌人对象
    Object.assign(monster, {
        name: template.name,
        level: enemyLevel,
        hp: maxHp,
        maxHp: maxHp,
        attack: attack,
        lai: template.lai,
        gold: gold,
        exp: random(template.minExp, template.maxExp)
    });
    
    // 应用地图难度加成
    adjustMonsterStats(monster);
    
    // 重置战斗位置
    playerPosition = 5;
    monsterPosition = 0;
    distance = Math.abs(playerPosition - monsterPosition) - 1;
    
    // 更新UI
    const enemyContainer = document.getElementById('enemy-health-container');
    if (enemyContainer) enemyContainer.style.display = 'block';
    
    const expContainer = document.getElementById('exp-container');
    if (expContainer) expContainer.style.display = 'none';

    updateEnemyHealth();
    updateGameUI();
    
    log(`第 ${battleCount} 次战斗开始！遇到${currentMap.name}的${monster.name}（Lv.${monster.level} 生命值：${monster.hp} 攻击力：${monster.attack} 直线攻击距离：${monster.lai}）`);
}


function updateEnemyHealth() {
    const enemyBar = document.querySelector('.enemy-health-bar');
    const enemyText = document.querySelector('.enemy-health-text');
    if (enemyBar && enemyText) {
        const percent = (monster.hp / monster.maxHp) * 100;
        enemyBar.style.width = `${percent}%`;
        enemyText.textContent = `${monster.name}生命值：${monster.hp}/${monster.maxHp}`;
    }
}


// 玩家原地不动或攻击
function playerStayOrAttack() {
    //const weapon = player.equipment.mainHand;
    const playerLai = player.equipment.mainHand ? player.equipment.mainHand.lai : 1;

    // 火球术条件检测
    if (mainHand && mainHand.type === '法杖' && playerPosition === 10) { // 注意：格子索引是0-10，所以第11格是索引10
        castFireball();
        return;
    }

    if (mainHand && mainHand.type === '双手剑' && chargeSystem.level > 0 && distance <= playerLai) {
        const damage = Math.floor(player.attack * chargeSystem.multipliers[chargeSystem.level]);
        monster.hp -= damage;
        updateEnemyHealth();
        log(`<span class="ultimate-text">${player.name}使用<span class="rarity-${mainHand.rarity}">${mainHand.name}</span>释放<span class="red-text">${chargeSystem.skillNames[chargeSystem.level]}蓄力斩${chargeSystem.skillLv[chargeSystem.level]}</span><span class="effect-text">${chargeSystem.skillTags[chargeSystem.level]}</span>造成<span class="damage-text"> ${damage}</span> 点伤害${chargeSystem.skillLv[chargeSystem.level]}${monster.name}剩余生命值: ${monster.hp}</span>`);
        chargeSystem.level = 0; // 重置蓄力
        chargeSystem.hasChargedThisTurn = false;
        gameElements.monsterHp.classList.add('blink');
        checkBattleEnd();
        return;
    }

    if (distance <= playerLai) {
        let rawDamage = player.attack;
        let damage = rawDamage;
        
        if (player.equipment.mainHand && player.equipment.mainHand.type === '匕首' && distance === 0) {
            damage = Math.floor(rawDamage * 1.5);
            log('匕首贴身攻击，伤害提升50%！');
        } else if (player.equipment.mainHand && player.equipment.mainHand.type === '魔法书' && distance === playerLai) {
            damage = rawDamage * 2;
            log('魔法书精准打击，伤害翻倍！');
        }
        
        const mitigatedDamage = Math.min(Math.floor(monster.attack / 2), damage);
        damage = Math.max(1, damage - mitigatedDamage);
        
        monster.hp -= damage;
        updateEnemyHealth();
        log(`${player.name}攻击${isBossFight ? currentMap.boss.name : `${monster.name}`}，造成 ${damage} 点伤害（减伤 ${mitigatedDamage} 点），${isBossFight ? currentMap.boss.name : `${monster.name}`}剩余生命值: ${monster.hp}`);
        gameElements.monsterHp.classList.add('blink');
    } else {
        log(`${player.name}原地不动，${isBossFight ? currentMap.boss.name : `${monster.name}`}超出攻击范围`);
    }

    checkBattleEnd()
}

function castFireball() {
    // 1. 获取装备
    //const mainHand = player.equipment.mainHand;
    //const offHand = player.equipment.offHand;
    
    // 2. 强制主手必须装备法杖（否则直接返回）
    if (!mainHand || mainHand.type !== '法杖') return;


    const starLevel = Math.min(7, Math.max(1, mainHand.rarity || 1));
    const reductionRate = STAR_REDUCTION_RATE[starLevel];


    // 3. 精确检测组合状态（主手法杖 + 副手魔法书）
    const isCombo = offHand && offHand.type === '魔法书';  // true/false
    
    // 4. 动态计算伤害倍率和攻击力加成
    const damageMultiplier = isCombo ? 2.5 : 1.8;
    //const weaponAttack = mainHand.attack + (isCombo ? offHand.attack : 0);
    
    // 5. 最终伤害计算（包含减伤逻辑）
    const baseDamage = Math.floor(player.attack * damageMultiplier);
    //const mitigatedDamage = Math.floor(baseDamage * 0.20); // 减伤20%
    const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - reductionRate)));
    const mitigatedDamage = Math.floor(baseDamage - finalDamage);

    // 6. 战斗日志输出
    log(`<span class="fireball-text">${player.name}挥舞<span class="rarity-${mainHand.rarity}"></span>${mainHand.name}，释放火球术🔥！炽热的火球🔥飞向${monster.name}！</span>`);
    
    setTimeout(() => {
        monster.hp -= finalDamage;
        updateEnemyHealth();
        
        // 只有组合时才显示特殊提示
        log(`<span class="fireball-text">${isCombo ? "🔥法杖+魔法书组合效果发动🔥" : ""}</span>`);
        log(`<span class="fireball-text">火球🔥命中${monster.name}！造成 ${finalDamage} 点伤害（减免 ${mitigatedDamage}），剩余生命值: ${monster.hp}</span>`);
        
        checkBattleEnd();
    }, 800);
}

// 辅助函数：获取敌人名称
function getEnemyName() {
    return isBossFight ? currentMap.boss.name : monster.name;
}

// 辅助函数：检查战斗结束
function checkBattleEnd() {
    if (monster.hp <= 0) {
        monster.hp = 0;
        updateEnemyHealth();
        endBattle(true);
    } else {
        monsterTurn();
    }
}

// 怪物回合
function monsterTurn() {
    if (distance <= monster.lai) {
        const rawDamage = monster.attack;
        const mitigatedDamage = Math.floor(rawDamage * (player.defense / (player.defense + 100)));
        const actualDamage = Math.max(1, rawDamage - mitigatedDamage);
        
        player.hp -= actualDamage;
        log(`${isBossFight ? currentMap.boss.name : `${monster.name}`}攻击${player.name}，造成 ${actualDamage} 点伤害（减伤 ${mitigatedDamage} 点），${player.name}剩余生命值: ${player.hp}`);
        gameElements.playerHp.classList.add('blink');
    } else {
        if (monsterPosition < playerPosition - 1 && monsterPosition < 10) {
            monsterPosition++;
            distance = Math.abs(playerPosition - monsterPosition) - 1;
            log(`${isBossFight ? currentMap.boss.name : `${monster.name}`}前进，距离减少到 ${distance} 格`);
        } else {
            log(`${isBossFight ? currentMap.boss.name : `${monster.name}`}无法继续前进`);
        }
    }

    if (player.hp <= 0) {
        endBattle(false);
    } else {
        //chargeSystem.hasChargedThisTurn = false; // 标记已蓄力
        updateGameUI();
    }
}

function endBattle(playerWon) {
    isFighting = false;
    
    // 1. 处理Boss战特殊逻辑
    if (isBossFight) {
        endBossFight(playerWon);
    }
    
    // 2. 处理战斗结果
    if (playerWon && !isBossFight) {
        //const goldReward = Math.floor(Math.random() * 31) + 20;
        //const expReward = Math.floor(Math.random() * 11) + 10;
        player.gold += monster.gold;
        player.exp += monster.exp;
        log(`${monster.name}被击败！获得 ${monster.gold} 金币和 ${monster.exp} 经验值`);
        chargeSystem.hasChargedThisTurn = false; // 重置蓄力标记
        checkLevelUp();
        saveGame(AUTO_SAVE_SLOT, true);
    } 
    else if (!playerWon) {
        log(`${player.name || '玩家'}被${isBossFight ? currentMap.boss.name : (monster.name || '怪物')}击败！${isBossFight ? '可重新挑战' : '游戏结束'}`);
        if (isBossFight) {
            player.hp = player.maxHp; // Boss战允许复活
        } else {
            setTimeout(() => {
                alert('游戏结束！你被击败了。');
                showSaveManager();
            }, 1000);
        }
    }
    
    // 3. 统一UI控制
    const enemyContainer = document.getElementById('enemy-health-container');
    if (enemyContainer) {
        enemyContainer.style.display = 'none';
        enemyContainer.querySelector('.enemy-health-bar').style.transition = 'none';
    }
    
    const expContainer = document.getElementById('exp-container');
    if (expContainer) expContainer.style.display = 'block'; // 修正了这里的变量名错误

    // 重置蓄力状态
    chargeSystem.level = 0;
    chargeSystem.isCharging = false;
    clearTimeout(chargeSystem.chargeTimer);
    updateChargeUI();

    
    // 4. 更新游戏状态
    updateGameUI();
}

// 蓄力系统控制
// 修改startCharge和cancelCharge函数
function startCharge() {
    if (!isFighting || chargeSystem.isCharging || chargeSystem.hasChargedThisTurn) return;
    
    //const weapon = player.equipment.mainHand;
    if (!mainHand || mainHand.type !== '双手剑') return;
    
    chargeSystem.isCharging = true;
    chargeSystem.chargeTimer = setTimeout(() => {
        if (chargeSystem.level < 3) {
            chargeSystem.level++;
            chargeSystem.hasChargedThisTurn = true; // 标记已蓄力
            log(`蓄力完成！当前阶段: ${chargeSystem.level}`);
            updateChargeUI();
        }
        chargeSystem.isCharging = false;
    }, 500); //蓄力时间（毫秒）
}
function cancelCharge() {
    if (chargeSystem.chargeTimer) {
        clearTimeout(chargeSystem.chargeTimer);
        chargeSystem.isCharging = false;
    }
}
// 新增X键控制函数
function handleXKeyDown(e) {
    if (e.key.toLowerCase() === 'x' && !chargeSystem.xKeyPressed) {
        chargeSystem.xKeyPressed = true;
        startCharge();
    }
}
function handleXKeyUp(e) {
    if (e.key.toLowerCase() === 'x' && chargeSystem.xKeyPressed) {
        chargeSystem.xKeyPressed = false;
        cancelCharge();
    }
}

// 在 initRPG() 函数之前添加以下代码

// 键盘控制函数
// 更新后的键盘控制函数
function handleKeyControls(e) {
    const key = e.key.toLowerCase();
    
    // 防止在输入框中触发
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    switch(key) {
        case 'arrowleft':
            if (isFighting) {
                moveForward();
            }
            break;
            
        case 'arrowright':
            if (isFighting) {
                moveBackward();
            }
            break;
            
        case 'z':
            if (isFighting) {
                playerStayOrAttack(); // 战斗中：攻击
            } else {
                startBattle(); // 战斗外：开始战斗
            }
            break;
    }
}

// 提取移动操作为独立函数
function moveForward() {
    if (playerPosition <= monsterPosition + 1) {
        showToast('已贴近怪物，无法更近！');
        return;
    }
    playerPosition--;
    distance = Math.abs(playerPosition - monsterPosition) - 1;
    log(`${player.name}前进，距离减少到 ${distance} 格`);
    updateGameUI();
    monsterTurn();
}

function moveBackward() {
    if (playerPosition >= 10) {
        showToast(`已达最大距离！${player.name}无路可退！`);
        return;
    }
    playerPosition++;
    distance = Math.abs(playerPosition - monsterPosition) - 1;
    log(`${player.name}后退，距离增加到 ${distance} 格`);
    updateGameUI();
    monsterTurn();
}

// 开始战斗函数
function startBattle() {
    if (isFighting) return;
    isFighting = true;
    generateMonster();
    updateGameUI();
}



function updateChargeUI() {
    const chargeDisplay = document.getElementById('charge-display');
    if (chargeDisplay) {
        chargeDisplay.innerHTML = `蓄力阶段: ${'◆'.repeat(chargeSystem.level)}${'◇'.repeat(3 - chargeSystem.level)}`;
        chargeDisplay.className = `charge-level-${chargeSystem.level}`;
    }
}

// 初始化RPG核心事件
function initRPG() {
    initNameSystem();
    gameElements.fightButton.addEventListener('click', () => {
        if (isFighting) return;
        isFighting = true;
        generateMonster();
        updateGameUI();
    });

    gameElements.moveForwardButton.addEventListener('click', () => {
        if (!isFighting) return;
        if (playerPosition <= monsterPosition + 1) {
            showToast('已贴近怪物，无法更近！');
            return;
        }
        playerPosition--;
        distance = Math.abs(playerPosition - monsterPosition) - 1;
        log(`${player.name}前进，距离减少到 ${distance} 格`);
        updateGameUI();
        monsterTurn();
    });

    gameElements.moveBackwardButton.addEventListener('click', () => {
        if (!isFighting) return;
        if (playerPosition >= 10) {
            showToast(`已达最大距离！${player.name}无路可退！`);
            return;
        }
        playerPosition++;
        distance = Math.abs(playerPosition - monsterPosition) - 1;
        log(`${player.name}后退，距离增加到 ${distance} 格`);
        updateGameUI();
        monsterTurn();
    });

    gameElements.attackButton.addEventListener('click', () => {
        if (!isFighting) return;
        playerStayOrAttack();
    });

    gameElements.healButton.addEventListener('click', () => {
        if (player.gold < 10) {
            log('金币不足，无法回血！需要10金币');
            return;
        }
        if (player.hp >= player.maxHp) {
            log('生命值已满，无需回血！');
            return;
        }
        player.gold -= 10;
        const healAmount = 50;
        player.hp = Math.min(player.hp + healAmount, player.maxHp);
        log(`消耗10金币恢复 ${healAmount} 点生命值，当前生命值: ${player.hp}/${player.maxHp}`);
        gameElements.playerHp.classList.add('blink');
        updateGameUI();
    });

    // 添加键盘监听
    document.addEventListener('keydown', handleXKeyDown);
    document.addEventListener('keyup', handleXKeyUp);

    document.addEventListener('keydown', handleKeyControls);
    //document.addEventListener('keyup', handleKeyUp);

    updateGameUI();
}