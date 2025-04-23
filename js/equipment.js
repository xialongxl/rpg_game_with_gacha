// equipment.js - 完整版本（含双手剑限制）
function updateEquipmentUI() {
    console.log('更新装备UI:', player.equipment);
    
    // 主手装备
    if (player.equipment.mainHand) {
        const weapon = player.equipment.mainHand;
        const isTwoHanded = weapon.type === '双手剑';
        
        gameElements.mainHandSlot.innerHTML = `
            <div class="equipment-slot-info ${isTwoHanded ? 'two-handed' : ''}">
                <img src="${weaponImages[weapon.type]}" class="equipment-slot-icon" data-type="${weapon.type}">
                ${weapon.name} (${weapon.rarity}★)<br>
                类型: ${weapon.type}<br>
                直线攻击距离: ${weapon.lai}<br>
                攻击力: ${weapon.attack}<br>
                ${weapon.enhanceLevel ? `强化等级: +${weapon.enhanceLevel}<br>` : ''}
                <button class="action-button unequip-button" data-slot="mainHand">卸下</button>
            </div>
        `;
    } else {
        gameElements.mainHandSlot.innerHTML = `
            <div class="equipment-slot-info">
                主手: 无装备 (基础LAI=1)
            </div>
        `;
    }

    // 副手装备（双手剑时显示禁用状态）
    if (player.equipment.mainHand?.type === '双手剑') {
        gameElements.offHandSlot.innerHTML = `
            <div class="equipment-slot-info disabled-slot">
                (双手剑装备中，副手禁用)
            </div>
        `;
    } else if (player.equipment.offHand) {
        const weapon = player.equipment.offHand;
        const statValue = weapon.type === '盾牌' ? weapon.defense : weapon.attack;
        const statName = weapon.type === '盾牌' ? '防御力' : '攻击力';
        
        gameElements.offHandSlot.innerHTML = `
            <div class="equipment-slot-info">
                <img src="${weaponImages[weapon.type]}" class="equipment-slot-icon">
                ${weapon.name} (${weapon.rarity}★)<br>
                类型: ${weapon.type}<br>
                ${statName}: ${statValue}<br>
                ${weapon.enhanceLevel ? `强化等级: +${weapon.enhanceLevel}<br>` : ''}
                <button class="action-button unequip-button" data-slot="offHand">卸下</button>
            </div>
        `;
    } else {
        gameElements.offHandSlot.innerHTML = `
            <div class="equipment-slot-info">
                副手: 无装备
            </div>
        `;
    }

    // 饰品装备
    if (player.equipment.accessory) {
        const weapon = player.equipment.accessory;
        const hpBonus = weapon.attack || weapon.rarity * 20;
        
        gameElements.accessorySlot.innerHTML = `
            <div class="equipment-slot-info">
                <img src="${weaponImages[weapon.type]}" class="equipment-slot-icon">
                ${weapon.name} (${weapon.rarity}★)<br>
                类型: ${weapon.type}<br>
                生命加成: +${hpBonus}<br>
                ${weapon.enhanceLevel ? `强化等级: +${weapon.enhanceLevel}<br>` : ''}
                <button class="action-button unequip-button" data-slot="accessory">卸下</button>
            </div>
        `;
    } else {
        gameElements.accessorySlot.innerHTML = `
            <div class="equipment-slot-info">
                饰品: 无装备
            </div>
        `;
    }

    // 绑定卸下按钮事件
    document.querySelectorAll('.unequip-button').forEach(button => {
        button.addEventListener('click', function() {
            const slot = this.getAttribute('data-slot');
            unequipWeapon(slot);
        });
    });
}

function equipWeapon(index, slot) {
    if (index < 0 || index >= player.inventory.length) {
        console.error('无效的装备索引:', index);
        return false;
    }

    const weapon = JSON.parse(JSON.stringify(player.inventory[index]));
    
    // 双手剑特殊规则
    if (weapon.type === '双手剑') {
        if (slot === 'offHand') {
            showToast('双手剑只能装备在主手');
            return false;
        }
        if (player.equipment.offHand) {
            if (!confirm('装备双手剑将自动卸下副手装备，继续吗？')) return false;
            unequipWeapon('offHand');
        }
    }
    
    // 盾牌特殊规则
    if (weapon.type === '盾牌' && player.equipment.mainHand?.type === '双手剑') {
        showToast('装备双手剑时不能使用盾牌');
        return false;
    }

    // 处理已装备的物品
    const oldWeapon = player.equipment[slot];
    if (oldWeapon) {
        if (player.inventory.length >= player.inventoryCapacity) {
            if (!confirm(`背包已满，是否丢弃当前${getSlotName(slot)}装备 "${oldWeapon.name}"？`)) return false;
            log(`丢弃了 ${oldWeapon.name}`);
        } else {
            player.inventory.push(oldWeapon);
            log(`卸下 ${oldWeapon.name} 到背包`);
        }
        removeEquipmentStats(oldWeapon, slot);
    }

    // 装备新物品
    player.equipment[slot] = weapon;
    player.inventory.splice(index, 1);
    applyEquipmentStats(weapon, slot);

    log(`装备 ${weapon.name} 到${getSlotName(slot)}`);
    updateAllUI();
    return true;

    function getSlotName(slot) {
        return { mainHand: '主手', offHand: '副手', accessory: '饰品' }[slot] || slot;
    }
}

function unequipWeapon(slot) {
    const weapon = player.equipment[slot];
    if (!weapon) return;

    if (player.inventory.length >= player.inventoryCapacity) {
        if (!confirm(`背包已满，是否丢弃 "${weapon.name}"？`)) return;
        log(`丢弃了 ${weapon.name}`);
    } else {
        player.inventory.push(weapon);
        log(`卸下 ${weapon.name} 到背包`);
    }

    removeEquipmentStats(weapon, slot);
    player.equipment[slot] = null;
    updateAllUI();
}

function applyEquipmentStats(weapon, slot) {
    if (slot === 'mainHand') {
        player.attack += weapon.attack;
        player.lai = weapon.lai;
    } else if (slot === 'offHand') {
        if (weapon.type === '盾牌') {
            player.defense += weapon.defense;
        } else {
            player.attack += weapon.attack;
        }
    } else if (slot === 'accessory') {
        player.maxHp += weapon.attack || weapon.rarity * 20;
        player.hp = Math.min(player.hp, player.maxHp);
    }
}

function removeEquipmentStats(weapon, slot) {
    if (slot === 'mainHand') {
        player.attack -= weapon.attack;
        player.lai = 1; // 重置为基础值
    } else if (slot === 'offHand') {
        if (weapon.type === '盾牌') {
            player.defense -= weapon.defense;
        } else {
            player.attack -= weapon.attack;
        }
    } else if (slot === 'accessory') {
        const hpLoss = weapon.attack || weapon.rarity * 20;
        player.maxHp -= hpLoss;
        player.hp = Math.min(player.hp, player.maxHp);
    }
}

function updateAllUI() {
    updateEquipmentUI();
    updateInventoryUI();
    updateGameUI();
    if (typeof updateEnhancePanel === 'function') updateEnhancePanel();
}

function initEquipment() {
    console.log('正在初始化装备系统...');
    
    // 初始化装备槽事件
    gameElements.mainHandSlot.addEventListener('dblclick', () => unequipWeapon('mainHand'));
    gameElements.offHandSlot.addEventListener('dblclick', () => unequipWeapon('offHand'));
    gameElements.accessorySlot.addEventListener('dblclick', () => unequipWeapon('accessory'));

    // 加载保存的装备数据
    if (localStorage.getItem('equipment')) {
        try {
            player.equipment = JSON.parse(localStorage.getItem('equipment'));
            log('已加载装备数据');
        } catch (e) {
            console.error('装备数据加载失败:', e);
        }
    }

    // 初始属性计算
    Object.keys(player.equipment).forEach(slot => {
        if (player.equipment[slot]) {
            applyEquipmentStats(player.equipment[slot], slot);
        }
    });

    updateEquipmentUI();
    console.log('装备系统初始化完成');
}

// 自动初始化（当DOM加载完成时）
if (document.readyState === 'complete') {
    setTimeout(initEquipment, 100);
} else {
    document.addEventListener('DOMContentLoaded', initEquipment);
}