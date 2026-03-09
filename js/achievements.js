// 波波拳 - 成就系统

const ACHIEVEMENTS = [
    {
        id: 'first_win',
        name: '初出茅庐',
        desc: '赢得第一场比赛',
        icon: '🌟',
        condition: (stats) => stats.wins >= 1
    },
    {
        id: 'win_streak_3',
        name: '连胜将军',
        desc: '连续赢得3场比赛',
        icon: '🔥',
        condition: (stats) => stats.maxWinStreak >= 3
    },
    {
        id: 'win_streak_5',
        name: '不败传说',
        desc: '连续赢得5场比赛',
        icon: '👑',
        condition: (stats) => stats.maxWinStreak >= 5
    },
    {
        id: 'super_kill',
        name: '一击必杀',
        desc: '用波波冲击击败对手',
        icon: '💥',
        condition: (stats) => stats.superKills >= 1
    },
    {
        id: 'perfect_win',
        name: '完美胜利',
        desc: '满血击败对手',
        icon: '💎',
        condition: (stats) => stats.perfectWins >= 1
    },
    {
        id: 'comeback',
        name: '绝地反击',
        desc: 'HP低于10时反败为胜',
        icon: '🔄',
        condition: (stats) => stats.comebacks >= 1
    },
    {
        id: 'all_characters',
        name: '角色大师',
        desc: '使用所有角色各赢一场',
        icon: '🎭',
        condition: (stats) => Object.keys(stats.characterWins).length >= 8
    },
    {
        id: 'hard_mode_win',
        name: '硬核玩家',
        desc: '在困难模式下获胜',
        icon: '💀',
        condition: (stats) => stats.hardModeWins >= 1
    },
    {
        id: 'combo_master',
        name: '连击大师',
        desc: '达成5层连击',
        icon: '⚡',
        condition: (stats) => stats.maxCombo >= 5
    },
    {
        id: 'veteran',
        name: '波波拳 veteran',
        desc: '累计进行50场比赛',
        icon: '🏆',
        condition: (stats) => stats.totalGames >= 50
    }
];

// 统计数据
let GameStats = {
    totalGames: 0,
    wins: 0,
    losses: 0,
    currentWinStreak: 0,
    maxWinStreak: 0,
    superKills: 0,
    perfectWins: 0,
    comebacks: 0,
    characterWins: {},
    hardModeWins: 0,
    maxCombo: 0,
    unlockedAchievements: []
};

// 从localStorage加载
function loadStats() {
    const saved = localStorage.getItem('boboFistStats');
    if (saved) {
        GameStats = JSON.parse(saved);
    }
}

// 保存到localStorage
function saveStats() {
    localStorage.setItem('boboFistStats', JSON.stringify(GameStats));
}

// 更新统计
function updateStats(won, details) {
    GameStats.totalGames++;
    
    if (won) {
        GameStats.wins++;
        GameStats.currentWinStreak++;
        GameStats.maxWinStreak = Math.max(GameStats.maxWinStreak, GameStats.currentWinStreak);
        
        // 记录角色胜利
        const charId = details.characterId;
        if (!GameStats.characterWins[charId]) {
            GameStats.characterWins[charId] = 0;
        }
        GameStats.characterWins[charId]++;
        
        // 困难模式
        if (details.difficulty === 'hard') {
            GameStats.hardModeWins++;
        }
        
        // 完美胜利
        if (details.remainingHP === 100) {
            GameStats.perfectWins++;
        }
        
        // 绝地反击
        if (details.lowestHP <= 10) {
            GameStats.comebacks++;
        }
        
        // 大招击杀
        if (details.superKill) {
            GameStats.superKills++;
        }
        
        // 最大连击
        GameStats.maxCombo = Math.max(GameStats.maxCombo, details.maxCombo);
    } else {
        GameStats.losses++;
        GameStats.currentWinStreak = 0;
    }
    
    saveStats();
    return checkAchievements();
}

// 检查成就
function checkAchievements() {
    const newlyUnlocked = [];
    
    ACHIEVEMENTS.forEach(ach => {
        if (!GameStats.unlockedAchievements.includes(ach.id)) {
            if (ach.condition(GameStats)) {
                GameStats.unlockedAchievements.push(ach.id);
                newlyUnlocked.push(ach);
            }
        }
    });
    
    if (newlyUnlocked.length > 0) {
        saveStats();
    }
    
    return newlyUnlocked;
}

// 显示成就界面
function showAchievements() {
    const list = document.getElementById('achievements-list');
    const unlocked = GameStats.unlockedAchievements;
    
    // 更新统计
    document.getElementById('total-games').textContent = GameStats.totalGames;
    document.getElementById('total-wins').textContent = GameStats.wins;
    document.getElementById('achievements-unlocked').textContent = `${unlocked.length}/${ACHIEVEMENTS.length}`;
    
    list.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        return `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${isUnlocked ? ach.icon : '🔒'}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                </div>
                ${isUnlocked ? '<span class="achievement-badge">✓</span>' : ''}
            </div>
        `;
    }).join('');
    
    showScreen('achievements-screen');
}

// 显示获得的成就
function showEarnedAchievements(achievements) {
    const container = document.getElementById('achievements-earned');
    if (achievements.length === 0) return;
    
    container.innerHTML = `
        <div class="earned-title">🏅 解锁新成就！</div>
        <div class="earned-list">
            ${achievements.map(ach => `
                <div class="earned-item">
                    <span class="earned-icon">${ach.icon}</span>
                    <span class="earned-name">${ach.name}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// 重置统计（调试用）
function resetStats() {
    GameStats = {
        totalGames: 0,
        wins: 0,
        losses: 0,
        currentWinStreak: 0,
        maxWinStreak: 0,
        superKills: 0,
        perfectWins: 0,
        comebacks: 0,
        characterWins: {},
        hardModeWins: 0,
        maxCombo: 0,
        unlockedAchievements: []
    };
    saveStats();
}

// 初始化时加载
loadStats();
