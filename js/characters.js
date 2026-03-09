// 波波拳 - 角色数据（V5：大招+护盾系统，能量消耗降低至50）

const CHARACTERS = [
    {
        id: 'bobo',
        name: '波波',
        title: '充气大师',
        avatar: '🎈',
        desc: '波波拳创始人，充气速度更快',
        skill: '充气效率+20%',
        attackAnim: {
            emoji: '🎈',
            type: 'balloon',
            effect: '巨大气球爆炸冲击'
        },
        superMove: {
            name: '极限爆破',
            emoji: '💥',
            type: 'balloonBurst',
            desc: '释放全部充气能量，造成高额伤害',
            effect: 'dealDamage',
            multiplier: 2.5,
            animClass: 'super-balloon'
        },
        shieldMove: {
            name: '气球护盾',
            emoji: '🛡️',
            type: 'balloonShield',
            desc: '充气形成护盾，免疫本次伤害',
            effect: 'shield',
            animClass: 'shield-balloon'
        }
    },
    {
        id: 'fist',
        name: '铁拳',
        title: '格斗王者',
        avatar: '👊',
        desc: '攻击力惊人，大招伤害更高',
        skill: '伤害+25%',
        attackAnim: {
            emoji: '👊',
            type: 'punch',
            effect: '重拳直击对手'
        },
        superMove: {
            name: '究极铁拳',
            emoji: '🥊',
            type: 'megaPunch',
            desc: '蓄力一击，伤害翻倍并眩晕对手',
            effect: 'dealDamage',
            multiplier: 3,
            bonusEffect: 'stun',
            animClass: 'super-punch'
        },
        shieldMove: {
            name: '铁壁防御',
            emoji: '🛡️',
            type: 'ironShield',
            desc: '架起铁壁，免疫并反弹30%伤害',
            effect: 'shieldReflect',
            reflectPercent: 30,
            animClass: 'shield-iron'
        }
    },
    {
        id: 'ninja',
        name: '影',
        title: '瞬身忍者',
        avatar: '🥷',
        desc: '身手敏捷，连击伤害递增',
        skill: '连击伤害+15%/层',
        attackAnim: {
            emoji: '⚔️',
            type: 'slash',
            effect: '瞬身斩击'
        },
        superMove: {
            name: '影分身之术',
            emoji: '🌪️',
            type: 'ninjaStorm',
            desc: '召唤3个分身同时攻击，伤害x2',
            effect: 'dealDamage',
            multiplier: 2,
            hits: 3,
            animClass: 'super-ninja'
        },
        shieldMove: {
            name: '替身术',
            emoji: '💨',
            type: 'substitution',
            desc: '使用替身木承受伤害，瞬移反击',
            effect: 'shieldCounter',
            counterDamage: 15,
            animClass: 'shield-ninja'
        }
    },
    {
        id: 'mage',
        name: '魔导',
        title: '元素法师',
        avatar: '🧙',
        desc: '掌控元素，平局也能充能',
        skill: '平局获得15能量',
        attackAnim: {
            emoji: '🔮',
            type: 'magic',
            effect: '元素魔法弹'
        },
        superMove: {
            name: '元素风暴',
            emoji: '🔥',
            type: 'elementalBlast',
            desc: '召唤火冰雷三重元素，伤害+灼烧',
            effect: 'dealDamage',
            multiplier: 2.5,
            bonusEffect: 'burn',
            burnDamage: 5,
            animClass: 'super-mage'
        },
        shieldMove: {
            name: '元素护盾',
            emoji: '🔮',
            type: 'elementalShield',
            desc: '召唤元素护盾，吸收伤害并回血',
            effect: 'shieldHeal',
            healAmount: 20,
            animClass: 'shield-mage'
        }
    },
    {
        id: 'vampire',
        name: '血族',
        title: '暗夜伯爵',
        avatar: '🧛',
        desc: '攻击吸血，愈战愈勇',
        skill: '造成伤害的20%转化为HP',
        attackAnim: {
            emoji: '🦇',
            type: 'bite',
            effect: '蝙蝠群吸血攻击'
        },
        superMove: {
            name: '血月降临',
            emoji: '🩸',
            type: 'bloodStorm',
            desc: '召唤血月，造成伤害并吸血50%',
            effect: 'dealDamage',
            multiplier: 2,
            bonusEffect: 'lifesteal',
            lifestealPercent: 50,
            animClass: 'super-vampire'
        },
        shieldMove: {
            name: '血盾',
            emoji: '🩸',
            type: 'bloodShield',
            desc: '凝聚血盾，免疫伤害并回血20%',
            effect: 'shieldHeal',
            healAmount: 20,
            animClass: 'shield-vampire'
        }
    },
    {
        id: 'robot',
        name: '机甲',
        title: '钢铁战士',
        avatar: '🤖',
        desc: '防御坚固，受击充能',
        skill: '受到伤害时额外充能10%',
        attackAnim: {
            emoji: '🔧',
            type: 'melee',
            effect: '机械臂重击'
        },
        superMove: {
            name: '聚能激光',
            emoji: '🚀',
            type: 'laserCannon',
            desc: '发射高能激光，无视防御',
            effect: 'dealDamage',
            multiplier: 2.5,
            bonusEffect: 'pierce',
            animClass: 'super-robot'
        },
        shieldMove: {
            name: '能量护盾',
            emoji: '⚡',
            type: 'energyShield',
            desc: '启动能量护盾，免疫并充能30',
            effect: 'shieldCharge',
            chargeAmount: 30,
            animClass: 'shield-robot'
        }
    },
    {
        id: 'gambler',
        name: '赌徒',
        title: '命运之手',
        avatar: '🎲',
        desc: '运气流，随机效果',
        skill: '每回合有20%概率暴击（伤害x2）',
        attackAnim: {
            emoji: '🎲',
            type: 'roll',
            effect: '掷骰子决定伤害'
        },
        superMove: {
            name: '命运轮盘',
            emoji: '🎯',
            type: 'jackpot',
            desc: '伤害在x1.5~x4之间随机',
            effect: 'dealDamage',
            multiplierMin: 1.5,
            multiplierMax: 4,
            random: true,
            animClass: 'super-gambler'
        },
        shieldMove: {
            name: '幸运守护',
            emoji: '🍀',
            type: 'luckyShield',
            desc: '50%概率完全免疫，50%概率减半',
            effect: 'shieldRandom',
            animClass: 'shield-gambler'
        }
    },
    {
        id: 'tank',
        name: '巨像',
        title: '不动堡垒',
        avatar: '🛡️',
        desc: '血量翻倍，皮糙肉厚',
        skill: '最大HP+50%，但伤害-20%',
        attackAnim: {
            emoji: '🛡️',
            type: 'shieldBash',
            effect: '盾牌冲撞'
        },
        superMove: {
            name: '大地震击',
            emoji: '🌍',
            type: 'earthquake',
            desc: '重击地面，伤害并眩晕对手',
            effect: 'dealDamage',
            multiplier: 2,
            bonusEffect: 'stun',
            animClass: 'super-tank'
        },
        shieldMove: {
            name: '绝对防御',
            emoji: '🏰',
            type: 'absoluteDefense',
            desc: '进入绝对防御状态，免疫2回合',
            effect: 'shieldExtended',
            duration: 2,
            animClass: 'shield-tank'
        }
    }
];

// 能量消耗
const ENERGY_COST = 20; // 大招和护盾都消耗20能量

// 获取角色数据
function getCharacter(id) {
    return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

// 生成角色选择卡片HTML
function generateCharacterCards() {
    try {
        console.log('开始生成角色卡片...');
        const grid = document.getElementById('character-grid');
        if (!grid) {
            console.error('未找到 character-grid 元素');
            return;
        }
        console.log('找到 character-grid 元素');
        
        const html = CHARACTERS.map(char => {
            console.log('生成角色卡片:', char.id);
            return `
                <div class="character-card" data-character="${char.id}" onclick="selectCharacter('${char.id}')">
                    <div class="character-avatar">${char.avatar}</div>
                    <div class="character-name">${char.name}</div>
                    <div class="character-title">${char.title}</div>
                    <div class="character-skill">${char.skill}</div>
                    <div class="character-super">${char.superMove.emoji} ${char.superMove.name}</div>
                    <div class="character-shield">${char.shieldMove.emoji} ${char.shieldMove.name}</div>
                </div>
            `;
        }).join('');
        
        grid.innerHTML = html;
        console.log('角色卡片生成完成');
    } catch (e) {
        console.error('生成角色卡片时出错:', e);
    }
}

// 生成P2角色选择
function generatePVPCards() {
    try {
        console.log('开始生成PVP角色卡片...');
        const grid = document.getElementById('pvp-character-grid');
        if (!grid) {
            console.error('未找到 pvp-character-grid 元素');
            return;
        }
        console.log('找到 pvp-character-grid 元素');
        
        const html = CHARACTERS.map(char => {
            console.log('生成PVP角色卡片:', char.id);
            return `
                <div class="character-card" data-character="${char.id}" onclick="selectP2Character('${char.id}')">
                    <div class="character-avatar">${char.avatar}</div>
                    <div class="character-name">${char.name}</div>
                    <div class="character-title">${char.title}</div>
                    <div class="character-skill">${char.skill}</div>
                    <div class="character-super">${char.superMove.emoji} ${char.superMove.name}</div>
                    <div class="character-shield">${char.shieldMove.emoji} ${char.shieldMove.name}</div>
                </div>
            `;
        }).join('');
        
        grid.innerHTML = html;
        console.log('PVP角色卡片生成完成');
    } catch (e) {
        console.error('生成PVP角色卡片时出错:', e);
    }
}