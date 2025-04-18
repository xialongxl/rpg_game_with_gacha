const ENHANCE_CONFIG = {
    maxLevel: 10, // 最大强化等级
    baseCost: 50, // 基础强化费用
    costMultiplier: 20, // 每稀有度和每级的费用倍率
    baseSuccessRate: 0.95, // 基础成功率
    decreaseRate: 0.05, // 每级成功率降低幅度
    minSuccessRate: 0.3, // 最低成功率
    failurePenaltyChance: 0.2, // 失败时降低一级的概率
    bonuses: {
        mainHand: { stat: 'attack', value: 5 }, // 主手每级攻击力加成
        offHand: { stat: 'defense', value: 3 }, // 副手每级防御力加成
        accessory: { stat: 'maxHp', value: 10 } // 饰品每级最大生命值加成
    }
};

function enhanceWeapon(index) {
    // 验证输入
    if (index < 0 || index >= player.inventory.length) {
        log('错误：无效的武器索引！');
        return;
    }

    const weapon = player.inventory[index];
    if (!weapon) {
        log('错误：未找到武器！');
        return;
    }

    // 初始化强化等级
    if (!weapon.hasOwnProperty('enhanceLevel')) {
        weapon.enhanceLevel = 0;
        weapon.baseStat = getBaseStat(weapon); // 存储基础属性
    }

    // 检查最大等级
    if (weapon.enhanceLevel >= ENHANCE_CONFIG.maxLevel) {
        log(`武器 "${weapon.name}" 已达最高强化等级 ${ENHANCE_CONFIG.maxLevel}，无法继续强化！`);
        return;
    }

    // 计算费用
    const cost = ENHANCE_CONFIG.baseCost + weapon.rarity * ENHANCE_CONFIG.costMultiplier * (weapon.enhanceLevel + 1);
    if (player.gold < cost) {
        log(`金币不足！强化 "${weapon.name}" 需要 ${cost} 金币，当前金币：${player.gold}`);
        return;
    }

    // 计算成功率
    const successRate = Math.max(
        ENHANCE_CONFIG.minSuccessRate,
        ENHANCE_CONFIG.baseSuccessRate * Math.pow(1 - ENHANCE_CONFIG.decreaseRate, weapon.enhanceLevel)
    );

    // 扣除金币
    player.gold -= cost;

    // 确定武器槽位类型
    const slotType = ['单手剑', '双手剑', '法杖', '弓', '魔法书', '匕首'].includes(weapon.type)
        ? 'mainHand'
        : ['盾牌', '匕首'].includes(weapon.type)
        ? 'offHand'
        : 'accessory';
    const bonus = ENHANCE_CONFIG.bonuses[slotType];

    if (Math.random() < successRate) {
        // 强化成功
        weapon.enhanceLevel++;
        const statIncrease = bonus.value * weapon.rarity;
        weapon.baseStat += statIncrease;

        // 更新武器名称
        const nameSuffix = weapon.enhanceLevel > 0 ? ` +${weapon.enhanceLevel}` : '';
        weapon.name = weapon.name.replace(/\s\+\d*$/, '') + nameSuffix;

        log(`强化成功！"${weapon.name}" 提升至 +${weapon.enhanceLevel}，${bonus.stat === 'maxHp' ? '生命值上限' : bonus.stat === 'attack' ? '攻击力' : '防御力'} +${statIncrease}，花费 ${cost} 金币`);
        
        // 更新装备中的武器属性
        updateEquippedWeaponStats(weapon, slotType, statIncrease);

        // 触发视觉效果
        if (bonus.stat === 'attack') {
            gameElements.playerAttack.classList.add('blink');
        } else if (bonus.stat === 'defense') {
            gameElements.playerDefense.classList.add('blink');
        } else if (bonus.stat === 'maxHp') {
            gameElements.playerMaxHp.classList.add('blink');
            gameElements.playerHp.classList.add('blink');
        }
    } else {
        // 强化失败
        if (weapon.enhanceLevel > 0 && Math.random() < ENHANCE_CONFIG.failurePenaltyChance) {
            weapon.enhanceLevel--;
            const statDecrease = bonus.value * weapon.rarity;
            weapon.baseStat -= statDecrease;

            // 更新武器名称
            const nameSuffix = weapon.enhanceLevel > 0 ? ` +${weapon.enhanceLevel}` : '';
            weapon.name = weapon.name.replace(/\s\+\d*$/, '') + nameSuffix;

            log(`强化失败！"${weapon.name}" 降至 +${weapon.enhanceLevel}，${bonus.stat === 'maxHp' ? '生命值上限' : bonus.stat === 'attack' ? '攻击力' : '防御力'} -${statDecrease}，花费 ${cost} 金币`);

            // 更新装备中的武器属性
            updateEquippedWeaponStats(weapon, slotType, -statDecrease);
        } else {
            log(`强化失败！"${weapon.name}" 未受损，花费 ${cost} 金币`);
        }

        // 触发失败的视觉效果
        if (bonus.stat === 'attack') {
            gameElements.playerAttack.classList.add('blink');
        } else if (bonus.stat === 'defense') {
            gameElements.playerDefense.classList.add('blink');
        } else if (bonus.stat === 'maxHp') {
            gameElements.playerMaxHp.classList.add('blink');
            gameElements.playerHp.classList.add('blink');
        }
    }

    updateInventoryUI();
    updateGameUI();
}

function getBaseStat(weapon) {
    if (['单手剑', '双手剑', '法杖', '弓', '魔法书', '匕首'].includes(weapon.type)) {
        return weapon.rarity * 10; // 主手基础攻击力
    } else if (['盾牌', '匕首'].includes(weapon.type)) {
        return weapon.rarity * 5; // 副手基础防御力
    } else {
        return weapon.rarity * 20; // 饰品基础最大生命值
    }
}

function updateEquippedWeaponStats(weapon, slotType, statChange) {
    if (player.equipment.mainHand === weapon && slotType === 'mainHand') {
        player.attack += statChange;
        if (statChange > 0) {
            log(`主手装备 "${weapon.name}" 强化生效，攻击力 +${statChange}`);
        } else {
            log(`主手装备 "${weapon.name}" 强化失败，攻击力 -${-statChange}`);
        }
    } else if (player.equipment.offHand === weapon && slotType === 'offHand') {
        player.defense += statChange;
        if (statChange > 0) {
            log(`副手装备 "${weapon.name}" 强化生效，防御力 +${statChange}`);
        } else {
            log(`副手装备 "${weapon.name}" 强化失败，防御力 -${-statChange}`);
        }
    } else if (player.equipment.accessory === weapon && slotType === 'accessory') {
        player.maxHp += statChange;
        if (statChange > 0) {
            player.hp += statChange;
            log(`饰品 "${weapon.name}" 强化生效，生命值上限 +${statChange}，当前生命值：${player.hp}/${player.maxHp}`);
        } else {
            player.hp = Math.min(player.hp, player.maxHp);
            log(`饰品 "${weapon.name}" 强化失败，生命值上限 -${-statChange}，当前生命值：${player.hp}/${player.maxHp}`);
        }
    }
}