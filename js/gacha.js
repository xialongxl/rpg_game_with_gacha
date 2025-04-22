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

const weaponImages = {
    "单手剑": "img/broadsword.png",
    "双手剑": "img/relic-blade.png",
    "法杖": "img/wizard-staff.png",
    "弓": "img/pocket-bow.png",
    "魔法书": "img/spell-book.png",
    "匕首": "img/bowie-knife.png",
    "盾牌": "img/templar-shield.png"
};

const rarityCoefficients = {
    1: { min: 0.8, max: 1.0 },
    2: { min: 1.0, max: 1.2 },
    3: { min: 1.2, max: 1.5 },
    4: { min: 1.5, max: 2.0 },
    5: { min: 2.0, max: 3.0 },
    6: { min: 3.0, max: 4.0 },
    7: { min: 4.0, max: 5.0 }
};

const disassembleValues = {
    1: 5, 2: 15, 3: 30, 4: 60, 5: 120, 6: 240, 7: 0
};

let pityCounter = 0;
let stats = { 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0 };
const wishEffect = document.getElementById('wish-effect');

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

function calculateWeaponStats(rarity, type) {
    const baseValue = 50;
    const coeffRange = rarityCoefficients[rarity];
    const randomCoeff = coeffRange.min + Math.random() * (coeffRange.max - coeffRange.min);
    const randomFactor = 0.9 + Math.random() * 0.2;
    
    const power = Math.round(baseValue * Math.pow(randomCoeff, 2) * randomFactor);
    
    return {
        attack: type === '盾牌' ? 0 : power,
        defense: type === '盾牌' ? power : 0,
        sellValue: disassembleValues[rarity]
    };
}

function createWeapon(rarity) {
    const types = Object.keys(weaponTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    const suffixes = weaponTypes[type];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = weaponPrefixes[Math.floor(Math.random() * weaponPrefixes.length)] + suffix;
    
    const { attack, defense, sellValue } = calculateWeaponStats(rarity, type);
    
    return {
        name: name,
        type: type,
        rarity: rarity,
        lai: weaponLai[type] || 0,
        image: weaponImages[type],
        attack: attack,
        defense: defense,
        sellValue: sellValue,
        createdAt: new Date().toISOString()
    };
}

function displayWeapon(weapon) {
    const item = document.createElement('div');
    item.className = 'wish-item';
    
    const card = document.createElement('div');
    card.className = 'wish-card';
    
    const starColors = {
        1: '#f5f5f5', 2: '#4caf50', 3: '#2196f3', 4: '#9c27b0',
        5: '#ffd700', 6: '#ff9800', 7: '#ff0000'
    };
    
    let starsHTML = '';
    for (let i = 0; i < weapon.rarity; i++) {
        starsHTML += `<span class="star" style="color: ${starColors[weapon.rarity]}">★</span>`;
    }
    
    const front = document.createElement('div');
    front.className = `wish-card-front rarity-${weapon.rarity}`;
    front.innerHTML = `
        <img src="${weapon.image}" class="item-image">
        <div class="item-name">${weapon.name}</div>
        <div class="rarity-stars">${starsHTML}</div>
        <div>${weapon.type}</div>
    `;
    
    const back = document.createElement('div');
    back.className = `wish-card-back rarity-${weapon.rarity}`;
    back.innerHTML = `
        <div class="item-name">${weapon.name}</div>
        <div class="rarity-stars">${starsHTML}</div>
        <div>${weapon.type}</div>
        <div>LAI: ${weapon.lai}</div>
        ${weapon.type === '盾牌' ? 
            `<div>防御力: ${weapon.defense}</div>` : 
            `<div>攻击力: ${weapon.attack}</div>`}
        <div>出售价格: ${weapon.sellValue} 金币</div>
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

function preloadImage(url) {
    const img = new Image();
    img.src = url;
    img.onload = () => console.log('Image loaded:', url);
    img.onerror = () => console.error('Failed to load image:', url);
}

function initGacha() {
    gameElements.wishButton.addEventListener('click', () => {
        if (player.gold < 100) {
            showToast(`金币不足，需要100金币抽一次！当前金币：${player.gold}`);
            return;
        }
        player.gold -= 100;
        updateGameUI();
        log('消耗100金币进行抽卡...');
        wishAnimation(1, (results) => {
            results.forEach((weapon) => {
                const newWeapon = displayWeapon(weapon);
                addToInventory(newWeapon);
            });
            updateStats();
        });
    });

    gameElements.wishButton10.addEventListener('click', () => {
        if (player.gold < 550) {
            showToast(`金币不足，需要550金币抽十次！当前金币：${player.gold}`);
            return;
        }
        player.gold -= 550;
        updateGameUI();
        log('消耗550金币进行十连抽...');
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