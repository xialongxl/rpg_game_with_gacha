/**
 * 存档系统核心模块 (完整修复版)
 * 完整保留原始588行代码结构
 * 修复重点：确保自动存档始终使用slot0
 */

// ==================== 配置常量 ====================
const SAVE_PREFIX = 'rpg_game_save_';
const AUTO_SAVE_SLOT = 'slot0';
const MANUAL_SLOTS = ['slot1', 'slot2', 'slot3'];
const VERSION = '20250424003048956';

// ==================== 全局变量 ====================
let isSaveManagerInitialized = false;
let saveModal = null;
let isProcessing = false;
let areSaveButtonsBound = false;

// ==================== 核心功能 ====================

/**
 * 获取所有存档数据
 * @returns {Object} 包含所有存档位的存档数据
 */
function getAllSaves() {
    const saves = {
        [AUTO_SAVE_SLOT]: localStorage.getItem(SAVE_PREFIX + AUTO_SAVE_SLOT)
    };
    
    MANUAL_SLOTS.forEach(slot => {
        saves[slot] = localStorage.getItem(SAVE_PREFIX + slot);
    });
    
    return saves;
}

/**
 * 保存游戏状态 (修复版)
 * @param {string} slot 存档位（默认当前存档位）
 * @param {boolean} isAutoSave 是否自动存档
 * @returns {boolean} 是否保存成功
 */
function saveGame(slot = player.currentSlot, isAutoSave = false) {
    // ==================== 阻断系统核心 ====================
    // 1. 初始化全局阻断标记（如果不存在）
    if (typeof window.__blockAllAutoSaves === 'undefined') {
        window.__blockAllAutoSaves = false;
    }

    // 2. 自动保存阻断检查
    if (isAutoSave && window.__blockAllAutoSaves) {
        console.warn('⛔ 自动保存被手动操作阻断');
        return false;
    }

    // 3. 手动操作时激活阻断
    if (!isAutoSave) {
        window.__blockAllAutoSaves = true;
        console.log('🔒 手动保存中，阻断自动保存');

        // 清除旧计时器，避免重复解除
        if (window.__blockTimer) clearTimeout(window.__blockTimer);
        
        // 设置3秒阻断期（可调整）
        window.__blockTimer = setTimeout(() => {
            window.__blockAllAutoSaves = false;
            console.log('🔓 手动保存完成，恢复自动保存');
        }, 3000);
    }

    // ==================== 存档核心逻辑 ====================
    console.groupCollapsed(`[存档系统] ${isAutoSave ? '自动' : '手动'}保存到 ${slot}`);
    
    try {
        // 1. 验证存档位
        const finalSlot = isAutoSave ? 'slot0' : 
            (slot && ['slot0', 'slot1', 'slot2', 'slot3'].includes(slot)) ? slot : 'slot0';

        // 2. 准备存档数据（兼容旧版）
        const saveData = {
            version: player.version || '1.0', // 回退默认版本
            timestamp: new Date().toISOString(),
            player: {
                ...JSON.parse(JSON.stringify(player)), // 简易深拷贝
                inventory: player.inventory,
                equipment: player.equipment
            },
            system: {
                playTime: window.totalPlayTime || 0,
                lastSave: Date.now()
            },
            mapData:{
                currentMap: currentMap,
                unlockedMaps: unlockedMaps
            },
            gachaData:{
                pityCounter: pityCounter,
                stats: stats
            }

        };

        // 3. 数据压缩（兼容LZString未加载情况）
        let compressed;
        try {
            compressed = LZString?.compressToUTF16(JSON.stringify(saveData)) || JSON.stringify(saveData);
        } catch (e) {
            compressed = JSON.stringify(saveData);
            console.warn('压缩失败，使用未压缩数据');
        }

        // 4. 写入存储
        localStorage.setItem(`rpg_game_save_${finalSlot}`, compressed);
        player.lastSaveTime = Date.now();

        // 5. 用户反馈（安全版）
        if (!isAutoSave) {
            try {
                alert(`成功保存到存档位 ${finalSlot.replace('slot', '')}`); // 回退提示
            } catch (e) {
                console.log('保存成功，但UI反馈失败');
            }
        }

        console.log('✅ 存档成功', finalSlot);
        return true;

    } catch (error) {
        console.error('❌ 存档失败:', error);
        if (!isAutoSave) {
            try {
                alert('存档失败！请检查控制台');
            } catch (e) {
                console.error('UI反馈失败');
            }
        }
        return false;
    } finally {
        console.groupEnd();
    }
}

/**
 * 加载存档 (完整保留原始逻辑)
 * @param {string} slot 要加载的存档位
 * @returns {boolean} 是否加载成功
 */
function loadGame(slot = player.currentSlot) {
    const compressed = localStorage.getItem(SAVE_PREFIX + slot);
    if (!compressed) {
        showToast(`存档位 ${slot.replace('slot', '')} 为空`);
        return false;
    }

    try {
        const saveData = JSON.parse(LZString.decompressFromUTF16(compressed));

        // 验证版本
        if (saveData.version !== player.version) {
            if (!confirm('存档版本不匹配，可能无法正常加载。继续吗？')) return false;
        }

        // 恢复游戏状态
        Object.assign(player, saveData.player);

        currentMap = saveData.mapData?.currentMap || maps[0];
        unlockedMaps = saveData.mapData?.unlockedMaps || [1];
        pityCounter = saveData.gachaData?.pityCounter || 0;
        stats = saveData.gachaData?.stats || { 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0 };

        player.currentSlot = slot;
        showToast(`已加载存档位 ${slot.replace('slot', '')}`);
        return true;
    } catch (e) {
        console.error('加载存档失败:', e);
        showToast('加载存档失败！文件可能已损坏');
        return false;
    }
}

// ==================== 存档管理 ====================

/**
 * 删除存档
 * @param {string} slot 要删除的存档位
 */
function deleteSave(slot) {
    if (slot === AUTO_SAVE_SLOT) {
        if (!confirm('确定要删除自动存档吗？游戏将在下次自动保存时重建。')) {
            return;
        }
    }
    localStorage.removeItem(SAVE_PREFIX + slot);
    showToast(`已删除存档位 ${slot.replace('slot', '')}`);
}

/**
 * 导出存档
 * @param {string} slot 要导出的存档位
 * @returns {string|null} 导出的存档字符串
 */
function exportSave(slot = player.currentSlot) {
    try {
        const data = localStorage.getItem(SAVE_PREFIX + slot);
        if (!data) {
            showToast('没有找到存档数据');
            return null;
        }

        const exportData = {
            slot: slot,
            data: data,
            version: player.version,
            timestamp: new Date().toISOString()
        };

        const jsonString = JSON.stringify(exportData);
        const encodedString = encodeURIComponent(jsonString);
        const exportString = btoa(unescape(encodedString));
        return exportString;
    } catch (e) {
        console.error('导出存档失败:', e);
        showToast('导出存档失败');
        return null;
    }
}

/**
 * 导入存档
 * @param {string} encodedString 存档字符串
 * @param {boolean} overwrite 是否覆盖现有存档
 * @returns {boolean} 是否导入成功
 */
function importSave(encodedString, overwrite = false) {
    try {
        // 解码base64
        const decodedString = decodeURIComponent(escape(atob(encodedString)));
        const importData = JSON.parse(decodedString);

        // 验证结构
        if (!importData.slot || !importData.data || !importData.version) {
            throw new Error('无效的存档格式');
        }

        // 测试解压
        if (!LZString.decompressFromUTF16(importData.data)) {
            throw new Error('存档数据损坏');
        }

        if (!overwrite && localStorage.getItem(SAVE_PREFIX + importData.slot)) {
            if (!confirm(`存档位 ${importData.slot.replace('slot', '')} 已有数据，是否覆盖？`)) {
                return false;
            }
        }

        localStorage.setItem(SAVE_PREFIX + importData.slot, importData.data);
        showToast(`成功导入存档到位置 ${importData.slot.replace('slot', '')}`);
        return true;
    } catch (e) {
        console.error('导入存档失败:', e);
        showToast('导入存档失败，数据格式不正确');
        return false;
    }
}

// ==================== UI系统 ====================

/**
 * 初始化存档UI界面 (完整保留原始实现)
 */
function initSaveUI() {
    // 如果已存在则更新引用
    const existingModal = document.getElementById('save-modal');
    if (existingModal) {
        saveModal = existingModal;
    } else {
        // 创建模态框HTML
        const modalHTML = `
            <div id="save-modal" class="modal" style="display:none">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>存档管理</h2>
                    <div class="save-slots" id="save-slots"></div>
                    <div class="import-export-actions">
                        <button id="export-save-btn" class="action-button">导出当前存档</button>
                        <button id="import-save-btn" class="action-button">导入存档</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        saveModal = document.getElementById('save-modal');
    }
    // 一次性绑定所有事件
    if (!isSaveManagerInitialized) {
        bindGlobalSaveEvents();
        isSaveManagerInitialized = true;
    }
}

/**
 * 显示存档管理器 (完整实现)
 */
function showSaveManager() {
    // 确保模态框存在
    if (!saveModal) {
        console.error('存档模态框未初始化，正在尝试初始化...');
        initSaveUI();
        if (!saveModal) {
            console.error('初始化存档模态框失败');
            return;
        }
    }
    // 更新UI内容
    updateSaveSlotsUI();
    
    // 显示模态框
    saveModal.style.display = 'block';
}

/**
 * 更新存档槽位UI
 */
function updateSaveSlotsUI() {
    const slotsDiv = document.getElementById('save-slots');
    slotsDiv.innerHTML = '';
    // 生成自动存档UI
    const autoSaveData = localStorage.getItem(SAVE_PREFIX + AUTO_SAVE_SLOT);
    let autoSaveHTML = '';
    if (autoSaveData) {
        try {
            const data = JSON.parse(LZString.decompressFromUTF16(autoSaveData));
            const saveDate = new Date(data.timestamp);
            const formattedDate = saveDate.toLocaleDateString() + ' ' + saveDate.toLocaleTimeString();
            
            autoSaveHTML = `
                <div class="save-slot auto-save">
                    <h3>自动存档</h3>
                    <p>等级: ${data.player.level}</p>
                    <p>金币: ${data.player.gold}</p>
                    <p>时间: ${formattedDate}</p>
                    <div class="save-actions">
                        <button class="action-button load-slot" data-slot="${AUTO_SAVE_SLOT}">加载</button>
                        <button class="action-button delete-slot" data-slot="${AUTO_SAVE_SLOT}">删除</button>
                    </div>
                </div>
            `;
        } catch (e) {
            autoSaveHTML = `
                <div class="save-slot error">
                    <h3>自动存档</h3>
                    <p>存档损坏</p>
                    <div class="save-actions">
                        <button class="action-button delete-slot" data-slot="${AUTO_SAVE_SLOT}">删除</button>
                    </div>
                </div>
            `;
        }
    } else {
        autoSaveHTML = `
            <div class="save-slot empty auto-save">
                <h3>自动存档</h3>
                <p>空存档</p>
            </div>
        `;
    }
    slotsDiv.insertAdjacentHTML('beforeend', autoSaveHTML);
    // 生成手动存档位UI
    MANUAL_SLOTS.forEach((slot, index) => {
        const saveData = localStorage.getItem(SAVE_PREFIX + slot);
        let slotHTML = '';
        if (saveData) {
            try {
                const data = JSON.parse(LZString.decompressFromUTF16(saveData));
                const saveDate = new Date(data.timestamp);
                const formattedDate = saveDate.toLocaleDateString() + ' ' + saveDate.toLocaleTimeString();
                slotHTML = `
                    <div class="save-slot">
                        <h3>存档位 ${index + 1}</h3>
                        <p>等级: ${data.player.level}</p>
                        <p>金币: ${data.player.gold}</p>
                        <p>时间: ${formattedDate}</p>
                        <div class="save-actions">
                            <button class="action-button load-slot" data-slot="${slot}">加载</button>
                            <button class="action-button save-slot" data-slot="${slot}">覆盖保存</button>
                            <button class="action-button delete-slot" data-slot="${slot}">删除</button>
                        </div>
                    </div>
                `;
            } catch (e) {
                slotHTML = `
                    <div class="save-slot error">
                        <h3>存档位 ${index + 1}</h3>
                        <p>存档损坏</p>
                        <div class="save-actions">
                            <button class="action-button delete-slot" data-slot="${slot}">删除</button>
                        </div>
                    </div>
                `;
            }
        } else {
            slotHTML = `
                <div class="save-slot empty">
                    <h3>存档位 ${index + 1}</h3>
                    <p>空存档</p>
                    <div class="save-actions">
                        <button class="action-button save-slot" data-slot="${slot}">新建存档</button>
                    </div>
                </div>
            `;
        }
        slotsDiv.insertAdjacentHTML('beforeend', slotHTML);
    });
}

// ==================== 自动保存系统 ====================

/**
 * 设置自动保存钩子 (完整实现)
 */
function setupAutoSave() {
    // 1. 首次自动保存
    if (!localStorage.getItem(SAVE_PREFIX + AUTO_SAVE_SLOT)) {
        saveGame(AUTO_SAVE_SLOT, true);
    }

    // 2. 关键操作钩子
    const originalFunctions = {
        addToInventory: window.addToInventory,
        equipWeapon: window.equipWeapon,
        gainExperience: window.gainExperience
    };

    // 重写关键函数
    window.addToInventory = function(...args) {
        const result = originalFunctions.addToInventory.apply(this, args);
        saveGame(AUTO_SAVE_SLOT, true);
        return result;
    };

    window.equipWeapon = function(...args) {
        const result = originalFunctions.equipWeapon.apply(this, args);
        saveGame(AUTO_SAVE_SLOT, true);
        return result;
    };

    // 3. 定时保存
    setInterval(() => saveGame(AUTO_SAVE_SLOT, true), 5 * 60 * 1000);
}

// ==================== 初始化系统 ====================

/**
 * 初始化存档系统 (修复版)
 */
function initSaveSystem() {
    console.groupCollapsed('[存档系统] 初始化开始');
    
    // 1. 确保player对象存在
    if (typeof player === 'undefined') {
        console.error('错误：player对象未定义！');
        return;
    }

    // 2. 强制设置自动存档位
    if (!player.hasOwnProperty('currentSlot') || player.currentSlot !== AUTO_SAVE_SLOT) {
        console.warn(`修正currentSlot: ${player.currentSlot || 'undefined'} -> ${AUTO_SAVE_SLOT}`);
        player.currentSlot = AUTO_SAVE_SLOT;
    }

    // 3. 加载压缩库
    if (typeof LZString === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js';
        script.onload = initializeCore;
        document.head.appendChild(script);
    } else {
        initializeCore();
    }

    function initializeCore() {
        // 初始化UI
        initSaveUI();
        
        // 设置自动保存
        setupAutoSave();
        
        // 检查首次存档
        if (!localStorage.getItem(SAVE_PREFIX + AUTO_SAVE_SLOT)) {
            saveGame(AUTO_SAVE_SLOT, true);
        }
        
        console.log('✓ 存档系统初始化完成');
    }
    
    console.groupEnd();
    bindSaveButtons();
}

// ==================== 工具函数 ====================

/**
 * 深度克隆对象
 * @param {*} obj 要克隆的对象
 * @returns {*} 深拷贝后的对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    
    const clone = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clone[key] = deepClone(obj[key]);
        }
    }
    return clone;
}

/**
 * 绑定按钮事件
 */
function bindSaveButtons() {
    // 避免重复绑定
    if (areSaveButtonsBound) return;
    
    console.log("正在绑定存档按钮...");
    // 获取按钮元素
    const quickSaveBtn = document.getElementById('quick-save-btn');
    const quickLoadBtn = document.getElementById('quick-load-btn');
    const manageSavesBtn = document.getElementById('manage-saves-btn');
    // 检查按钮是否存在
    if (!quickSaveBtn || !quickLoadBtn || !manageSavesBtn) {
        console.error("错误：存档按钮未找到！1秒后重试...");
        setTimeout(bindSaveButtons, 1000); // 1秒后重试
        return;
    }
    // 绑定快速保存
    quickSaveBtn.addEventListener('click', () => {
        console.log("快速保存触发");
        saveGame(player.currentSlot);
    });
    // 绑定快速读档
    quickLoadBtn.addEventListener('click', () => {
        console.log("快速读档触发");
        if (loadGame(player.currentSlot)) {
            updateAllUI(); // 更新游戏UI
        }
    });
    // 绑定存档管理器
    manageSavesBtn.addEventListener('click', () => {
        console.log("打开存档管理器");
        showSaveManager();
    });
    areSaveButtonsBound = true;
    console.log("存档按钮绑定成功！");
}

/**
 * 绑定存档槽位事件
 */
/**
 * 绑定所有存档系统交互事件 (100%完整版)
 */
/**
 * 绑定存档槽位事件 (终极修复版)
 * 修复重点：
 * 1. 彻底解决多次触发问题
 * 2. 完善所有交互流程
 * 3. 增强错误处理
 */
function bindGlobalSaveEvents() {
    if (!saveModal) {
        console.error('无法绑定事件：存档模态框未初始化');
        return;
    }
    // 点击事件委托
    document.addEventListener('click', (e) => {
        // 导出按钮
        if (e.target.closest('#export-save-btn')) {
            handleExportSave();
            return;
        }
        
        // 导入按钮
        if (e.target.closest('#import-save-btn')) {
            handleImportSave();
            return;
        }
        
        // 存档操作按钮
        const slotBtn = e.target.closest('.load-slot, .save-slot, .delete-slot');
        if (slotBtn) {
            handleSlotAction(slotBtn);
            return;
        }
        
        // 关闭操作
        if (e.target.closest('.close') || e.target === saveModal) {
            saveModal.style.display = 'none';
        }
    });
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && saveModal.style.display === 'block') {
            saveModal.style.display = 'none';
        }
    });
}

// ============= 独立处理函数 =============
function handleSlotAction(btn) {
    if (isProcessing) return;
    
    const slot = btn.dataset.slot;
    if (!slot) return;
    isProcessing = true;
    
    try {
        if (btn.classList.contains('load-slot')) {
            if (confirm(`加载存档位 ${slot.replace('slot', '')} 将覆盖当前进度，确定继续？`)) {
                if (loadGame(slot)) {
                    saveModal.style.display = 'none';
                    updateAllUI();
                    alert('存档加载成功！');
                }
            }
        }
        else if (btn.classList.contains('save-slot')) {
            window.__blockAllAutoSaves = true;
            clearTimeout(window.__blockTimer);
            window.__blockTimer = setTimeout(() => {
                window.__blockAllAutoSaves = false;
            }, 3000);
            if (saveGame(slot)) {
                setTimeout(() => showSaveManager(), 100);
            }
        }
        else if (btn.classList.contains('delete-slot')) {
            if (confirm(`确定永久删除存档位 ${slot.replace('slot', '')}？`)) {
                deleteSave(slot);
                showSaveManager();
            }
        }
    } catch (error) {
        console.error('操作失败:', error);
        alert('操作失败，请查看控制台');
    } finally {
        isProcessing = false;
    }
}

function handleExportSave() {
    if (isProcessing) return;
    isProcessing = true;
    
    try {
        const code = exportSave();
        if (code) {
            navigator.clipboard.writeText(code)
                .then(() => alert('存档代码已复制！'))
                .catch(() => prompt('请手动复制：', code));
        }
    } catch (e) {
        console.error('导出失败:', e);
        alert('导出失败');
    } finally {
        isProcessing = false;
    }
}

function handleImportSave() {
    if (isProcessing) return;
    isProcessing = true;
    
    const code = prompt('粘贴存档代码：');
    if (!code) {
        isProcessing = false;
        return;
    }
    try {
        if (importSave(code)) {
            setTimeout(() => showSaveManager(), 100);
            alert('导入成功！');
        }
    } catch (e) {
        console.error('导入失败:', e);
        alert('导入失败');
    } finally {
        isProcessing = false;
    }
}


// ==================== 首次运行检查 ====================

/**
 * 检查首次保存
 */
function checkFirstTimeSave() {
    if (!localStorage.getItem(SAVE_PREFIX + AUTO_SAVE_SLOT)) {
        console.log('首次运行，创建自动存档');
        saveGame(AUTO_SAVE_SLOT, true);
    } else {
        console.log('检测到已有自动存档');
        if (confirm('检测到自动存档，是否加载？')) {
            loadGame(AUTO_SAVE_SLOT);
        }
    }
}

// ==================== 全局接口 ====================

// 暴露公共接口
window.saveGame = saveGame;
window.loadGame = loadGame;
window.exportSave = exportSave;
window.importSave = importSave;
window.showSaveManager = showSaveManager;
window.initSaveSystem = initSaveSystem;

// ==================== 自动初始化 ====================

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (typeof player !== 'undefined') {
        bindSaveButtons();
        initSaveSystem();
    } else {
        console.error('存档系统初始化失败：player对象未定义');
        // 延迟重试
        setTimeout(() => {
            if (typeof player !== 'undefined') {
                bindSaveButtons();
                initSaveSystem();
            }
        }, 1000);
    }
});