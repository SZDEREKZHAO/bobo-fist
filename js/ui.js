// 波波拳 - UI控制

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function updateUI() {
    // 分数/回合
    document.getElementById('round-num').textContent = GameState.round;
    document.getElementById('p1-score').textContent = GameState.p1Score;
    document.getElementById('p2-score').textContent = GameState.p2Score;
    
    // 角色信息
    document.getElementById('p1-avatar').textContent = GameState.p1Character?.avatar || '🥊';
    document.getElementById('p1-name').textContent = GameState.p1Character?.name || '玩家';
    document.getElementById('p2-avatar').textContent = GameState.p2Character?.avatar || '🤖';
    document.getElementById('p2-name').textContent = GameState.p2Character?.name || '电脑';
    
    // 更新专属大招按钮显示
    updateSuperButton(1);
    updateSuperButton(2);
    
    // 更新护盾按钮显示
    updateShieldButton(1);
    updateShieldButton(2);
    
    // 血条
    document.getElementById('p1-hp-fill').style.width = GameState.p1HP + '%';
    document.getElementById('p1-hp-text').textContent = `${GameState.p1HP}/100`;
    document.getElementById('p2-hp-fill').style.width = GameState.p2HP + '%';
    document.getElementById('p2-hp-text').textContent = `${GameState.p2HP}/100`;
    
    // 波波槽
    document.getElementById('p1-bobo-fill').style.width = GameState.p1Bobo + '%';
    document.getElementById('p2-bobo-fill').style.width = GameState.p2Bobo + '%';
    
    // 波波槽满特效（改为50能量半满提示）
    const p1BoboEl = document.getElementById('p1-bobo-fill');
    const p2BoboEl = document.getElementById('p2-bobo-fill');
    
    if (GameState.p1Bobo >= ENERGY_COST) {
        p1BoboEl.classList.add('ready');
        if (GameState.p1Bobo >= 100) p1BoboEl.classList.add('full');
    } else {
        p1BoboEl.classList.remove('ready', 'full');
    }
    
    if (GameState.p2Bobo >= ENERGY_COST) {
        p2BoboEl.classList.add('ready');
        if (GameState.p2Bobo >= 100) p2BoboEl.classList.add('full');
    } else {
        p2BoboEl.classList.remove('ready', 'full');
    }
    
    // 大招按钮状态（根据50能量）
    const p1SuperBtn = document.querySelector('#p1-super-moves .super-btn');
    const p2SuperBtn = document.querySelector('#p2-super-moves .super-btn');
    const p1ShieldBtn = document.querySelector('#p1-super-moves .shield-btn');
    const p2ShieldBtn = document.querySelector('#p2-super-moves .shield-btn');
    
    const canUseP1 = GameState.p1Bobo >= ENERGY_COST;
    const canUseP2 = GameState.p2Bobo >= ENERGY_COST;
    
    if (p1SuperBtn) p1SuperBtn.disabled = !canUseP1;
    if (p2SuperBtn) p2SuperBtn.disabled = !canUseP2;
    if (p1ShieldBtn) p1ShieldBtn.disabled = !canUseP1;
    if (p2ShieldBtn) p2ShieldBtn.disabled = !canUseP2;
    
    // 连击显示
    const p1ComboEl = document.getElementById('p1-combo');
    const p2ComboEl = document.getElementById('p2-combo');
    
    if (GameState.p1Combo > 1) {
        p1ComboEl.textContent = `🔥 ${GameState.p1Combo} 连击！`;
        p1ComboEl.classList.add('active');
    } else {
        p1ComboEl.textContent = '';
        p1ComboEl.classList.remove('active');
    }
    
    if (GameState.p2Combo > 1) {
        p2ComboEl.textContent = `🔥 ${GameState.p2Combo} 连击！`;
        p2ComboEl.classList.add('active');
    } else {
        p2ComboEl.textContent = '';
        p2ComboEl.classList.remove('active');
    }
    
    // 血量模式才显示血条
    if (GameState.mode === 'standard') {
        document.getElementById('p1-hp-bar').style.display = 'none';
        document.getElementById('p2-hp-bar').style.display = 'none';
    } else {
        document.getElementById('p1-hp-bar').style.display = 'block';
        document.getElementById('p2-hp-bar').style.display = 'block';
    }
}

// 更新专属大招按钮显示
function updateSuperButton(player) {
    const character = player === 1 ? GameState.p1Character : GameState.p2Character;
    if (!character) return;
    
    const superMove = character.superMove;
    const emojiEl = document.getElementById(`p${player}-super-emoji`);
    const nameEl = document.getElementById(`p${player}-super-name`);
    const descEl = document.getElementById(`p${player}-super-desc`);
    
    if (emojiEl) emojiEl.textContent = superMove.emoji;
    if (nameEl) nameEl.textContent = superMove.name;
    if (descEl) descEl.textContent = superMove.desc;
}

// 更新护盾按钮显示
function updateShieldButton(player) {
    const character = player === 1 ? GameState.p1Character : GameState.p2Character;
    if (!character) return;
    
    const shieldMove = character.shieldMove;
    const emojiEl = document.getElementById(`p${player}-shield-emoji`);
    const nameEl = document.getElementById(`p${player}-shield-name`);
    const descEl = document.getElementById(`p${player}-shield-desc`);
    
    if (emojiEl) emojiEl.textContent = shieldMove.emoji;
    if (nameEl) nameEl.textContent = shieldMove.name;
    if (descEl) descEl.textContent = shieldMove.desc;
}

// 显示伤害飘字
function showDamage(elementId, damage) {
    const el = document.getElementById(elementId);
    const popup = document.createElement('div');
    popup.className = 'damage-popup';
    popup.textContent = `-${damage}`;
    popup.style.left = '50%';
    popup.style.top = '20%';
    el.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

// 大招特效
function showSuperEffect() {
    const effect = document.createElement('div');
    effect.className = 'super-effect';
    document.body.appendChild(effect);
    
    setTimeout(() => effect.remove(), 500);
}
