let player = {
    name: "无名",
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
    version:2.1
};

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
    const weapon = player.equipment.mainHand;
    const chargeHint = document.getElementById('charge-hint');
    if (chargeHint) {
        chargeHint.style.display = (weapon && weapon.type === '双手剑') ? 'block' : 'none';
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
    //monster.maxHp = 20 + battleCount * 5;
    //monster.hp = monster.maxHp;
    monster.attack = 5 + battleCount * 2;
    monster.lai = Math.min(1 + Math.floor(battleCount / 5), 3);
    adjustMonsterStats(monster);
    playerPosition = 5;
    monsterPosition = 0;
    distance = Math.abs(playerPosition - monsterPosition) - 1;

    const enemyContainer = document.getElementById('enemy-health-container');
    if (enemyContainer) {
        enemyContainer.style.display = 'block';
        updateEnemyHealth();
    }
    const expContainer = document.getElementById('exp-container');
    if (expContainer) expContainer.style.display = 'none';
    updateGameUI();
    log(`第 ${battleCount} 次战斗开始！遇到${currentMap.name}的怪物${monster.name}（生命值: ${monster.hp}, 攻击力: ${monster.attack}, 攻击距离: ${monster.lai}）`);
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
    const weapon = player.equipment.mainHand;
    const playerLai = player.equipment.mainHand ? player.equipment.mainHand.lai : 1;

    // 火球术条件检测
    if (weapon && weapon.type === '法杖' && playerPosition === 10) { // 注意：格子索引是0-10，所以第11格是索引10
        castFireball();
        return;
    }

    if (weapon && weapon.type === '双手剑' && chargeSystem.level > 0 && distance <= playerLai) {
        const damage = Math.floor(player.attack * chargeSystem.multipliers[chargeSystem.level]);
        monster.hp -= damage;
        updateEnemyHealth();
        log(`${player.name}释放${chargeSystem.skillNames[chargeSystem.level]}蓄力斩${chargeSystem.skillLv[chargeSystem.level]}${chargeSystem.skillTags[chargeSystem.level]}造成 ${damage} 点伤害${chargeSystem.skillLv[chargeSystem.level]}`);
        chargeSystem.level = 0; // 重置蓄力
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
    const mainHand = player.equipment.mainHand;
    const offHand = player.equipment.offHand;
    
    // 2. 强制主手必须装备法杖（否则直接返回）
    if (!mainHand || mainHand.type !== '法杖') {
        log(`${player.name}需要装备法杖才能施放火球术！`);
        return;
    }

    // 3. 精确检测组合状态（主手法杖 + 副手魔法书）
    const isCombo = offHand && offHand.type === '魔法书';  // true/false
    
    // 4. 动态计算伤害倍率和攻击力加成
    const damageMultiplier = isCombo ? 2.5 : 1.8;
    //const weaponAttack = mainHand.attack + (isCombo ? offHand.attack : 0);
    
    // 5. 最终伤害计算（包含减伤逻辑）
    const baseDamage = Math.floor(player.attack * damageMultiplier);
    const mitigatedDamage = Math.min(Math.floor(monster.attack / 3), baseDamage); // 减伤较少
    const finalDamage = Math.max(1, baseDamage - mitigatedDamage);

    // 6. 战斗日志输出
    log(`<span class="fireball-text">${player.name}挥舞${mainHand.name}，释放火球术🔥！炽热的火球🔥飞向${monster.name}！</span>`);
    
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
        const mitigatedDamage = Math.min(player.defense, rawDamage);
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
        chargeSystem.hasChargedThisTurn = false; // 标记已蓄力
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
        const goldReward = Math.floor(Math.random() * 31) + 20;
        const expReward = Math.floor(Math.random() * 11) + 10;
        player.gold += goldReward;
        player.exp += expReward;
        log(`${monster.name || '怪物'}被击败！获得 ${goldReward} 金币和 ${expReward} 经验值`);
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
    
    const weapon = player.equipment.mainHand;
    if (!weapon || weapon.type !== '双手剑') return;
    
    chargeSystem.isCharging = true;
    chargeSystem.chargeTimer = setTimeout(() => {
        if (chargeSystem.level < 3) {
            chargeSystem.level++;
            chargeSystem.hasChargedThisTurn = true; // 标记已蓄力
            log(`蓄力完成！当前阶段: ${chargeSystem.level}`);
            updateChargeUI();
        }
        chargeSystem.isCharging = false;
    }, 100); //蓄力时间（毫秒）
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

function updateChargeUI() {
    const chargeDisplay = document.getElementById('charge-display');
    if (chargeDisplay) {
        chargeDisplay.innerHTML = `蓄力阶段: ${'◆'.repeat(chargeSystem.level)}${'◇'.repeat(3 - chargeSystem.level)}`;
        chargeDisplay.className = `charge-level-${chargeSystem.level}`;
    }
}

// 初始化RPG核心事件
function initRPG() {
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
            showToast('已达最大距离！无路可退！');
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

    updateGameUI();
}