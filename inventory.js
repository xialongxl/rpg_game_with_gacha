function addToInventory(weapon) {
    if (player.inventory.length >= player.inventoryCapacity) {
        const confirmDiscard = confirm(`背包已满（${player.inventory.length}/${player.inventoryCapacity}）！是否丢弃一件武器以存入 "${weapon.name}" (${weapon.rarity}★)？`);
        if (!confirmDiscard) {
            log(`取消存入 "${weapon.name}"，背包已满`);
            displayWeapon(weapon); // 保持卡片显示
            return;
        }
        // 提示选择要丢弃的武器
        const weaponList = player.inventory.map((w, i) => `${i + 1}. ${w.name} (${w.rarity}★)`).join('\n');
        const indexToDiscard = prompt(`请输入要丢弃的武器编号（1-${player.inventory.length}）:\n${weaponList}`);
        const index = parseInt(indexToDiscard) - 1;
        if (isNaN(index) || index < 0 || index >= player.inventory.length) {
            log(`无效的选择，取消存入 "${weapon.name}"`);
            displayWeapon(weapon);
            return;
        }
        const discardedWeapon = player.inventory[index];
        player.inventory.splice(index, 1);
        log(`丢弃了 "${discardedWeapon.name}"，存入 "${weapon.name}"`);
    }
    player.inventory.push(weapon);
    log(`获得武器 "${weapon.name}" (${weapon.rarity}★, LAI=${weapon.lai}, 攻击力=${weapon.baseStat})，已存入背包`);
    updateInventoryUI();
    updateGameUI(); // 依赖rpgCore.js
}

function updateInventoryUI() {
    console.log('Updating inventory UI:', player.inventory); // 调试日志
    gameElements.inventoryList.innerHTML = '';
    player.inventory.forEach((weapon, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        const canEquipMainHand = ['单手剑', '双手剑', '匕首', '法杖', '弓', '魔法书'].includes(weapon.type);
        const canEquipOffHand = ['盾牌', '匕首'].includes(weapon.type);
        itemDiv.innerHTML = `
            <div class="inventory-item-info">
                ${weapon.name} (${weapon.rarity}★)<br>
                类型: ${weapon.type}<br>
                LAI: ${weapon.lai}<br>
                攻击力: ${weapon.baseStat || weapon.rarity * 10}<br>
                出售价格: ${weapon.rarity * 20} 金币
            </div>
            <div class="inventory-item-actions">
                ${canEquipMainHand ? `<button class="action-button equip-main-hand-button" data-index="${index}" data-slot="mainHand">装备主手</button>` : ''}
                ${canEquipOffHand ? `<button class="action-button equip-off-hand-button" data-index="${index}" data-slot="offHand">装备副手</button>` : ''}
                <button class="action-button equip-accessory-button" data-index="${index}" data-slot="accessory">装备饰品</button>
                <button class="action-button sell-button" data-index="${index}">出售 (${weapon.rarity * 20} 金币)</button>
            </div>
        `;
        gameElements.inventoryList.appendChild(itemDiv);
    });

    // 移除旧事件，防止重复绑定
    document.querySelectorAll('.equip-main-hand-button, .equip-off-hand-button, .equip-accessory-button').forEach(button => {
        button.removeEventListener('click', handleEquip);
        button.addEventListener('click', handleEquip);
    });

    document.querySelectorAll('.sell-button').forEach(button => {
        button.removeEventListener('click', handleSell);
        button.addEventListener('click', handleSell);
    });

    function handleEquip(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const slot = e.target.getAttribute('data-slot');
        console.log(`Equipping from inventory: index=${index}, slot=${slot}`); // 调试日志
        equipWeapon(index, slot); // 依赖equipment.js
    }

    function handleSell(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        console.log(`Selling from inventory: index=${index}`); // 调试日志
        sellWeapon(index);
    }

    gameElements.inventoryCount.textContent = player.inventory.length;
}

function sellWeapon(index) {
    const weapon = player.inventory[index];
    if (!weapon) {
        console.error('Invalid sell index:', index);
        return;
    }

    const gold = weapon.rarity * 20;
    player.gold += gold;
    log(`出售 "${weapon.name}" (${weapon.rarity}★)，获得 ${gold} 金币`);
    player.inventory.splice(index, 1);
    updateInventoryUI();
    updateGameUI(); // 依赖rpgCore.js
}