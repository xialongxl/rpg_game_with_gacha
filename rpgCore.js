let player = {
    level: 1,
    exp: 0,
    expToLevel: 50,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 0,
    gold: 0,
    inventory: [],
    inventoryCapacity: 10,
    equipment: { mainHand: null, offHand: null, accessory: null }
};

let monster = { hp: 0, attack: 0 };
let battleCount = 0;
let isFighting = false;

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
    gameElements.battleCount.textContent = battleCount;
    gameElements.inventoryCount.textContent = player.inventory.length;

    gameElements.gachaButton.disabled = player.gold < 100 || isFighting;
    gameElements.healButton.disabled = player.gold < 10 || player.hp >= player.maxHp || isFighting;

    updateEquipmentUI(); // 依赖equipment.js
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
    updateGameUI();
    log(`第 ${battleCount} 次战斗开始！遇到怪物（生命值: ${monster.hp}, 攻击力: ${monster.attack}）`);
}

// 战斗回合
function fightRound() {
    monster.hp -= player.attack;
    log(`玩家攻击怪物，造成 ${player.attack} 点伤害，怪物剩余生命值: ${monster.hp}`);

    if (monster.hp <= 0) {
        const goldReward = Math.floor(Math.random() * 31) + 20;
        const expReward = Math.floor(Math.random() * 11) + 10;
        player.gold += goldReward;
        player.exp += expReward;
        log(`怪物被击败！获得 ${goldReward} 金币和 ${expReward} 经验值`);
        checkLevelUp();
        isFighting = false;
        gameElements.fightButton.disabled = false;
        updateGameUI();
        return;
    }

    const damage = Math.max(1, monster.attack - player.defense);
    player.hp -= damage;
    log(`怪物攻击玩家，造成 ${damage} 点伤害（减免 ${player.defense}），玩家剩余生命值: ${player.hp}`);

    if (player.hp <= 0) {
        log('玩家被击败！游戏结束');
        isFighting = false;
        gameElements.fightButton.disabled = true;
        gameElements.gachaButton.disabled = true;
        gameElements.healButton.disabled = true;
        setTimeout(() => {
            alert('游戏结束！你被击败了。');
            location.reload();
        }, 1000);
        return;
    }

    updateGameUI();
    setTimeout(fightRound, 1000);
}

// 初始化RPG核心事件
function initRPG() {
    gameElements.fightButton.addEventListener('click', () => {
        if (isFighting) return;
        isFighting = true;
        gameElements.fightButton.disabled = true;
        gameElements.gachaButton.disabled = true;
        gameElements.healButton.disabled = true;
        generateMonster();
        fightRound();
    });

    gameElements.gachaButton.addEventListener('click', () => {
        if (player.gold < 100) {
            log('金币不足，无法抽卡！需要100金币');
            return;
        }
        player.gold -= 100;
        log('消耗100金币进行抽卡...');
        updateGameUI();
        gameElements.btnSingle.click(); // 触发gacha.js
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