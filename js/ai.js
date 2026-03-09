// 波波拳 - AI对手逻辑

class BoboAI {
    constructor(difficulty) {
        this.difficulty = difficulty; // 'easy', 'normal', 'hard'
        this.moveHistory = []; // 记录玩家出招历史
        this.pattern = { rock: 0, scissors: 0, paper: 0 };
        this.superThreshold = 100;
    }

    // 记录玩家动作
    recordMove(playerMove) {
        this.moveHistory.push(playerMove);
        this.pattern[playerMove]++;
        
        // 只保留最近10次
        if (this.moveHistory.length > 10) {
            const old = this.moveHistory.shift();
            this.pattern[old]--;
        }
    }

    // 预测玩家下一步
    predictMove() {
        const total = this.moveHistory.length;
        if (total === 0) return null;

        // 找出玩家最常出的
        const maxCount = Math.max(this.pattern.rock, this.pattern.scissors, this.pattern.paper);
        
        if (this.pattern.rock === maxCount) return 'rock';
        if (this.pattern.scissors === maxCount) return 'scissors';
        if (this.pattern.paper === maxCount) return 'paper';
        
        return null;
    }

    // 选择普通出招
    chooseMove(playerBobo, aiBobo) {
        const moves = ['rock', 'scissors', 'paper'];
        
        switch (this.difficulty) {
            case 'easy':
                // 新手：随机出招，偶尔犯错
                if (Math.random() < 0.3) {
                    // 30%概率随机
                    return moves[Math.floor(Math.random() * 3)];
                }
                // 70%概率出能赢的，但可能选错
                return this.getCounterMove(this.predictMove()) || moves[Math.floor(Math.random() * 3)];

            case 'normal':
                // 普通：根据玩家习惯调整
                const predicted = this.predictMove();
                if (predicted && Math.random() < 0.6) {
                    // 60%概率针对玩家习惯
                    return this.getCounterMove(predicted);
                }
                // 40%随机
                return moves[Math.floor(Math.random() * 3)];

            case 'hard':
                // 困难：读招+心理博弈
                const prediction = this.predictMove();
                
                // 如果玩家波波槽满了，可能放大招，AI考虑出招策略
                if (playerBobo >= 100) {
                    // 玩家可能用波波冲击（伤害x3），AI考虑用护盾类大招应对
                    // 但这里只是普通出招，所以随机应变
                }
                
                if (prediction) {
                    // 80%概率读招
                    if (Math.random() < 0.8) {
                        return this.getCounterMove(prediction);
                    }
                    // 20%概率反读招（出被克的，赌玩家变招）
                    return this.getLosingMove(prediction);
                }
                
                return moves[Math.floor(Math.random() * 3)];

            default:
                return moves[Math.floor(Math.random() * 3)];
        }
    }

    // 选择大招
    chooseSuper(aiBobo, playerBobo, aiHP, playerHP) {
        if (aiBobo < 100) return null;

        const supers = ['impact', 'shield', 'steal'];
        
        switch (this.difficulty) {
            case 'easy':
                // 新手：随机放大招
                return supers[Math.floor(Math.random() * 3)];

            case 'normal':
                // 普通：根据血量判断
                if (aiHP < 30) {
                    // 血量低，优先护盾
                    return Math.random() < 0.6 ? 'shield' : 'impact';
                }
                if (playerBobo >= 80) {
                    // 玩家能量高，偷取
                    return Math.random() < 0.5 ? 'steal' : 'impact';
                }
                return 'impact';

            case 'hard':
                // 困难：最优策略
                if (aiHP < 25) {
                    // 危急时刻，护盾保命
                    return 'shield';
                }
                if (playerBobo >= 100) {
                    // 玩家有大招，偷取或护盾
                    return playerHP > 50 ? 'steal' : 'shield';
                }
                if (playerHP <= 30) {
                    // 玩家残血，冲击收割
                    return 'impact';
                }
                if (aiHP > playerHP + 20) {
                    // 血量优势，偷取能量滚雪球
                    return 'steal';
                }
                return 'impact';

            default:
                return 'impact';
        }
    }

    // 获取克制招
    getCounterMove(move) {
        const counters = {
            rock: 'paper',
            scissors: 'rock',
            paper: 'scissors'
        };
        return counters[move];
    }

    // 获取被克招（用于心理博弈）
    getLosingMove(move) {
        const losing = {
            rock: 'scissors',
            scissors: 'paper',
            paper: 'rock'
        };
        return losing[move];
    }

    // 重置
    reset() {
        this.moveHistory = [];
        this.pattern = { rock: 0, scissors: 0, paper: 0 };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BoboAI;
}
