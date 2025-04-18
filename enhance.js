function updateEnhancePanel() {
    const select = gameElements.enhanceWeaponSelect;
    select.innerHTML = '<option value="-1">选择武器</option>';
    
    player.inventory.concat(
        player.equipment.mainHand ? [player.equipment.mainHand] : [],
        player.equipment.offHand ? [player.equipment.offHand] : [],
        player.equipment.accessory ? [player.equipment.accessory] : []
    ).forEach((weapon, index) => {
        const option = document.createElement('option');
        option.value = index;
        const location = 
            weapon === player.equipment.mainHand ? ' (主手)' :
            weapon === player.equipment.offHand ? ' (副手)' :
            weapon === player.equipment.accessory ? ' (饰品)' : ' (背包)';
        option.textContent = `${weapon.name} (${weapon.rarity}★, LAI=${weapon.lai}${weapon.enhanceLevel ? ', +' + weapon.enhanceLevel : ''})${location}`;
        select.appendChild(option);
    });

    updateEnhanceInfo(-1);
}

function updateEnhanceInfo(index) {
    const info = gameElements.enhanceInfo;
    if (index < 0 || index >= player.inventory.length + (player.equipment.mainHand ? 1 : 0) + (player.equipment.offHand ? 1 : 0) + (player.equipment.accessory ? 1 : 0)) {
        info.innerHTML = `
            <p>武器信息: 未选择</p>
            <p>强化等级: -</p>
            <p>强化费用: -</p>
            <p>成功率: -</p>
        `;
        gameElements.enhanceConfirmButton.disabled = true;
        return;
    }

    const allWeapons = player.inventory.concat(
        player.equipment.mainHand ? [player.equipment.mainHand] : [],
        player.equipment.offHand ? [player.equipment.offHand] : [],
        player.equipment.accessory ? [player.equipment.accessory] : []
    );
    const weapon = allWeapons[index];
    const enhanceLevel = weapon.enhanceLevel || 0;
    const cost = (enhanceLevel + 1) * 100;
    const successRate = Math.max(10, 100 - enhanceLevel * 10);

    info.innerHTML = `
        <p>武器信息: ${weapon.name} (${weapon.rarity}★, LAI=${weapon.lai}${weapon.enhanceLevel ? ', +' + weapon.enhanceLevel : ''})</p>
        <p>强化等级: ${enhanceLevel}</p>
        <p>强化费用: ${cost} 金币</p>
        <p>成功率: ${successRate}%</p>
    `;
    gameElements.enhanceConfirmButton.disabled = player.gold < cost;
}

function enhanceWeapon(index) {
    const allWeapons = player.inventory.concat(
        player.equipment.mainHand ? [player.equipment.mainHand] : [],
        player.equipment.offHand ? [player.equipment.offHand] : [],
        player.equipment.accessory ? [player.equipment.accessory] : []
    );
    const weapon = allWeapons[index];
    if (!weapon) return;

    const enhanceLevel = weapon.enhanceLevel || 0;
    const cost = (enhanceLevel + 1) * 100;
    const successRate = Math.max(10, 100 - enhanceLevel * 10);

    if (player.gold < cost) {
        showToast('金币不足，无法强化！');
        return;
    }

    player.gold -= cost;
    if (Math.random() * 100 < successRate) {
        weapon.enhanceLevel = enhanceLevel + 1;
        if (weapon === player.equipment.mainHand) {
            const attackBonus = 5;
            player.attack += attackBonus;
            log(`强化成功！${weapon.name}提升到+${weapon.enhanceLevel}，攻击力+${attackBonus}`);
            gameElements.playerAttack.classList.add('blink');
        }
        showToast(`强化成功！${weapon.name} +${weapon.enhanceLevel}`);
    } else {
        showToast(`强化失败！${weapon.name}保持+${enhanceLevel}`);
        log(`强化失败，${weapon.name}保持+${enhanceLevel}`);
    }

    updateEnhancePanel();
    updateGameUI(); // 依赖rpgCore.js
}

function showToast(message) {
    gameElements.toast.textContent = message;
    gameElements.toast.classList.add('active');
    setTimeout(() => {
        gameElements.toast.classList.remove('active');
    }, 3000);
}

function initEnhance() {
    gameElements.openEnhanceButton.addEventListener('click', () => {
        gameElements.enhancePanel.classList.add('active');
        updateEnhancePanel();
    });

    gameElements.enhanceCloseButton.addEventListener('click', () => {
        gameElements.enhancePanel.classList.remove('active');
    });

    gameElements.enhanceWeaponSelect.addEventListener('change', (e) => {
        updateEnhanceInfo(parseInt(e.target.value));
    });

    gameElements.enhanceConfirmButton.addEventListener('click', () => {
        const index = parseInt(gameElements.enhanceWeaponSelect.value);
        if (index >= 0) {
            enhanceWeapon(index);
        }
    });

    updateEnhancePanel();
}