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
        showToast('金币不足，无法强化！');
        return;
    }

    const successRate = Math.max(
        minSuccessRate,
        baseSuccessRate * Math.pow(1 - decreaseRate, enhanceLevel)
    );

    player.gold -= cost;
    if (Math.random() < successRate) {
        weapon.enhanceLevel = enhanceLevel + 1;
        weapon.originalName = weapon.originalName || weapon.name; // 保存原始名称
        weapon.name = weapon.enhanceLevel > 0 ? `${weapon.originalName}+${weapon.enhanceLevel}` : weapon.originalName;
        const attackBonus = Math.floor(weapon.rarity * (enhanceLevel + 1));
        weapon.baseStat = (weapon.baseStat || weapon.rarity * 10) + attackBonus;
        log(`强化成功！${weapon.name} 提升到 +${weapon.enhanceLevel}，攻击力增加 ${attackBonus}`);
        console.log(`Enhanced weapon: ${weapon.name}, level: ${weapon.enhanceLevel}`); // 调试日志
    } else {
        log(`强化失败！${weapon.name} 保持在 +${enhanceLevel}`);
    }

    updateGameUI(); // 依赖rpgCore.js
    updateInventoryUI(); // 依赖inventory.js
    updateEquipmentUI(); // 依赖equipment.js
}

// 更新强化面板UI
function updateEnhancePanel() {
    const select = gameElements.enhanceWeaponSelect;
    select.innerHTML = '<option value="-1">选择武器</option>';
    player.inventory.forEach((weapon, index) => {
        const displayName = (weapon.enhanceLevel || 0) > 0 ? `${weapon.originalName || weapon.name}+${weapon.enhanceLevel}` : weapon.originalName || weapon.name;
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${displayName} (${weapon.type}, ${weapon.rarity}★, LAI=${weapon.lai})`;
        select.appendChild(option);
    });
    updateEnhanceInfo(-1);
}

// 更新强化信息显示
function updateEnhanceInfo(index) {
    const infoDiv = gameElements.enhanceInfo;
    if (index < 0 || index >= player.inventory.length) {
        infoDiv.innerHTML = `
            <p>武器信息: 未选择</p>
            <p>强化等级: -</p>
            <p>LAI: -</p>
            <p>强化费用: -</p>
            <p>成功率: -</p>
            <p>强化效果: -</p>
        `;
        return;
    }

    const weapon = player.inventory[index];
    const enhanceLevel = weapon.enhanceLevel || 0;
    const maxLevel = 10;
    const baseCost = 50;
    const costMultiplier = 20;
    const baseSuccessRate = 0.95;
    const decreaseRate = 0.05;
    const minSuccessRate = 0.3;

    const displayName = enhanceLevel > 0 ? `${weapon.originalName || weapon.name} +${enhanceLevel}` : weapon.originalName || weapon.name;

    if (enhanceLevel >= maxLevel) {
        infoDiv.innerHTML = `
            <p>武器信息: ${displayName} (${weapon.type}, ${weapon.rarity}★)</p>
            <p>强化等级: ${enhanceLevel}（已达最大等级）</p>
            <p>LAI: ${weapon.lai}</p>
            <p>强化费用: -</p>
            <p>成功率: -</p>
            <p>强化效果: -</p>
        `;
        return;
    }

    const cost = baseCost + weapon.rarity * costMultiplier * (enhanceLevel + 1);
    const successRate = Math.max(
        minSuccessRate,
        baseSuccessRate * Math.pow(1 - decreaseRate, enhanceLevel)
    );
    const successRatePercent = (successRate * 100).toFixed(1);
    const attackBonus = Math.floor(weapon.rarity * (enhanceLevel + 1));

    infoDiv.innerHTML = `
        <p>武器信息: ${displayName} (${weapon.type}, ${weapon.rarity}★)</p>
        <p>强化等级: ${enhanceLevel}</p>
        <p>LAI: ${weapon.lai}</p>
        <p>强化费用: ${cost} 金币</p>
        <p>成功率: ${successRatePercent}%</p>
        <p>强化效果: 攻击力 +${attackBonus}</p>
    `;
}

// 显示提示框
function showToast(message) {
    const toast = gameElements.toast;
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// 初始化强化系统
function initEnhance() {
    gameElements.openEnhanceButton.addEventListener('click', () => {
        if (player.inventory.length === 0) {
            showToast('背包中没有武器可强化！');
            return;
        }
        gameElements.enhancePanel.classList.add('active');
        updateEnhancePanel();
    });

    gameElements.enhanceCloseButton.addEventListener('click', () => {
        gameElements.enhancePanel.classList.remove('active');
    });

    gameElements.enhanceWeaponSelect.addEventListener('change', (e) => {
        const index = parseInt(e.target.value);
        updateEnhanceInfo(index);
    });

    gameElements.enhanceConfirmButton.addEventListener('click', () => {
        const index = parseInt(gameElements.enhanceWeaponSelect.value);
        if (index < 0 || index >= player.inventory.length) {
            showToast('请先选择一件武器！');
            return;
        }

        const weapon = player.inventory[index];
        const enhanceLevel = weapon.enhanceLevel || 0;
        const maxLevel = 10;
        const baseCost = 50;
        const costMultiplier = 20;

        if (enhanceLevel >= maxLevel) {
            showToast('武器已达最大强化等级！');
            return;
        }

        const cost = baseCost + weapon.rarity * costMultiplier * (enhanceLevel + 1);
        if (player.gold < cost) {
            showToast('金币不足，无法强化！');
            return;
        }

        enhanceWeapon(index);
        updateEnhancePanel();
        updateEnhanceInfo(index);
    });

    updateEnhancePanel();
}