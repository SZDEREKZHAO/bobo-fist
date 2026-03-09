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
    try {
        console.log('开始初始化游戏...');
        generateCharacterCards();
        console.log('角色卡片生成完成');
        generatePVPCards();
        console.log('PVP角色卡片生成完成');
        bindEvents();
        console.log('事件绑定完成');
    } catch (e) {
        console.error('初始化游戏时出错:', e);
    }
}

function bindEvents() {
    console.log('开始绑定事件...');
    const modeBtns = document.querySelectorAll('.mode-btn');
    console.log('找到 mode-btn 按钮数量:', modeBtns.length);
    
    modeBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            console.log('点击了模式按钮:', btn.dataset.mode);
            GameState.mode = btn.dataset.mode;
            GameState.isPVP = btn.dataset.mode === 'pvp';
            
            if (GameState.isPVP) {
                document.getElementById('p1-select-title').textContent = '玩家1选择角色';
            } else {
                document.getElementById('p1-select-title').textContent = '选择你的战士';
            }
            console.log('准备切换到 character-select 界面');
            showScreen('character-select');
            console.log('已切换到 character-select 界面');
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
            const isShield = btn.classList.contains('shield-btn');
            const move = btn.dataset.move;
            
            if (GameState.isPVP) {
                if (isShield) {
                    handlePVPShield(1);
                } else {
                    handlePVPMove(1, move || 'super', isSuper);
                }
            } else {
                if (isShield) {
                    useShield(1);
                } else {
                    playRound(move || 'super', isSuper);
                }
            }
        });
    });

    // P2控制
    document.querySelectorAll('[data-player="2"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (GameState.gameOver) return;
            if (!GameState.isPVP || GameState.pvpTurn !== 2) return;
            
            const isSuper = btn.classList.contains('super-btn');
            const isShield = btn.classList.contains('shield-btn');
            const move = btn.dataset.move;
            
            if (isShield) {
                handlePVPShield(2);
            } else {
                handlePVPMove(2, move || 'super', isSuper);
            }
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
    // AI决定是否使用大招
    const aiUseSuper = GameState.ai.chooseSuper(GameState.p2Bobo, GameState.p1Bobo, GameState.p2HP, GameState.p1HP);
    let p2Move, p2IsSuper = false;
    
    if (aiUseSuper) {
        // AI使用专属大招
        p2Move = 'super';
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
    const superMove = attacker.superMove;
    const isLeft = side === 'left';
    
    // 创建能量漩涡背景
    const vortex = document.createElement('div');
    vortex.className = 'energy-vortex';
    container.appendChild(vortex);
    
    // 创建超级冲击波
    const blast = document.createElement('div');
    blast.className = 'super-blast';
    container.appendChild(blast);
    
    // 创建大招名称显示
    const superName = document.createElement('div');
    superName.className = 'super-name';
    superName.textContent = superMove.name;
    superName.style.fontSize = '3em';
    superName.style.textShadow = '0 0 30px #ff6b35, 0 0 60px #ffd700';
    container.appendChild(superName);
    
    // 创建大招描述
    const superDesc = document.createElement('div');
    superDesc.className = 'super-desc-text';
    superDesc.textContent = superMove.desc;
    container.appendChild(superDesc);
    
    // 创建角色大招特效
    const superEffect = document.createElement('div');
    superEffect.className = `super-attack ${superMove.type} ${side}`;
    superEffect.textContent = superMove.emoji;
    superEffect.style.fontSize = '12em';
    container.appendChild(superEffect);
    
    // 添加粒子爆炸效果
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle-burst';
        const angle = (i / 20) * Math.PI * 2;
        const distance = 200 + Math.random() * 200;
        particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
        particle.style.left = '50%';
        particle.style.top = '40%';
        particle.style.animationDelay = `${Math.random() * 0.3}s`;
        particle.style.background = `hsl(${Math.random() * 60 + 10}, 100%, 50%)`;
        container.appendChild(particle);
    }
    
    // 根据大招类型添加特效
    switch(superMove.type) {
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
            // 添加闪电链
            for (let i = 0; i < 5; i++) {
                const lightning = document.createElement('div');
                lightning.className = 'lightning-chain';
                lightning.style.left = `${30 + i * 10}%`;
                lightning.style.top = '20%';
                lightning.style.animationDelay = `${i * 0.1}s`;
                container.appendChild(lightning);
            }
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

// 使用护盾（单人模式）
function useShield(player) {
    if (player === 1 && GameState.p1Bobo < ENERGY_COST) return;
    if (player === 2 && GameState.p2Bobo < ENERGY_COST) return;
    
    const character = player === 1 ? GameState.p1Character : GameState.p2Character;
    const shieldMove = character.shieldMove;
    
    // 消耗能量
    if (player === 1) {
        GameState.p1Bobo -= ENERGY_COST;
    } else {
        GameState.p2Bobo -= ENERGY_COST;
    }
    
    // 播放护盾动画
    showShieldAnimation(player, shieldMove);
    
    // 应用护盾效果
    applyShieldEffect(player, shieldMove);
    
    addLog(`${character.avatar} ${character.name}使用了${shieldMove.name}！`);
    
    // AI回合
    if (player === 1 && !GameState.isPVP) {
        // AI选择出招
        setTimeout(() => {
            const aiUseSuper = GameState.ai.chooseSuper(GameState.p2Bobo, GameState.p1Bobo, GameState.p2HP, GameState.p1HP);
            if (aiUseSuper) {
                // AI使用大招
                const p1Move = GameState.ai.chooseMove(GameState.p1Bobo, GameState.p2Bobo);
                resolveAIAttack(p1Move, true);
            } else {
                const p1Move = GameState.ai.chooseMove(GameState.p1Bobo, GameState.p2Bobo);
                resolveAIAttack(p1Move, false);
            }
        }, 1500);
    }
    
    updateUI();
}

// 处理PVP护盾
function handlePVPShield(player) {
    if (player === 1 && GameState.p1Bobo < ENERGY_COST) return;
    if (player === 2 && GameState.p2Bobo < ENERGY_COST) return;
    
    const character = player === 1 ? GameState.p1Character : GameState.p2Character;
    const shieldMove = character.shieldMove;
    
    // 消耗能量
    if (player === 1) {
        GameState.p1Bobo -= ENERGY_COST;
    } else {
        GameState.p2Bobo -= ENERGY_COST;
    }
    
    // 播放护盾动画
    showShieldAnimation(player, shieldMove);
    
    addLog(`${character.avatar} ${character.name}使用了${shieldMove.name}！`);
    
    updateUI();
}

// 播放护盾动画
function showShieldAnimation(player, shieldMove) {
    const container = document.createElement('div');
    container.className = 'battle-animation';
    document.body.appendChild(container);
    
    const isLeft = player === 1;
    
    // 能量漩涡背景
    const vortex = document.createElement('div');
    vortex.className = 'energy-vortex';
    vortex.style.borderColor = '#4ecdc4';
    vortex.style.borderRightColor = '#60a5fa';
    container.appendChild(vortex);
    
    // 护盾特效
    const shield = document.createElement('div');
    shield.className = `shield-effect ${shieldMove.animClass} ${isLeft ? 'left' : 'right'}`;
    shield.textContent = shieldMove.emoji;
    container.appendChild(shield);
    
    // 护盾名称
    const name = document.createElement('div');
    name.className = 'shield-name-text';
    name.textContent = shieldMove.name;
    container.appendChild(name);
    
    // 护盾光环
    const aura = document.createElement('div');
    aura.className = 'shield-aura';
    aura.style.left = isLeft ? '20%' : 'auto';
    aura.style.right = isLeft ? 'auto' : '20%';
    container.appendChild(aura);
    
    // 添加粒子效果
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle-burst';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = '#4ecdc4';
        const angle = (i / 12) * Math.PI * 2;
        const distance = 150;
        particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
        particle.style.left = isLeft ? '25%' : '75%';
        particle.style.top = '40%';
        particle.style.animationDelay = `${i * 0.05}s`;
        container.appendChild(particle);
    }
    
    setTimeout(() => {
        container.remove();
    }, 1800);
}

// 播放护盾格挡动画（当护盾挡住攻击时）
function showShieldBlockAnimation(player, shieldMove) {
    const container = document.createElement('div');
    container.className = 'battle-animation';
    document.body.appendChild(container);
    
    const isLeft = player === 1;
    
    // 格挡文字
    const blockText = document.createElement('div');
    blockText.className = 'block-text';
    blockText.textContent = '格挡！';
    container.appendChild(blockText);
    
    // 护盾格挡动画
    const shield = document.createElement('div');
    shield.className = `shield-block ${isLeft ? 'left' : 'right'}`;
    shield.textContent = shieldMove?.emoji || '🛡️';
    shield.style.left = isLeft ? '20%' : 'auto';
    shield.style.right = isLeft ? 'auto' : '20%';
    shield.style.top = '30%';
    container.appendChild(shield);
    
    // 格挡火花
    for (let i = 0; i < 8; i++) {
        const spark = document.createElement('div');
        spark.className = 'block-spark';
        spark.style.setProperty('--angle', `${i * 45}deg`);
        spark.style.left = isLeft ? '30%' : '70%';
        spark.style.top = '40%';
        spark.style.animationDelay = `${i * 0.05}s`;
        container.appendChild(spark);
    }
    
    // 护盾光环扩散
    const aura = document.createElement('div');
    aura.className = 'shield-aura';
    aura.style.left = isLeft ? '20%' : 'auto';
    aura.style.right = isLeft ? 'auto' : '20%';
    aura.style.border = '3px solid #4ecdc4';
    aura.style.borderRadius = '50%';
    container.appendChild(aura);
    
    setTimeout(() => {
        container.remove();
    }, 1200);
}

// 应用护盾效果
function applyShieldEffect(player, shieldMove) {
    switch(shieldMove.effect) {
        case 'shield':
            // 基础护盾 - 免疫一次伤害
            addLog(`🛡️ 护盾生效，免疫下一次伤害！`);
            break;
        case 'shieldReflect':
            // 反弹护盾
            addLog(`🛡️ 铁壁防御生效，将反弹${shieldMove.reflectPercent}%伤害！`);
            break;
        case 'shieldCounter':
            // 反击护盾
            addLog(`💨 替身术生效，将瞬移反击！`);
            break;
        case 'shieldHeal':
            // 回血护盾
            const heal = shieldMove.healAmount;
            if (player === 1) {
                GameState.p1HP = Math.min(100, GameState.p1HP + heal);
            } else {
                GameState.p2HP = Math.min(100, GameState.p2HP + heal);
            }
            addLog(`💚 护盾恢复${heal}点生命！`);
            break;
        case 'shieldCharge':
            // 充能护盾
            const charge = shieldMove.chargeAmount;
            if (player === 1) {
                GameState.p1Bobo = Math.min(100, GameState.p1Bobo + charge);
            } else {
                GameState.p2Bobo = Math.min(100, GameState.p2Bobo + charge);
            }
            addLog(`⚡ 护盾充能+${charge}！`);
            break;
        case 'shieldRandom':
            // 随机护盾
            addLog(`🍀 幸运守护生效，概率免疫伤害！`);
            break;
        case 'shieldExtended':
            // 持续护盾
            addLog(`🏰 绝对防御生效，持续${shieldMove.duration}回合！`);
            break;
    }
}

// AI攻击结算
function resolveAIAttack(p1Move, aiUseSuper) {
    // 保存出招结果
    GameState.pendingBattle = {
        p1Move, p2Move: 'super',
        p1IsSuper: false, p2IsSuper: aiUseSuper
    };
    
    // 显示战斗动画
    showBattleAnimation(p1Move, aiUseSuper ? 'super' : p1Move, false, aiUseSuper, GameState.p1Character, GameState.p2Character, () => {
        const result = judgeRound(p1Move, aiUseSuper ? 'super' : p1Move, false, aiUseSuper);
        processRoundResult(result, false, aiUseSuper);
        
        if (!aiUseSuper) GameState.ai.recordMove(p1Move);
        
        updateUI();
    });
}

function judgeRound(p1Move, p2Move, p1Super, p2Super) {
    if (p1Super && p2Super) return { winner: 'draw', text: '大招对轰！平局！' };
    
    if (p1Super) {
        const superName = GameState.p1Character?.superMove?.name || '大招';
        return { winner: 'p1', text: `${superName}命中！` };
    }
    
    if (p2Super) {
        const superName = GameState.p2Character?.superMove?.name || '大招';
        return { winner: 'p2', text: `被${superName}击中！` };
    }
    
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
            // 应用大招特效
            if (p1IsSuper) {
                p2Damage = applySuperEffect('p1', p2Damage);
            }
            GameState.battleStats.maxDamage = Math.max(GameState.battleStats.maxDamage, p2Damage);
            if (p2IsSuper) GameState.battleStats.superKill = true;
        } else if (result.winner === 'p2') {
            p1Damage = calculateDamage('p2', p2IsSuper);
            // 应用大招特效
            if (p2IsSuper) {
                p1Damage = applySuperEffect('p2', p1Damage);
            }
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
    
    const char = winner === 'p1' ? GameState.p1Character : GameState.p2Character;
    const combo = winner === 'p1' ? GameState.p1Combo : GameState.p2Combo;
    const superMove = char.superMove;
    
    if (isSuper) {
        // 使用专属大招计算伤害
        let multiplier = superMove.multiplier || 3;
        
        // 赌徒特殊处理 - 随机伤害
        if (superMove.random) {
            multiplier = superMove.multiplierMin + Math.random() * (superMove.multiplierMax - superMove.multiplierMin);
        }
        
        baseDamage = 40 * multiplier; // 基础40伤害 * 倍率
        
        // 忍者连击加成
        if (char.id === 'ninja' && superMove.hits) {
            baseDamage *= superMove.hits;
        }
        
        // 铁拳伤害加成
        if (char.id === 'fist') {
            baseDamage *= 1.25;
        }
        
        // 巨像伤害降低
        if (char.id === 'tank') {
            baseDamage *= 0.8;
        }
    } else {
        // 普通攻击
        if (char.id === 'ninja') baseDamage *= (1 + combo * 0.15);
        if (char.id === 'tank') baseDamage *= 0.8;
        if (char.id === 'gambler' && Math.random() < 0.2) baseDamage *= 2;
    }
    
    return Math.floor(baseDamage);
}

// 处理大招特殊效果
function applySuperEffect(winner, damage) {
    const char = winner === 'p1' ? GameState.p1Character : GameState.p2Character;
    const superMove = char.superMove;
    const target = winner === 'p1' ? 'p2' : 'p1';
    
    if (!superMove.bonusEffect) return damage;
    
    switch(superMove.bonusEffect) {
        case 'stun':
            // 眩晕效果 - 下回合对手不能充能（通过标记实现）
            addLog(`⚡ ${char.name}的${superMove.name}眩晕了对手！`);
            break;
            
        case 'lifesteal':
            // 吸血效果
            const healAmount = Math.floor(damage * (superMove.lifestealPercent || 30) / 100);
            if (winner === 'p1') {
                GameState.p1HP = Math.min(100, GameState.p1HP + healAmount);
            } else {
                GameState.p2HP = Math.min(100, GameState.p2HP + healAmount);
            }
            addLog(`🩸 ${char.name}吸取了${healAmount}点生命！`);
            break;
            
        case 'burn':
            // 灼烧效果 - 后续实现
            addLog(`🔥 ${char.name}的${superMove.name}灼烧了对手！`);
            break;
            
        case 'pierce':
            // 破甲效果 - 无视防御（已体现在伤害计算中）
            addLog(`💥 ${char.name}的${superMove.name}无视防御！`);
            break;
    }
    
    return damage;
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
