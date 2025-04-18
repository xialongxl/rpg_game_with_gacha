// 武器LAI定义
const weaponLai = {
    '单手剑': 2,
    '双手剑': 3,
    '匕首': 1,
    '法杖': 4,
    '弓': 5,
    '魔法书': 3,
    '盾牌': 0 // 盾牌不影响LAI
};

// 更新装备栏UI
function updateEquipmentUI() {
    if (player.equipment.mainHand) {
        const weapon = player.equipment.mainHand;
        gameElements.mainHandSlot.innerHTML = `
            <div class="equipment-slot-info">
                主手: 
                <img src="${weaponImages[weapon.type]}" class="equipment-slot-icon">
                ${weapon.name} (${weapon.type}, ${weapon.rarity}★, LAI=${weapon.lai})
            </div>
            <button class="action-button unequip-button" data-slot="mainHand">卸下</button>
        `;
    } else {
        gameElements.mainHandSlot.innerHTML = '<div class="equipment-slot-info">主手: 无装备 (LAI=1)</div>';
    }

    if (player.equipment.offHand) {
        const weapon = player.equipment.offHand;
        gameElements.offHandSlot.innerHTML = `
            <div class="equipment-slot-info">
                副手: 
                <img src="${weaponImages[weapon.type]}" class="equipment-slot-icon">
                ${weapon.name} (${weapon.type}, ${weapon.rarity}★)
            </div>
            <button class="action-button unequip-button" data-slot="offHand">卸下</button>
        `;
    } else {
        gameElements.offHandSlot.innerHTML = '<div class="equipment-slot-info">副手: 无装备</div>';
    }

    if (player.equipment.accessory) {
        const weapon = player.equipment.accessory;
        gameElements.accessorySlot.innerHTML = `
            <div class="equipment-slot-info">
                饰品: 
                <img src="${weaponImages[weapon.type]}" class="equipment-slot-icon">
                ${weapon.name} (${weapon.type}, ${weapon.rarity}★)
            </div>
            <button class="action-button unequip-button" data-slot="accessory">卸下</button>
        `;
    } else {
        gameElements.accessorySlot.innerHTML = '<div class="equipment-slot-info">饰品: 无装备</div>';
    }

    document.querySelectorAll('.unequip-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const slot = e.target.getAttribute('data-slot');
            unequipWeapon(slot);
        });
    });

    updateGameUI(); // 确保LAI更新
}

// 装备武器
function equipWeapon(index, slot) {
    const weapon = player.inventory[index];
    if (!weapon) return;

    if (player.equipment[slot]) {
        const oldWeapon = player.equipment[slot];
        if (player.inventory.length >= player.inventoryCapacity) {
            const confirmDiscard = confirm(`背包已满，是否丢弃当前${slot === 'mainHand' ? '主手' : slot === 'offHand' ? '副手' : '饰品'}装备 "${oldWeapon.name}" 以装备新物品？`);
            if (!confirmDiscard) {
                log(`取消装备 "${weapon.name}"，背包已满且未选择丢弃当前装备`);
                return;
            }
            log(`背包已满，丢弃了${slot === 'mainHand' ? '主手' : slot === 'offHand' ? '副手' : '饰品'}装备 "${oldWeapon.name}"`);
        } else {
            player.inventory.push(oldWeapon);
            log(`${slot === 'mainHand' ? '主手' : slot === 'offHand' ? '副手' : '饰品'}装备 "${oldWeapon.name}" 已返回背包`);
        }

        if (slot === 'mainHand') {
            const attackBonus = oldWeapon.baseStat || oldWeapon.rarity * 10;
            player.attack -= attackBonus;
            log(`卸下主手装备 "${oldWeapon.name}"，攻击力减少 ${attackBonus}`);
            gameElements.playerAttack.classList.add('blink');
        } else if (slot === 'offHand') {
            const defenseBonus = oldWeapon.baseStat || oldWeapon.rarity * 5;
            player.defense -= defenseBonus;
            log(`卸下副手装备 "${oldWeapon.name}"，防御力减少 ${defenseBonus}`);
            gameElements.playerDefense.classList.add('blink');
        } else if (slot === 'accessory') {
            const hpBonus = oldWeapon.baseStat || oldWeapon.rarity * 20;
            player.maxHp -= hpBonus;
            player.hp = Math.min(player.hp, player.maxHp);
            log(`卸下饰品 "${oldWeapon.name}"，生命值上限减少 ${hpBonus}`);
            gameElements.playerMaxHp.classList.add('blink');
            gameElements.playerHp.classList.add('blink');
        }
    }

    player.equipment[slot] = weapon;
    if (slot === 'mainHand') {
        const attackBonus = weapon.baseStat || weapon.rarity * 10;
        player.attack += attackBonus;
        log(`装备主手 "${weapon.name}" (${weapon.rarity}★, LAI=${weapon.lai})，攻击力提升 ${attackBonus}，当前攻击力: ${player.attack}`);
        gameElements.playerAttack.classList.add('blink');
        gameElements.mainHandSlot.classList.add('glow');
    } else if (slot === 'offHand') {
        const defenseBonus = weapon.baseStat || weapon.rarity * 5;
        player.defense += defenseBonus;
        log(`装备副手 "${weapon.name}" (${weapon.rarity}★)，防御力提升 ${defenseBonus}，当前防御力: ${player.defense}`);
        gameElements.playerDefense.classList.add('blink');
        gameElements.offHandSlot.classList.add('glow');
    } else if (slot === 'accessory') {
        const hpBonus = weapon.baseStat || weapon.rarity * 20;
        player.maxHp += hpBonus;
        player.hp += hpBonus;
        log(`装备饰品 "${weapon.name}" (${weapon.rarity}★)，生命值上限提升 ${hpBonus}，当前生命值: ${player.hp}/${player.maxHp}`);
        gameElements.playerMaxHp.classList.add('blink');
        gameElements.playerHp.classList.add('blink');
        gameElements.accessorySlot.classList.add('glow');
    }

    player.inventory.splice(index, 1);
    updateInventoryUI(); // 依赖inventory.js
    updateGameUI(); // 依赖rpgCore.js
    updateEnhancePanel(); // 依赖enhance.js
}

// 卸下装备
function unequipWeapon(slot) {
    const weapon = player.equipment[slot];
    if (!weapon) return;

    if (player.inventory.length >= player.inventoryCapacity) {
        const confirmDiscard = confirm(`背包已满，是否丢弃${slot === 'mainHand' ? '主手' : slot === 'offHand' ? '副手' : '饰品'}装备 "${weapon.name}"？`);
        if (!confirmDiscard) {
            log(`取消卸下 "${weapon.name}"，背包已满且未选择丢弃`);
            return;
        }
        log(`背包已满，丢弃了${slot === 'mainHand' ? '主手' : slot === 'offHand' ? '副手' : '饰品'}装备 "${weapon.name}"`);
    } else {
        player.inventory.push(weapon);
        log(`${slot === 'mainHand' ? '主手' : slot === 'offHand' ? '副手' : '饰品'}装备 "${weapon.name}" 已返回背包`);
    }

    if (slot === 'mainHand') {
        const attackBonus = weapon.baseStat || weapon.rarity * 10;
        player.attack -= attackBonus;
        log(`卸下主手装备 "${weapon.name}"，攻击力减少 ${attackBonus}，当前攻击力: ${player.attack}`);
        gameElements.playerAttack.classList.add('blink');
        gameElements.mainHandSlot.classList.add('glow');
    } else if (slot === 'offHand') {
        const defenseBonus = weapon.baseStat || weapon.rarity * 5;
        player.defense -= defenseBonus;
        log(`卸下副手装备 "${weapon.name}"，防御力减少 ${defenseBonus}，当前防御力: ${player.defense}`);
        gameElements.playerDefense.classList.add('blink');
        gameElements.offHandSlot.classList.add('glow');
    } else if (slot === 'accessory') {
        const hpBonus = weapon.baseStat || weapon.rarity * 20;
        player.maxHp -= hpBonus;
        player.hp = Math.min(player.hp, player.maxHp);
        log(`卸下饰品 "${weapon.name}"，生命值上限减少 ${hpBonus}，当前生命值: ${player.hp}/${player.maxHp}`);
        gameElements.playerMaxHp.classList.add('blink');
        gameElements.playerHp.classList.add('blink');
        gameElements.accessorySlot.classList.add('glow');
    }

    player.equipment[slot] = null;
    updateInventoryUI(); // 依赖inventory.js
    updateGameUI(); // 依赖rpgCore.js
    updateEnhancePanel(); // 依赖enhance.js
}