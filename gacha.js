const weaponTypes = {
    "单手剑": ["之刃", "短剑", "魔剑", "光刃", "邪刃", "圣剑", "灵剑"],
    "双手剑": ["巨剑", "重剑", "斩龙剑", "破军剑", "霸者剑"],
    "法杖": ["法杖", "之杖", "魔杖", "权杖"],
    "弓": ["神弓", "长弓", "魔弓", "灵弓", "穿云弓"],
    "魔法书": ["魔导书", "圣典", "咒文书", "法典", "魔典"],
    "匕首": ["短刃", "暗刃", "影刺", "毒牙", "迅捷刃"],
    "盾牌": ["坚盾", "圣盾", "龙盾", "守护者", "壁垒"]
};

const weaponPrefixes = [
    "闪耀", "暗影", "烈焰", "寒冰", "雷霆", "圣光", "幽冥",
    "虚空", "混沌", "神圣", "龙息", "凤凰", "泰坦", "天使", "恶魔"
];

const weaponDescriptions = [
    "这把武器由远古巨龙的精血淬炼而成，",
    "传说锻造时加入了星辰碎片，",
    "曾被多位传奇英雄使用过，",
    "表面刻有失传的古代符文，",
    "在特定月相下会觉醒真正力量，",
    "锻造时封印了强大恶魔的灵魂，",
    "能吸收周围环境的元素能量，",
    "历代主人都成为了传奇，",
    "来自已经消失的精灵王国，"
];

const weaponEffects = [
    "但使用它会逐渐侵蚀使用者的神志。",
    "它的完整历史至今仍是个谜。",
    "据说能斩断时空的裂隙。",
    "在正义之人手中会发出圣洁光芒。",
    "会记录所有持有者的战斗记忆。",
    "能免疫九阶以下的魔法攻击。",
    "使用时会产生龙吟般的共鸣。"
];

const weaponImages = {
    "单手剑": "https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/broadsword.png",
    "双手剑": "https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/relic-blade.png",
    "法杖": "https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/wizard-staff.png",
    "弓": "https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/pocket-bow.png",
    "魔法书": "https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/spell-book.png",
    "匕首": "https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/bowie-knife.png",
    "盾牌": "https://raw.githubusercontent.com/xialongxl/imgbox/refs/heads/main/templar-shield.png"
};

let pityCounter = 0;
const stats = { 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0 };
const wishEffect = document.getElementById('wish-effect');

// 更新抽卡统计UI
function updateStats() {
    gameElements.pityCount.textContent = pityCounter;
    gameElements.pityProgress.style.width = `${(pityCounter / 90) * 100}%`;
    gameElements.wishCount.textContent = stats.total;
    gameElements.count7.textContent = stats[7];
    gameElements.count6.textContent = stats[6];
    gameElements.count5.textContent = stats[5];
    gameElements.count4.textContent = stats[4];
    gameElements.count3.textContent = stats[3];
    gameElements.count2.textContent = stats[2];
    gameElements.count1.textContent = stats[1];
}

// 生成单把武器
function generateWeapon() {
    let rarity;
    const rand = Math.random();
    
    if (pityCounter >= 89) {
        rarity = 7;
        pityCounter = 0;
    } else if (pityCounter >= 75 && rand < 0.002 + (pityCounter - 74) * 0.02) {
        rarity = 7;
        pityCounter = 0;
    } else if (rand < 0.002) {
        rarity = 7;
        pityCounter = 0;
    } else if (rand < 0.008) {
        rarity = 6;
        pityCounter++;
    } else if (rand < 0.028) {
        rarity = 5;
        pityCounter++;
    } else if (rand < 0.088) {
        rarity = 4;
        pityCounter++;
    } else if (rand < 0.208) {
        rarity = 3;
        pityCounter++;
    } else if (rand < 0.408) {
        rarity = 2;
        pityCounter++;
    } else {
        rarity = 1;
        pityCounter++;
    }
    
    stats[rarity]++;
    stats.total++;
    return createWeapon(rarity);
}

// 创建武器对象
function createWeapon(rarity) {
    const types = Object.keys(weaponTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    const suffixes = weaponTypes[type];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = weaponPrefixes[Math.floor(Math.random() * weaponPrefixes.length)] + suffix;
    
    let desc = "";
    const descParts = rarity >= 6 ? 4 : rarity >= 4 ? 3 : 2;
    const usedIndices = new Set();
    
    for (let i = 0; i < descParts; i++) {
        let idx;
        do { idx = Math.floor(Math.random() * weaponDescriptions.length); } 
        while (usedIndices.has(idx));
        
        usedIndices.add(idx);
        desc += weaponDescriptions[idx];
    }
    
    desc += weaponEffects[Math.floor(Math.random() * weaponEffects.length)];
    
    return {
        name: name,
        type: type,
        rarity: rarity,
        description: desc,
        lai: weaponLai[type] || 0 // 使用utils.js的weaponLai
    };
}

// 显示武器卡片
function displayWeapon(weapon) {
    const item = document.createElement('div');
    item.className = 'wish-item';
    
    const card = document.createElement('div');
    card.className = 'wish-card';
    
    const starColors = {
        1: '#f5f5f5', 2: '#4caf50', 3: '#2196f3', 4: '#9c27b0',
        5: '#ff9800', 6: '#ffd700', 7: '#ff0000'
    };
    
    let starsHTML = '';
    for (let i = 0; i < weapon.rarity; i++) {
        starsHTML += `<span class="star" style="color: ${starColors[weapon.rarity]}">★</span>`;
    }
    
    const front = document.createElement('div');
    front.className = `wish-card-front rarity-${weapon.rarity}`;
    front.innerHTML = `
        <img src="${weaponImages[weapon.type] || 'https://via.placeholder.com/150?text=未知武器'}" class="item-image">
        <div class="item-name">${weapon.name}</div>
        <div class="rarity-stars">${starsHTML}</div>
        <div>${weapon.type} (LAI=${weapon.lai})</div>
    `;
    
    const back = document.createElement('div');
    back.className = `wish-card-back rarity-${weapon.rarity}`;
    back.innerHTML = `
        <div class="item-name">${weapon.name}</div>
        <div class="rarity-stars">${starsHTML}</div>
        <div>${weapon.type} (LAI=${weapon.lai})</div>
        <div class="item-description">${weapon.description}</div>
    `;
    
    card.appendChild(front);
    card.appendChild(back);
    item.appendChild(card);
    
    card.addEventListener('click', function() {
        this.classList.toggle('flipped');
    });
    
    gameElements.results.appendChild(item);
    return weapon;
}

// 抽卡动画
function wishAnimation(count, callback) {
    wishEffect.classList.add('active');
    gameElements.results.innerHTML = '';
    
    setTimeout(() => {
        wishEffect.classList.remove('active');
        setTimeout(() => {
            const results = [];
            for (let i = 0; i < count; i++) {
                results.push(generateWeapon());
            }
            callback(results);
        }, 300);
    }, 3000);
}

// 创建背景粒子效果
function createParticles() {
    const particleBg = document.getElementById('particle-bg');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = `${Math.random() * 5 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
        particleBg.appendChild(particle);
    }
}

// 预加载图片
function preloadImage(url) {
    const img = new Image();
    img.src = url;
    img.onload = () => console.log('Image loaded:', url);
    img.onerror = () => console.error('Failed to load image:', url);
}

// 初始化抽卡系统
function initGacha() {
    gameElements.btnSingle.addEventListener('click', () => {
        wishAnimation(1, (results) => {
            results.forEach((weapon) => {
                const newWeapon = displayWeapon(weapon);
                addToInventory(newWeapon); // 依赖inventory.js
            });
            updateStats();
        });
    });

    gameElements.btnMulti.addEventListener('click', () => {
        wishAnimation(10, (results) => {
            results.forEach((weapon, i) => {
                setTimeout(() => {
                    const newWeapon = displayWeapon(weapon);
                    addToInventory(newWeapon);
                }, i * 150);
            });
            updateStats();
        });
    });

    preloadImage('https://static.wikia.nocookie.net/to-aru-majutsu-no-index/images/1/12/Pentagram-GreatGold.png');
    createParticles();
    updateStats();
}