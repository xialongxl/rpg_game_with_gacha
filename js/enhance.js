function enhanceWeapon(index) {
    const weapon = player.inventory[index];
    if (!weapon) {
        console.error('Invalid weapon index:', index);
        return;
    }

    const enhanceLevel = weapon.enhanceLevel || 0;
    const maxLevel = 10;
    const baseCost = 50;
    const costMultiplier = 20;
    const baseSuccessRate = 0.95;
    const decreaseRate = 0.05;
    const minSuccessRate = 0.3;

    if (enhanceLevel >= maxLevel) {
        showToast('武器已达最大强化等级！');
        return;
    }

    const cost = baseCost + weapon.rarity * costMultiplier * (enhanceLevel + 1);
    if (player.gold < cost) {
        showToast(`金币不足，无法强化！当前金币：${player.gold}`);
        return;
    }

    const successRate = Math.max(
        minSuccessRate,
        baseSuccessRate * Math.pow(1 - decreaseRate, enhanceLevel)
    );

    player.gold -= cost;
    const panel = gameElements.enhancePanel;
    
    if (Math.random() < successRate) {
        // 强化成功
        weapon.enhanceLevel = enhanceLevel + 1;
        weapon.originalName = weapon.originalName || weapon.name;
        weapon.name = `${weapon.originalName} +${weapon.enhanceLevel}`;
        const bonus = Math.floor(weapon.rarity * (enhanceLevel + 1));
        
        if (weapon.type === '盾牌') {
            weapon.defense = (weapon.defense || weapon.rarity * 5) + bonus;
            log(`强化成功！${weapon.name} 提升到 +${weapon.enhanceLevel}，防御力增加 ${bonus}，当前防御力: ${weapon.defense}`);
            showToast(`强化成功！${weapon.name} 提升到 +${weapon.enhanceLevel}，防御力增加 ${bonus}，当前防御力: ${weapon.defense}`);
        } else {
            weapon.attack = (weapon.attack || weapon.rarity * 10) + bonus;
            log(`强化成功！${weapon.name} 提升到 +${weapon.enhanceLevel}，攻击力增加 ${bonus}，当前攻击力: ${weapon.attack}`);
            showToast(`强化成功！${weapon.name} 提升到 +${weapon.enhanceLevel}，攻击力增加 ${bonus}，当前攻击力: ${weapon.attack}`);
        }
        
        // 添加成功特效
        panel.classList.add('enhance-success');
        setTimeout(() => panel.classList.remove('enhance-success'), 500);
    } else {
        // 强化失败
        log(`强化失败！${weapon.name} 保持在 +${enhanceLevel}`);
        showToast(`强化失败！${weapon.name} 保持在 +${enhanceLevel}`);
        
        // 添加失败特效
        panel.classList.add('enhance-fail');
        setTimeout(() => panel.classList.remove('enhance-fail'), 500);
    }

    updateGameUI();
    updateInventoryUI();
    updateEquipmentUI();
    updateEnhanceInfo(index);
}

function updateEnhancePanel() {
    const select = gameElements.enhanceWeaponSelect;
    select.innerHTML = '<option value="-1">选择武器</option>';
    
    player.inventory.forEach((weapon, index) => {
        const displayName = (weapon.enhanceLevel || 0) > 0 ? 
            `${weapon.originalName || weapon.name}+${weapon.enhanceLevel}` : 
            weapon.originalName || weapon.name;
        
        const statValue = weapon.type === '盾牌' ? weapon.defense : weapon.attack;
        const statName = weapon.type === '盾牌' ? '防御力' : '攻击力';
        
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${displayName} (${weapon.type}, ${weapon.rarity}★, ${statName}=${statValue})`;
        select.appendChild(option);
    });
    
    updateEnhanceInfo(-1);
}

function updateEnhanceInfo(index) {
    const infoDiv = gameElements.enhanceInfo;
    
    if (index < 0 || index >= player.inventory.length) {
        infoDiv.innerHTML = `
            <p>武器信息: 未选择</p>
            <p>强化等级: -</p>
            <p>强化费用: -</p>
            <p>成功率: -</p>
        `;
        return;
    }

    const weapon = player.inventory[index];
    const enhanceLevel = weapon.enhanceLevel || 0;
    const maxLevel = 12;
    const baseCost = 100;
    const costMultiplier = 18;
    const baseSuccessRate = 0.95;
    const decreaseRate = 0.04;
    const minSuccessRate = 0.1;

    const displayName = enhanceLevel > 0 ? 
        `${weapon.originalName || weapon.name} +${weapon.enhanceLevel}` : 
        weapon.originalName || weapon.name;

    if (enhanceLevel >= maxLevel) {
        infoDiv.innerHTML = `
            <p>武器信息: ${displayName} (${weapon.type}, ${weapon.rarity}★)</p>
            <p>强化等级: ${enhanceLevel}（已达最大等级）</p>
            <p>${weapon.type === '盾牌' ? '防御力' : '攻击力'}: ${weapon.type === '盾牌' ? weapon.defense : weapon.attack}</p>
        `;
        return;
    }

    const cost = baseCost + weapon.rarity * costMultiplier * (enhanceLevel + 1);
    const successRate = Math.max(
        minSuccessRate,
        baseSuccessRate * Math.pow(1 - decreaseRate, enhanceLevel)
    );
    const successRatePercent = (successRate * 100).toFixed(1);
    //const bonus = Math.floor(weapon.rarity * (enhanceLevel + 1));

    // 新版（分段加速增长）:
    const bonus = Math.floor(weapon.rarity * (enhanceLevel <= 5 ? 1 : enhanceLevel <= 10 ? 1.5 : 2) * (enhanceLevel + 1));
    const statName = weapon.type === '盾牌' ? '防御力' : '攻击力';

    infoDiv.innerHTML = `
        <p>武器信息: ${displayName} (${weapon.type}, ${weapon.rarity}★)</p>
        <p>强化等级: ${enhanceLevel}</p>
        <p>${statName}: ${weapon.type === '盾牌' ? weapon.defense : weapon.attack}</p>
        <p>强化费用: ${cost} 金币</p>
        <p>成功率: ${successRatePercent}%</p>
        <p>强化效果: ${statName} +${bonus}</p>
    `;
}

function initEnhance() {
    // 绑定打开强化面板事件
    document.getElementById('open-enhance-button').addEventListener('click', function() {
        if (player.inventory.length === 0) {
            showToast('背包中没有武器可强化！');
            return;
        }
        gameElements.enhancePanel.classList.add('show');
        updateEnhancePanel();
    });

    // 绑定关闭按钮事件
    document.getElementById('enhance-close-button').addEventListener('click', function() {
        gameElements.enhancePanel.classList.remove('show');
    });

    // 武器选择变化事件
    document.getElementById('enhance-weapon-select').addEventListener('change', function() {
        const index = parseInt(this.value);
        updateEnhanceInfo(index);
    });

    // 强化确认按钮事件
    document.getElementById('enhance-confirm-button').addEventListener('click', function() {
        const index = parseInt(document.getElementById('enhance-weapon-select').value);
        if (index < 0 || index >= player.inventory.length) {
            showToast('请先选择一件武器！');
            return;
        }
        enhanceWeapon(index);
    });

    // 初始化面板
    updateEnhancePanel();
}