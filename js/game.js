// 波波拳 - 核心游戏逻辑

const GameState = {
    mode: 'standard',
    difficulty: 'normal',
    round: 1,
    p1Score: 0,
    p2Score: 0,
    p1HP: 100,
    p2HP: 100,
    p1Bobo: 0,
    p2Bobo: 0,
    p1Combo: 0,
    p2Combo: 0,
    p1Character: null,
    p2Character: null,
    itemsUsed: [false, false, false],
    ai: null,
    gameOver: false,
    pendingItem: null,
    isPVP: false,
    pvpTurn: 1,
    pvpMoves: { p1: null, p2: null },
    pendingBattle: null,
    battleStats: {
        superKill: false,
        maxCombo: 0,
        lowestHP: 100,
        maxDamage: 0
    }
};

const MOVE_RULES = {
    rock: { beats: 'scissors', loses: 'paper' },
    scissors: { beats: 'paper', loses: 'rock' },
    paper: { beats: 'rock', loses: 'scissors' }
};

const MOVE_NAMES = { rock: '石头', scissors: '剪刀', paper: '布' };
const MOVE_EMOJIS = { rock: '👊', scissors: '✌️', paper: '🖐️' };

function initGame() {
    generateCharacterCards();
    generatePVPCards();
    bindEvents();
}

function bindEvents() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            GameState.mode = btn.dataset.mode;
            GameState.isPVP = btn.dataset.mode === 'pvp';
            
            if (GameState.isPVP) {
                document.getElementById('p1-select-title').textContent = '玩家1选择角色';
            } else {
                document.getElementById('p1-select-title').textContent = '选择你的战士';
            }
            showScreen('character-select');
        });
    });

    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            GameState.difficulty = btn.dataset.diff;
            GameState.ai = new BoboAI(GameState.difficulty);
            startBattle();
        });
    });

    // P1控制
    document.querySelectorAll('[data-player="1"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (GameState.gameOver) return;
            if (GameState.isPVP && GameState.pvpTurn !== 1) return;
            
            const isSuper = btn.classList.contains('super-btn');
            const move = btn.dataset.move || btn.dataset.super;
            
            if (GameState.isPVP) {
                handlePVPMove(1, move, isSuper);
            } else {
                playRound(move, isSuper);
            }
        });
    });

    // P2控制
    document.querySelectorAll('[data-player="2"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (GameState.gameOver) return;
            if (!GameState.isPVP || GameState.pvpTurn !== 2) return;
            
            const isSuper = btn.classList.contains('super-btn');
            const move = btn.dataset.move || btn.dataset.super;
            handlePVPMove(2, move, isSuper);
        });
    });
}

function selectCharacter(charId) {
    GameState.p1Character = getCharacter(charId);
    
    document.querySelectorAll('#character-grid .character-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`#character-grid [data-character="${charId}"]`).classList.add('selected');
    
    if (GameState.isPVP) {
        setTimeout(() => showScreen('pvp-character-select'), 300);
    } else {
        const aiChars = CHARACTERS.filter(c => c.id !== charId);
        GameState.p2Character = aiChars[Math.floor(Math.random() * aiChars.length)];
        setTimeout(() => showScreen('difficulty-select'), 300);
    }
}

function selectP2Character(charId) {
    GameState.p2Character = getCharacter(charId);
    startBattle();
}

function generatePVPCards() {
    const grid = document.getElementById('pvp-character-grid');
    grid.innerHTML = CHARACTERS.map(char => `
        <div class="character-card" data-character="${char.id}" onclick="selectP2Character('${char.id}')">
            <div class="character-avatar">${char.avatar}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-title">${char.title}</div>
            <div class="character-skill">${char.skill}</div>
        </div>
    `).join('');
}

function startBattle() {
    resetBattleState();
    updateUI();
    showScreen('game-screen');
    
    const p2Name = GameState.isPVP ? '玩家2' : '电脑';
    document.getElementById('p2-name').textContent = p2Name;
    document.getElementById('p2-avatar').textContent = GameState.isPVP ? '👤' : '🤖';
    
    addLog(`战斗开始！${GameState.p1Character.name} VS ${GameState.p2Character.name}`);
    
    if (GameState.isPVP) {
        setupPVPControls();
    } else {
        setupAIControls();
    }
}

function setupPVPControls() {
    document.getElementById('p1-controls').classList.remove('hidden');
    document.getElementById('p2-controls').classList.add('hidden');
    document.getElementById('turn-indicator').textContent = '玩家1的回合 - 请出招';
    document.getElementById('turn-indicator').style.display = 'block';
}

function setupAIControls() {
    document.getElementById('p1-controls').classList.remove('hidden');
    document.getElementById('p2-controls').classList.add('hidden');
    document.getElementById('turn-indicator').style.display = 'none';
}

function handlePVPMove(player, move, isSuper) {
    if (player === 1) {
        GameState.pvpMoves.p1 = { move, isSuper };
        GameState.pvpTurn = 2;
        document.getElementById('p1-controls').classList.add('hidden');
        document.getElementById('p2-controls').classList.remove('hidden');
        document.getElementById('turn-indicator').textContent = '玩家2的回合 - 请出招';
    } else {
        GameState.pvpMoves.p2 = { move, isSuper };
        
        // 双方都出招了，开始倒计时
        document.getElementById('p2-controls').classList.add('hidden');
        document.getElementById('turn-indicator').textContent = '战斗即将开始...';
        
        // 禁用按钮
        document.querySelectorAll('.move-btn, .super-btn').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
        
        // 显示倒计时
        startPVPCountdown();
    }
}

function startPVPCountdown() {
    let count = 3;
    
    // 创建倒计时元素
    const countdownEl = document.createElement('div');
    countdownEl.className = 'battle-countdown';
    countdownEl.id = 'battle-countdown';
    countdownEl.textContent = count;
    document.body.appendChild(countdownEl);
    
    // 播放倒计时
    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.textContent = count;
            countdownEl.classList.add('pulse');
        } else {
            clearInterval(timer);
            countdownEl.remove();
            resolvePVPRound();
        }
    }, 1000);
}

function resolvePVPRound() {
    const p1 = GameState.pvpMoves.p1;
    const p2 = GameState.pvpMoves.p2;
    
    // 显示战斗动画，传入角色信息
    showBattleAnimation(p1.move, p2.move, p1.isSuper, p2.isSuper, GameState.p1Character, GameState.p2Character, () => {
        document.getElementById('p1-move').textContent = p1.isSuper ? '💥' : MOVE_EMOJIS[p1.move];
        document.getElementById('p2-move').textContent = p2.isSuper ? '💥' : MOVE_EMOJIS[p2.move];
        document.getElementById('p1-move').classList.add('reveal');
        document.getElementById('p2-move').classList.add('reveal');
        
        const result = judgeRound(p1.move, p2.move, p1.isSuper, p2.isSuper);
        processRoundResult(result, p1.isSuper, p2.isSuper);
        
        // 重置PVP回合
        setTimeout(() => {
            GameState.pvpTurn = 1;
            GameState.pvpMoves = { p1: null, p2: null };
            document.getElementById('p1-controls').classList.remove('hidden');
            document.getElementById('p2-controls').classList.add('hidden');
            document.getElementById('turn-indicator').textContent = '玩家1的回合 - 请出招';
            
            // 重新启用按钮
            document.querySelectorAll('.move-btn, .super-btn').forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('disabled');
            });
            document.querySelectorAll('.super-btn').forEach(btn => {
                btn.disabled = GameState.p1Bobo < 100;
            });
        }, 1500);
    });
}

function resetBattleState() {
    GameState.round = 1;
    GameState.p1Score = 0;
    GameState.p2Score = 0;
    GameState.p1HP = GameState.p1Character?.id === 'tank' ? 150 : 100;
    GameState.p2HP = GameState.p2Character?.id === 'tank' ? 150 : 100;
    GameState.p1Bobo = 0;
    GameState.p2Bobo = 0;
    GameState.p1Combo = 0;
    GameState.p2Combo = 0;
    GameState.itemsUsed = [false, false, false];
    GameState.gameOver = false;
    GameState.pendingItem = null;
    GameState.pvpTurn = 1;
    GameState.pvpMoves = { p1: null, p2: null };
    GameState.battleStats = {
        superKill: false,
        maxCombo: 0,
        lowestHP: 100,
        maxDamage: 0
    };
    
    if (GameState.ai) GameState.ai.reset();
    
    ['item1', 'item2', 'item3'].forEach(id => {
        document.getElementById(id)?.classList.remove('used');
    });
    document.getElementById('battle-log').innerHTML = '';
}

function playRound(p1Move, isSuper) {
    const aiSuper = GameState.ai.chooseSuper(GameState.p2Bobo, GameState.p1Bobo, GameState.p2HP, GameState.p1HP);
    let p2Move, p2IsSuper = false;
    
    if (aiSuper && Math.random() < 0.7) {
        p2Move = aiSuper;
        p2IsSuper = true;
    } else {
        p2Move = GameState.ai.chooseMove(GameState.p1Bobo, GameState.p2Bobo);
    }
    
    if (GameState.pendingItem === 'see') {
        addLog(`👁️ 透视眼生效！对手准备出 ${MOVE_NAMES[p2Move] || '大招'}！`);
        GameState.pendingItem = null;
    }
    
    // 保存出招结果
    GameState.pendingBattle = {
        p1Move, p2Move,
        p1IsSuper: isSuper, p2IsSuper
    };
    
    // 禁用按钮
    document.querySelectorAll('.move-btn, .super-btn').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled');
    });
    
    // 显示倒计时
    startBattleCountdown();
}

function startBattleCountdown() {
    let count = 3;
    const resultEl = document.getElementById('move-result');
    
    // 创建倒计时元素
    const countdownEl = document.createElement('div');
    countdownEl.className = 'battle-countdown';
    countdownEl.id = 'battle-countdown';
    countdownEl.textContent = count;
    document.body.appendChild(countdownEl);
    
    // 播放倒计时
    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.textContent = count;
            countdownEl.classList.add('pulse');
        } else {
            clearInterval(timer);
            countdownEl.remove();
            executeBattle();
        }
    }, 1000);
    
    // 预显示玩家的出招（但不显示AI的）
    const { p1Move, p1IsSuper } = GameState.pendingBattle;
    document.getElementById('p1-move').textContent = p1IsSuper ? '💥' : MOVE_EMOJIS[p1Move];
    document.getElementById('p1-move').classList.add('reveal');
}

function executeBattle() {
    const { p1Move, p2Move, p1IsSuper, p2IsSuper } = GameState.pendingBattle;
    
    // 显示战斗动画，传入角色信息
    showBattleAnimation(p1Move, p2Move, p1IsSuper, p2IsSuper, GameState.p1Character, GameState.p2Character, () => {
        // 动画结束后显示结果
        document.getElementById('p2-move').textContent = p2IsSuper ? '💥' : MOVE_EMOJIS[p2Move];
        document.getElementById('p2-move').classList.add('reveal');
        
        const result = judgeRound(p1Move, p2Move, p1IsSuper, p2IsSuper);
        processRoundResult(result, p1IsSuper, p2IsSuper);
        
        if (!p1IsSuper) GameState.ai.recordMove(p1Move);
        
        // 重新启用按钮
        document.querySelectorAll('.move-btn, .super-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
        document.querySelectorAll('.super-btn').forEach(btn => {
            btn.disabled = GameState.p1Bobo < 100;
        });
        
        GameState.pendingBattle = null;
    });
}

function showBattleAnimation(p1Move, p2Move, p1IsSuper, p2IsSuper, p1Char, p2Char, callback) {
    // 创建战斗动画容器
    const animationContainer = document.createElement('div');
    animationContainer.className = 'battle-animation';
    animationContainer.id = 'battle-animation';
    document.body.appendChild(animationContainer);
    
    // 判断战斗类型
    const isSuperBattle = p1IsSuper || p2IsSuper;
    const isClash = !isSuperBattle && p1Move === p2Move;
    
    if (isSuperBattle) {
        // 大招动画
        const winner = judgeRound(p1Move, p2Move, p1IsSuper, p2IsSuper).winner;
        const attacker = winner === 'p1' ? p1Char : p2Char;
        const side = winner === 'p1' ? 'left' : 'right';
        showSuperBattleAnimation(animationContainer, attacker, side, callback);
    } else if (isClash) {
        // 平手对撞动画
        showClashAnimation(animationContainer, p1Move, callback);
    } else {
        // 普通战斗动画 - 根据角色特色
        showNormalBattleAnimation(animationContainer, p1Move, p2Move, p1IsSuper, p2IsSuper, p1Char, p2Char, callback);
    }
}

function showSuperBattleAnimation(container, attacker, side, callback) {
    const superAnim = attacker.superAnim;
    const isLeft = side === 'left';
    
    // 创建大招名称显示
    const superName = document.createElement('div');
    superName.className = 'super-name';
    superName.textContent = superAnim.name;
    container.appendChild(superName);
    
    // 创建大招描述
    const superDesc = document.createElement('div');
    superDesc.className = 'super-desc-text';
    superDesc.textContent = superAnim.desc;
    container.appendChild(superDesc);
    
    // 创建角色大招特效
    const superEffect = document.createElement('div');
    superEffect.className = `super-attack ${superAnim.type} ${side}`;
    superEffect.textContent = superAnim.emoji;
    container.appendChild(superEffect);
    
    // 根据大招类型添加特效
    switch(superAnim.type) {
        case 'balloonBurst':
            createBalloonEffect(container, isLeft);
            break;
        case 'megaPunch':
            createPunchEffect(container, isLeft);
            break;
        case 'ninjaStorm':
            createNinjaEffect(container, isLeft);
            break;
        case 'elementalBlast':
            createElementalEffect(container);
            break;
        case 'bloodStorm':
            createBloodEffect(container, isLeft);
            break;
        case 'laserCannon':
            createLaserEffect(container, isLeft);
            break;
        case 'jackpot':
            createJackpotEffect(container);
            break;
        case 'earthquake':
            createEarthquakeEffect(container);
            break;
        default:
            // 默认能量波效果
            createDefaultSuperEffect(container, isLeft);
    }
    
    // 屏幕震动效果
    document.body.classList.add('screen-shake');
    
    setTimeout(() => {
        document.body.classList.remove('screen-shake');
        container.remove();
        callback();
    }, 2000);
}

// 气球爆炸特效
function createBalloonEffect(container, isLeft) {
    for (let i = 0; i < 5; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon-pop';
        balloon.textContent = '🎈';
        balloon.style.left = isLeft ? `${20 + i * 10}%` : `${80 - i * 10}%`;
        balloon.style.animationDelay = `${i * 0.1}s`;
        container.appendChild(balloon);
    }
    const burst = document.createElement('div');
    burst.className = 'burst-ring';
    container.appendChild(burst);
}

// 重拳特效
function createPunchEffect(container, isLeft) {
    const fist = document.createElement('div');
    fist.className = 'mega-fist';
    fist.textContent = '🥊';
    fist.style.left = isLeft ? '10%' : 'auto';
    fist.style.right = isLeft ? 'auto' : '10%';
    container.appendChild(fist);
    
    // 冲击波
    const shock = document.createElement('div');
    shock.className = 'shock-wave';
    container.appendChild(shock);
}

// 忍者分身特效
function createNinjaEffect(container, isLeft) {
    for (let i = 0; i < 3; i++) {
        const clone = document.createElement('div');
        clone.className = 'ninja-clone';
        clone.textContent = '🥷';
        clone.style.left = isLeft ? `${10 + i * 15}%` : `${75 - i * 15}%`;
        clone.style.top = `${30 + i * 15}%`;
        clone.style.animationDelay = `${i * 0.15}s`;
        container.appendChild(clone);
    }
    // 刀光
    const slash = document.createElement('div');
    slash.className = 'katana-slash';
    container.appendChild(slash);
}

// 元素特效
function createElementalEffect(container) {
    const elements = ['🔥', '❄️', '⚡'];
    elements.forEach((el, i) => {
        const orb = document.createElement('div');
        orb.className = 'element-orb';
        orb.textContent = el;
        orb.style.animationDelay = `${i * 0.2}s`;
        container.appendChild(orb);
    });
}

// 血族特效
function createBloodEffect(container, isLeft) {
    for (let i = 0; i < 6; i++) {
        const bat = document.createElement('div');
        bat.className = 'bat-swarm';
        bat.textContent = '🦇';
        bat.style.left = isLeft ? `${15 + Math.random() * 20}%` : `${65 + Math.random() * 20}%`;
        bat.style.top = `${20 + Math.random() * 60}%`;
        bat.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(bat);
    }
    const bloodMoon = document.createElement('div');
    bloodMoon.className = 'blood-moon';
    bloodMoon.textContent = '🌕';
    container.appendChild(bloodMoon);
}

// 激光炮特效
function createLaserEffect(container, isLeft) {
    const laser = document.createElement('div');
    laser.className = `laser-beam ${isLeft ? 'from-left' : 'from-right'}`;
    container.appendChild(laser);
    
    const charge = document.createElement('div');
    charge.className = 'laser-charge';
    charge.textContent = '⚡';
    charge.style.left = isLeft ? '15%' : 'auto';
    charge.style.right = isLeft ? 'auto' : '15%';
    container.appendChild(charge);
}

// 赌徒大奖特效
function createJackpotEffect(container) {
    const wheel = document.createElement('div');
    wheel.className = 'fortune-wheel';
    wheel.textContent = '🎯';
    container.appendChild(wheel);
    
    for (let i = 0; i < 5; i++) {
        const dice = document.createElement('div');
        dice.className = 'flying-dice';
        dice.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][Math.floor(Math.random() * 6)];
        dice.style.left = `${20 + Math.random() * 60}%`;
        dice.style.top = `${20 + Math.random() * 60}%`;
        dice.style.animationDelay = `${Math.random() * 0.3}s`;
        container.appendChild(dice);
    }
}

// 地震特效
function createEarthquakeEffect(container) {
    const crack = document.createElement('div');
    crack.className = 'ground-crack';
    container.appendChild(crack);
    
    for (let i = 0; i < 8; i++) {
        const rock = document.createElement('div');
        rock.className = 'flying-rock';
        rock.textContent = '🪨';
        rock.style.left = `${30 + Math.random() * 40}%`;
        rock.style.animationDelay = `${i * 0.1}s`;
        container.appendChild(rock);
    }
}

// 默认大招特效
function createDefaultSuperEffect(container, isLeft) {
    const wave1 = document.createElement('div');
    wave1.className = 'energy-wave left';
    container.appendChild(wave1);
    
    const wave2 = document.createElement('div');
    wave2.className = 'energy-wave right';
    container.appendChild(wave2);
    
    const impact = document.createElement('div');
    impact.className = 'impact-effect';
    impact.textContent = '💥';
    container.appendChild(impact);
}

function showClashAnimation(container, move, callback) {
    // 对撞效果
    const clash = document.createElement('div');
    clash.className = 'clash-effect';
    clash.textContent = MOVE_EMOJIS[move];
    container.appendChild(clash);
    
    // 火花效果
    for (let i = 0; i < 8; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        spark.style.animationDelay = `${i * 0.1}s`;
        spark.style.transform = `rotate(${i * 45}deg)`;
        container.appendChild(spark);
    }
    
    // 平局文字
    const drawText = document.createElement('div');
    drawText.className = 'draw-text';
    drawText.textContent = '平局！';
    container.appendChild(drawText);
    
    setTimeout(() => {
        container.remove();
        callback();
    }, 1200);
}

function showNormalBattleAnimation(container, p1Move, p2Move, p1IsSuper, p2IsSuper, p1Char, p2Char, callback) {
    const winner = judgeRound(p1Move, p2Move, false, false).winner;
    
    if (winner === 'p1') {
        // P1获胜，显示P1的攻击动画
        showCharacterAttack(container, p1Char, 'left', callback);
    } else if (winner === 'p2') {
        // P2获胜，显示P2的攻击动画
        showCharacterAttack(container, p2Char, 'right', callback);
    } else {
        // 平局，显示对撞
        showClashAnimation(container, p1Move, callback);
    }
}

function showCharacterAttack(container, character, side, callback) {
    const anim = character.attackAnim;
    const isLeft = side === 'left';
    
    // 创建攻击者
    const attacker = document.createElement('div');
    attacker.className = `character-attacker ${side} ${anim.type}`;
    attacker.textContent = anim.emoji;
    container.appendChild(attacker);
    
    // 创建攻击特效
    const effect = document.createElement('div');
    effect.className = `attack-effect ${anim.type}`;
    effect.textContent = getAttackEffectEmoji(anim.type);
    container.appendChild(effect);
    
    // 创建攻击描述
    const desc = document.createElement('div');
    desc.className = 'attack-desc';
    desc.textContent = anim.effect;
    container.appendChild(desc);
    
    // 添加伤害数字
    setTimeout(() => {
        const damage = document.createElement('div');
        damage.className = 'damage-number';
        damage.textContent = '💥';
        damage.style.right = isLeft ? '20%' : 'auto';
        damage.style.left = isLeft ? 'auto' : '20%';
        container.appendChild(damage);
    }, 400);
    
    setTimeout(() => {
        container.remove();
        callback();
    }, 1200);
}

function getAttackEffectEmoji(type) {
    const effects = {
        balloon: '💨',
        punch: '💥',
        slash: '⚔️',
        magic: '✨',
        bite: '🩸',
        melee: '🔨',
        roll: '🎲',
        shieldBash: '🛡️'
    };
    return effects[type] || '💥';
}

function judgeRound(p1Move, p2Move, p1Super, p2Super) {
    if (p1Super && p2Super) return { winner: 'draw', text: '大招对轰！平局！' };
    if (p1Super) return { winner: 'p1', text: '波波冲击命中！' };
    if (p2Super) return { winner: 'p2', text: '被波波冲击击中！' };
    
    if (p1Move === p2Move) return { winner: 'draw', text: '平局！' };
    if (MOVE_RULES[p1Move].beats === p2Move) return { winner: 'p1', text: '你赢了！' };
    return { winner: 'p2', text: '你输了！' };
}

function processRoundResult(result, p1IsSuper, p2IsSuper) {
    // 更新连击
    if (result.winner === 'p1') {
        GameState.p1Combo++;
        GameState.p2Combo = 0;
    } else if (result.winner === 'p2') {
        GameState.p2Combo++;
        GameState.p1Combo = 0;
    } else {
        GameState.p1Combo = 0;
        GameState.p2Combo = 0;
    }
    
    GameState.battleStats.maxCombo = Math.max(GameState.battleStats.maxCombo, GameState.p1Combo);
    
    // 计算伤害
    let p1Damage = 0, p2Damage = 0;
    
    if (GameState.mode === 'hp' || GameState.mode === 'pvp') {
        if (result.winner === 'p1') {
            p2Damage = calculateDamage('p1', p1IsSuper);
            GameState.battleStats.maxDamage = Math.max(GameState.battleStats.maxDamage, p2Damage);
            if (p2IsSuper) GameState.battleStats.superKill = true;
        } else if (result.winner === 'p2') {
            p1Damage = calculateDamage('p2', p2IsSuper);
        }
    }
    
    // 血族吸血
    if (result.winner === 'p1' && GameState.p1Character.id === 'vampire') {
        const heal = Math.floor(p2Damage * 0.2);
        GameState.p1HP = Math.min(GameState.p1Character.id === 'tank' ? 150 : 100, GameState.p1HP + heal);
        addLog(`🩸 血族吸取了${heal}点生命！`);
    }
    if (result.winner === 'p2' && GameState.p2Character.id === 'vampire') {
        const heal = Math.floor(p1Damage * 0.2);
        GameState.p2HP = Math.min(GameState.p2Character.id === 'tank' ? 150 : 100, GameState.p2HP + heal);
    }
    
    // 机甲受击充能
    if (p1Damage > 0 && GameState.p1Character.id === 'robot') {
        GameState.p1Bobo = Math.min(100, GameState.p1Bobo + 10);
    }
    if (p2Damage > 0 && GameState.p2Character.id === 'robot') {
        GameState.p2Bobo = Math.min(100, GameState.p2Bobo + 10);
    }
    
    GameState.p1HP = Math.max(0, GameState.p1HP - p1Damage);
    GameState.p2HP = Math.max(0, GameState.p2HP - p2Damage);
    
    GameState.battleStats.lowestHP = Math.min(GameState.battleStats.lowestHP, GameState.p1HP);
    
    chargeBobo(result);
    
    if (p1IsSuper) GameState.p1Bobo = 0;
    if (p2IsSuper) GameState.p2Bobo = 0;
    
    updateUI();
    showResult(result, p1Damage, p2Damage);
    
    setTimeout(() => checkGameEnd(), 1500);
}

function calculateDamage(winner, isSuper) {
    let baseDamage = 20;
    if (isSuper) baseDamage = 60;
    
    const char = winner === 'p1' ? GameState.p1Character : GameState.p2Character;
    const combo = winner === 'p1' ? GameState.p1Combo : GameState.p2Combo;
    
    if (char.id === 'fist' && isSuper) baseDamage *= 1.25;
    if (char.id === 'ninja') baseDamage *= (1 + combo * 0.15);
    if (char.id === 'tank') baseDamage *= 0.8;
    if (char.id === 'gambler' && Math.random() < 0.2) baseDamage *= 2;
    if (char.id === 'gambler' && isSuper) {
        baseDamage = 40 * (2 + Math.random() * 3); // x2~x5随机
    }
    
    return Math.floor(baseDamage);
}

function chargeBobo(result) {
    const chargeMap = { win: 20, lose: 5, draw: 10 };
    
    let p1Charge = chargeMap[result.winner === 'p1' ? 'win' : result.winner === 'p2' ? 'lose' : 'draw'];
    let p2Charge = chargeMap[result.winner === 'p2' ? 'win' : result.winner === 'p1' ? 'lose' : 'draw'];
    
    if (GameState.p1Character.id === 'bobo') p1Charge *= 1.2;
    if (GameState.p2Character.id === 'bobo') p2Charge *= 1.2;
    
    if (GameState.p1Character.id === 'mage' && result.winner === 'draw') p1Charge += 15;
    if (GameState.p2Character.id === 'mage' && result.winner === 'draw') p2Charge += 15;
    
    GameState.p1Bobo = Math.min(100, GameState.p1Bobo + p1Charge);
    GameState.p2Bobo = Math.min(100, GameState.p2Bobo + p2Charge);
}

function showResult(result, p1Damage, p2Damage) {
    const resultEl = document.getElementById('move-result');
    resultEl.textContent = result.text;
    resultEl.className = 'move-result ' + (result.winner === 'p1' ? 'win' : result.winner === 'p2' ? 'lose' : 'draw');
    
    const p1Name = GameState.isPVP ? '玩家1' : '你';
    const p2Name = GameState.isPVP ? '玩家2' : '对手';
    
    if (result.winner === 'p1') {
        GameState.p1Score++;
        addLog(`✅ 第${GameState.round}回合：${p1Name}获胜！${p2Damage > 0 ? '造成' + p2Damage + '点伤害！' : ''}`);
    } else if (result.winner === 'p2') {
        GameState.p2Score++;
        addLog(`❌ 第${GameState.round}回合：${p2Name}获胜！${p1Damage > 0 ? '造成' + p1Damage + '点伤害！' : ''}`);
    } else {
        addLog(`➖ 第${GameState.round}回合：${result.text}`);
    }
    
    GameState.round++;
    
    setTimeout(() => {
        document.getElementById('p1-move').textContent = '?';
        document.getElementById('p2-move').textContent = '?';
        document.getElementById('p1-move').classList.remove('reveal');
        document.getElementById('p2-move').classList.remove('reveal');
        resultEl.textContent = '';
        resultEl.className = 'move-result';
    }, 1200);
}

function checkGameEnd() {
    let winner = null;
    let reason = '';
    
    if (GameState.mode === 'standard') {
        if (GameState.p1Score >= 2) {
            winner = 'p1';
            reason = '先赢得2局';
        } else if (GameState.p2Score >= 2) {
            winner = 'p2';
            reason = '先赢得2局';
        }
    } else {
        if (GameState.p2HP <= 0) {
            winner = 'p1';
            reason = 'HP归零';
        } else if (GameState.p1HP <= 0) {
            winner = 'p2';
            reason = 'HP归零';
        }
    }
    
    if (winner) {
        GameState.gameOver = true;
        
        // 更新统计和成就
        if (!GameState.isPVP) {
            const won = winner === 'p1';
            const details = {
                characterId: GameState.p1Character.id,
                difficulty: GameState.difficulty,
                remainingHP: GameState.p1HP,
                lowestHP: 100 - GameState.battleStats.lowestHP,
                superKill: GameState.battleStats.superKill,
                maxCombo: GameState.battleStats.maxCombo
            };
            
            const newAchievements = updateStats(won, details);
            showResultScreen(winner, reason, newAchievements);
        } else {
            showResultScreen(winner, reason, []);
        }
    }
}

function showResultScreen(winner, reason, newAchievements) {
    const isP1Win = winner === 'p1';
    const emoji = isP1Win ? '🏆' : '💀';
    const title = GameState.isPVP ? (isP1Win ? '玩家1胜利！' : '玩家2胜利！') : (isP1Win ? '胜利！' : '失败！');
    const desc = GameState.isPVP ? `${isP1Win ? '玩家1' : '玩家2'}${reason}！` : (isP1Win ? `你${reason}，击败了对手！` : `你${reason}，请再接再厉！`);
    
    document.getElementById('result-emoji').textContent = emoji;
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-desc').textContent = desc;
    
    showEarnedAchievements(newAchievements);
    
    showScreen('result-screen');
}

function useItem(index) {
    if (GameState.itemsUsed[index]) return;
    
    const items = ['see', 'forceDraw', 'charge'];
    const item = items[index];
    
    if (item === 'see') {
        GameState.pendingItem = 'see';
        GameState.itemsUsed[index] = true;
        document.getElementById(`item${index + 1}`).classList.add('used');
        addLog('👁️ 使用了透视眼！下一回合可看到对手出招');
    } else if (item === 'forceDraw') {
        GameState.pendingItem = 'forceDraw';
        GameState.itemsUsed[index] = true;
        document.getElementById(`item${index + 1}`).classList.add('used');
        addLog('🔄 使用了换牌手！下一回合强制平局');
    } else if (item === 'charge') {
        GameState.p1Bobo = Math.min(100, GameState.p1Bobo + 30);
        GameState.itemsUsed[index] = true;
        document.getElementById(`item${index + 1}`).classList.add('used');
        addLog('⚡ 使用了充能器！波波槽+30');
        updateUI();
    }
}

function addLog(text) {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = 'battle-log-entry';
    entry.textContent = text;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function resetGame() {
    showScreen('mode-select');
}

window.onload = initGame;
