let player = {
    level: 1,
    exp: 0,
    expToLevel: 50,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 0,
    gold: 1000,
    inventory: [],
    inventoryCapacity: 10,
    equipment: { mainHand: null, offHand: null, accessory: null }
};

let monster = { hp: 0, attack: 0, lai: 0 };
let battleCount = 0;
let isFighting = false;
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
    
    // 更新DQ显示
    distance = Math.abs(playerPosition - monsterPosition) - 1;
    console.log(`Updating UI: distance=${distance}, playerPosition=${playerPosition}, monsterPosition=${monsterPosition}`);
    if (gameElements.distance) {
        gameElements.distance.textContent = distance;
    } else {
        console.error('Distance element not found');
    }
    if (gameElements.distanceGrid) {
        const cells = gameElements.distanceGrid.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            cell.innerHTML = ''; // 清除现有方块
            if (index === monsterPosition) {
                cell.appendChild(createMonsterCell()); // 怪物方块
            }
            if (index === playerPosition) {
                cell.appendChild(createPlayerCell()); // 玩家方块
            }
        });
    } else {
        console.error('Distance grid not found');
    }

    // 更新玩家LAI
    const lai = player.equipment.mainHand ? player.equipment.mainHand.lai : 1;
    gameElements.playerLai.textContent = lai;

    // 控制战斗按钮
    gameElements.fightButton.style.display = isFighting ? 'none' : 'inline-block';
    gameElements.battleActions.style.display = isFighting ? 'flex' : 'none';
    gameElements.gachaButton.disabled = player.gold < 100 || isFighting;
    gameElements.healButton.disabled = player.gold < 10 || player.hp >= player.maxHp || isFighting;
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
        log(`玩家升级到 ${player.level} 级！生命值上限+20，攻击力+5，防御力+2，生命值已回满`);
        gameElements.playerMaxHp.classList.add('blink');
        gameElements.playerHp.classList.add('blink');
        gameElements.playerAttack.classList.add('blink');
        gameElements.playerDefense.classList.add('blink');
        updateGameUI();
    }
}

// 生成新怪物
function generateMonster() {
    battleCount++;
    monster.hp = 20 + battleCount * 5;
    monster.attack = 5 + battleCount * 2;
    monster.lai = Math.min(1 + Math.floor(battleCount / 5), 3);
    playerPosition = 5; // 玩家格子5
    monsterPosition = 0; // 怪物格子0
    distance = Math.abs(playerPosition - monsterPosition) - 1; // 距离=4
    updateGameUI();
    log(`第 ${battleCount} 次战斗开始！遇到怪物（生命值: ${monster.hp}, 攻击力: ${monster.attack}, 攻击距离: ${monster.lai}）`);
}

// 玩家原地不动或攻击
function playerStayOrAttack() {
    const playerLai = player.equipment.mainHand ? player.equipment.mainHand.lai : 1;
    if (distance <= playerLai) {
        let damage = Math.max(1, player.attack - Math.floor(monster.attack / 2));
        if (player.equipment.mainHand && player.equipment.mainHand.type === '匕首' && distance === 0) {
            damage = Math.floor(damage * 1.5);
            log('匕首贴身攻击，伤害提升50%！');
        } else if (player.equipment.mainHand && player.equipment.mainHand.type === '魔法书' && distance === playerLai) {
            damage *= 2;
            log('魔法书精准打击，伤害翻倍！');
        }
        monster.hp -= damage;
        log(`玩家攻击怪物，造成 ${damage} 点伤害，怪物剩余生命值: ${monster.hp}`);
        gameElements.monsterHp.classList.add('blink');
    } else {
        log('玩家原地不动，怪物超出攻击范围');
    }

    if (monster.hp <= 0) {
        endBattle(true);
    } else {
        monsterTurn();
    }
}

// 怪物回合
function monsterTurn() {
    const action = Math.random() < 0.5 ? 'move' : 'attack';
    console.log(`Monster action: ${action}`);
    if (action === 'move') {
        if (monsterPosition < playerPosition - 1 && monsterPosition < 10) {
            monsterPosition++; // 怪物前进
            log(`怪物前进，距离减少到 ${distance} 格`);
        } else {
            log('怪物无法继续前进');
        }
    } else {
        if (distance <= monster.lai) {
            const damage = Math.max(1, monster.attack - player.defense);
            player.hp -= damage;
            log(`怪物攻击玩家，造成 ${damage} 点伤害，玩家剩余生命值: ${player.hp}`);
            gameElements.playerHp.classList.add('blink');
        } else {
            log('玩家超出怪物攻击范围，怪物未造成伤害');
        }
    }

    if (player.hp <= 0) {
        endBattle(false);
    } else {
        updateGameUI();
    }
}

// 结束战斗
function endBattle(playerWon) {
    isFighting = false;
    if (playerWon) {
        const goldReward = Math.floor(Math.random() * 31) + 20;
        const expReward = Math.floor(Math.random() * 11) + 10;
        player.gold += goldReward;
        player.exp += expReward;
        log(`怪物被击败！获得 ${goldReward} 金币和 ${expReward} 经验值`);
        checkLevelUp();
    } else {
        log('玩家被击败！游戏结束');
        setTimeout(() => {
            alert('游戏结束！你被击败了。');
            location.reload();
        }, 1000);
    }
    updateGameUI();
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
        playerPosition--; // 玩家前进
        log(`玩家前进，距离减少到 ${distance} 格`);
        updateGameUI();
        monsterTurn();
    });

    gameElements.moveBackwardButton.addEventListener('click', () => {
        if (!isFighting) return;
        if (playerPosition >= 10) {
            showToast('已达最大距离！无路可退！');
            return;
        }
        playerPosition++; // 玩家后退
        log(`玩家后退，距离增加到 ${distance} 格`);
        updateGameUI();
        monsterTurn();
    });

    gameElements.attackButton.addEventListener('click', () => {
        if (!isFighting) return;
        playerStayOrAttack();
    });

    gameElements.gachaButton.addEventListener('click', () => {
        if (player.gold < 100) {
            log('金币不足，无法抽卡！需要100金币');
            return;
        }
        player.gold -= 100;
        log('消耗100金币进行抽卡...');
        updateGameUI();
        gameElements.btnSingle.click();
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

    updateGameUI();
}