const enhanceConfig = {
    baseSuccessRate: 0.8,
    decreaseRate: 0.05,
    baseCost: 50,
    costIncrease: 30
};

function calculateEnhanceStats(weapon) {
    const canEquipMainHand = ['单手剑', '双手剑', '法杖', '弓', '魔法书', '匕首'].includes(weapon.type);
    const canEquipOffHand = ['盾牌', '匕首'].includes(weapon.type);
    let attackBonus = 0, defenseBonus = 0, hpBonus = 0;
    if (canEquipMainHand) {
        attackBonus = weapon.rarity * (weapon.enhanceLevel + 1) * 2;
    }
    if (canEquipOffHand) {
        defenseBonus = weapon.rarity * (weapon.enhanceLevel + 1);
    }
    hpBonus = weapon.rarity * (weapon.enhanceLevel + 1) * 5;
    return { attackBonus, defenseBonus, hpBonus };
}

function enhanceWeapon(weapon, source, index, player, gameElements, updateInventoryUI, updateEnhanceUI, updateGameUI, updateEquippedWeaponStats, log) {
    if (!weapon) return;

    if (weapon.enhanceLevel >= weapon.maxEnhanceLevel) {
        log(`武器 "${weapon.name}" 已达到最高强化等级（+${weapon.maxEnhanceLevel}），无法继续强化！`);
        return;
    }

    const cost = enhanceConfig.baseCost + weapon.enhanceLevel * enhanceConfig.costIncrease;
    const successRate = Math.max(0.2, enhanceConfig.baseSuccessRate * Math.pow(1 - enhanceConfig.decreaseRate, weapon.enhanceLevel));
    const { attackBonus, defenseBonus, hpBonus } = calculateEnhanceStats({ ...weapon, enhanceLevel: weapon.enhanceLevel + 1 });

    let statInfo = '';
    if (attackBonus) statInfo += `攻击力+${attackBonus}`;
    if (defenseBonus) statInfo += (statInfo ? ', ' : '') + `防御力+${defenseBonus}`;
    if (hpBonus) statInfo += (statInfo ? ', ' : '') + `生命值上限+${hpBonus}`;

    const confirmEnhance = confirm(
        `强化 "${weapon.name} +${weapon.enhanceLevel}"\n` +
        `费用：${cost} 金币\n` +
        `成功率：${(successRate * 100).toFixed(1)}%\n` +
        `成功后属性提升：${statInfo}\n` +
        `失败后强化等级降低一级（最低0级）\n` +
        `是否确认强化？`
    );

    if (!confirmEnhance) {
        log(`取消强化 "${weapon.name}"`);
        return;
    }

    if (player.gold < cost) {
        log(`金币不足！强化需要 ${cost} 金币，当前金币：${player.gold}`);
        return;
    }

    player.gold -= cost;

    if (Math.random() < successRate) {
        weapon.enhanceLevel++;
        weapon.name = weapon.name.replace(/\s\+\d*$/, '') + (weapon.enhanceLevel > 0 ? ` +${weapon.enhanceLevel}` : '');
        log(`强化成功！"${weapon.name}" 强化至 +${weapon.enhanceLevel}，${statInfo}，花费 ${cost} 金币`);
        const itemDiv = source === 'inventory' ? gameElements.inventoryList.children[index] : null;
        if (itemDiv) itemDiv.classList.add('glow');
    } else {
        weapon.enhanceLevel = Math.max(0, weapon.enhanceLevel - 1);
        weapon.name = weapon.name.replace(/\s\+\d*$/, '') + (weapon.enhanceLevel > 0 ? ` +${weapon.enhanceLevel}` : '');
        log(`强化失败！"${weapon.name}" 强化等级降至 +${weapon.enhanceLevel}，花费 ${cost} 金币`);
    }

    if (player.equipment.mainHand === weapon || player.equipment.offHand === weapon || player.equipment.accessory === weapon) {
        updateEquippedWeaponStats(weapon);
    }

    updateInventoryUI();
    updateEnhanceUI();
    updateGameUI();
}

function updateEnhanceUI(player, gameElements) {
    gameElements.enhanceList.innerHTML = '';

    // 显示背包中的装备
    player.inventory.forEach((weapon, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'enhance-item';
        const enhanceText = weapon.enhanceLevel > 0 ? `+${weapon.enhanceLevel}` : '';
        itemDiv.innerHTML = `
            <div class="enhance-item-info">[背包] ${weapon.name} ${enhanceText} (${weapon.type}, ${weapon.rarity}★)</div>
            <div class="enhance-item-actions">
                <button class="action-button enhance-button" data-source="inventory" data-index="${index}">强化</button>
            </div>
        `;
        gameElements.enhanceList.appendChild(itemDiv);
    });

    // 显示装备栏中的装备
    if (player.equipment.mainHand) {
        const weapon = player.equipment.mainHand;
        const enhanceText = weapon.enhanceLevel > 0 ? `+${weapon.enhanceLevel}` : '';
        const itemDiv = document.createElement('div');
        itemDiv.className = 'enhance-item';
        itemDiv.innerHTML = `
            <div class="enhance-item-info">[主手] ${weapon.name} ${enhanceText} (${weapon.type}, ${weapon.rarity}★)</div>
            <div class="enhance-item-actions">
                <button class="action-button enhance-button" data-source="equipment" data-slot="mainHand">强化</button>
            </div>
        `;
        gameElements.enhanceList.appendChild(itemDiv);
    }

    if (player.equipment.offHand) {
        const weapon = player.equipment.offHand;
        const enhanceText = weapon.enhanceLevel > 0 ? `+${weapon.enhanceLevel}` : '';
        const itemDiv = document.createElement('div');
        itemDiv.className = 'enhance-item';
        itemDiv.innerHTML = `
            <div class="enhance-item-info">[副手] ${weapon.name} ${enhanceText} (${weapon.type}, ${weapon.rarity}★)</div>
            <div class="enhance-item-actions">
                <button class="action-button enhance-button" data-source="equipment" data-slot="offHand">强化</button>
            </div>
        `;
        gameElements.enhanceList.appendChild(itemDiv);
    }

    if (player.equipment.accessory) {
        const weapon = player.equipment.accessory;
        const enhanceText = weapon.enhanceLevel > 0 ? `+${weapon.enhanceLevel}` : '';
        const itemDiv = document.createElement('div');
        itemDiv.className = 'enhance-item';
        itemDiv.innerHTML = `
            <div class="enhance-item-info">[饰品] ${weapon.name} ${enhanceText} (${weapon.type}, ${weapon.rarity}★)</div>
            <div class="enhance-item-actions">
                <button class="action-button enhance-button" data-source="equipment" data-slot="accessory">强化</button>
            </div>
        `;
        gameElements.enhanceList.appendChild(itemDiv);
    }
}