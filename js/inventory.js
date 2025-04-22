function addToInventory(weapon) {
    if (player.inventory.length >= player.inventoryCapacity) {
        const confirmDiscard = confirm(`背包已满（${player.inventory.length}/${player.inventoryCapacity}）！是否丢弃一件武器以存入 "${weapon.name}" (${weapon.rarity}★)？`);
        if (!confirmDiscard) {
            log(`取消存入 "${weapon.name}"，背包已满`);
            displayWeapon(weapon);
            return;
        }
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
    log(`获得武器 "${weapon.name}" (${weapon.rarity}★, LAI=${weapon.lai}, ${weapon.type === '盾牌' ? '防御力' : '攻击力'}=${weapon.type === '盾牌' ? weapon.defense : weapon.attack})，已存入背包`);
    updateInventoryUI();
    updateGameUI();
}

function updateInventoryUI() {
    console.log('Updating inventory UI:', player.inventory);
    gameElements.inventoryList.innerHTML = '';
    
    player.inventory.forEach((weapon, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        
        // 根据稀有度添加类名
        itemDiv.classList.add(`rarity-${weapon.rarity}`);
        
        const canEquipMainHand = ['单手剑', '双手剑', '匕首', '法杖', '弓', '魔法书'].includes(weapon.type);
        const canEquipOffHand = ['盾牌','魔法书'].includes(weapon.type);
        
        const statDisplay = weapon.type === '盾牌' ? 
            `防御力: ${weapon.defense}<br>` : 
            `攻击力: ${weapon.attack}<br>`;
        
        // 添加武器图片
        const weaponImg = weaponImages[weapon.type] || '';
        
        itemDiv.innerHTML = `
            <img src="${weaponImg}" class="inventory-item-image" alt="${weapon.type}">
            <div class="inventory-item-details">
                <div class="inventory-item-name">${weapon.name}</div>
                <div class="inventory-item-type">类型: ${weapon.type}</div>
                <div class="inventory-item-stats">
                    ${statDisplay}
                    LAI: ${weapon.lai}<br>
                    稀有度: ${'★'.repeat(weapon.rarity)}
                </div>
                <div class="inventory-item-actions">
                    ${canEquipMainHand ? `<button class="action-button equip-button" data-index="${index}" data-slot="mainHand">装备主手</button>` : ''}
                    ${canEquipOffHand ? `<button class="action-button equip-button" data-index="${index}" data-slot="offHand">装备副手</button>` : ''}
                    <button class="action-button sell-button" data-index="${index}">出售 (${weapon.rarity * 20}金币)</button>
                </div>
            </div>
        `;
        
        gameElements.inventoryList.appendChild(itemDiv);
    });

    // 绑定事件（保持原有逻辑不变）
    document.querySelectorAll('.equip-button').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const slot = this.getAttribute('data-slot');
            equipWeapon(index, slot);
        });
    });

    document.querySelectorAll('.sell-button').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            sellWeapon(index);
        });
    });

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
    updateGameUI();
}

function initInventory() {
    // 初始化背包相关事件监听
    document.querySelectorAll('.inventory-item button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.classList.contains('equip-main-hand-button')) {
                handleEquip(e);
            } else if (e.target.classList.contains('sell-button')) {
                handleSell(e);
            }
        });
    });
    console.log('Inventory system initialized');
}