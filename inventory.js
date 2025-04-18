// 添加武器到背包
function addToInventory(weapon) {
    if (player.inventory.length >= player.inventoryCapacity) {
        log('背包已满！请出售或丢弃武器以腾出空间');
        displayWeapon(weapon); // 依赖gacha.js
        return;
    }
    player.inventory.push(weapon);
    log(`获得武器 "${weapon.name}" (${weapon.rarity}★)，已存入背包`);
    updateInventoryUI();
    updateGameUI(); // 依赖rpgCore.js
}

// 更新背包UI
function updateInventoryUI() {
    gameElements.inventoryList.innerHTML = '';
    player.inventory.forEach((weapon, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        const canEquipMainHand = ['单手剑', '双手剑', '法杖', '弓', '魔法书', '匕首'].includes(weapon.type);
        const canEquipOffHand = ['盾牌', '匕首'].includes(weapon.type);
        itemDiv.innerHTML = `
            <div class="inventory-item-info">${weapon.name} (${weapon.type}, ${weapon.rarity}★)</div>
            <div class="inventory-item-actions">
                ${canEquipMainHand ? `<button class="action-button equip-main-hand-button" data-index="${index}" data-slot="mainHand">装备主手</button>` : ''}
                ${canEquipOffHand ? `<button class="action-button equip-off-hand-button" data-index="${index}" data-slot="offHand">装备副手</button>` : ''}
                <button class="action-button equip-accessory-button" data-index="${index}" data-slot="accessory">装备饰品</button>
                <button class="action-button sell-button" data-index="${index}">出售 (${weapon.rarity * 20}金币)</button>
            </div>
        `;
        gameElements.inventoryList.appendChild(itemDiv);
    });

    document.querySelectorAll('.equip-main-hand-button, .equip-off-hand-button, .equip-accessory-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            const slot = e.target.getAttribute('data-slot');
            equipWeapon(index, slot); // 依赖equipment.js
        });
    });

    document.querySelectorAll('.sell-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            sellWeapon(index);
        });
    });
}

// 出售武器
function sellWeapon(index) {
    const weapon = player.inventory[index];
    if (!weapon) return;
    const sellPrice = weapon.rarity * 20;
    player.gold += sellPrice;
    log(`出售武器 "${weapon.name}" (${weapon.rarity}★)，获得 ${sellPrice} 金币`);
    player.inventory.splice(index, 1);
    updateInventoryUI();
    updateGameUI(); // 依赖rpgCore.js
    updateEnhancePanel(); // 依赖enhance.js
}