// 波波拳 - 角色数据（专属大招版本）

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
            multiplier: 3.5,
            animClass: 'super-balloon'
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
            multiplier: 4,
            bonusEffect: 'stun',
            animClass: 'super-punch'
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
            desc: '召唤3个分身同时攻击，伤害x3',
            effect: 'dealDamage',
            multiplier: 3,
            hits: 3,
            animClass: 'super-ninja'
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
            multiplier: 3,
            bonusEffect: 'burn',
            burnDamage: 5,
            animClass: 'super-mage'
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
            multiplier: 2.5,
            bonusEffect: 'lifesteal',
            lifestealPercent: 50,
            animClass: 'super-vampire'
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
            multiplier: 3,
            bonusEffect: 'pierce',
            animClass: 'super-robot'
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
            desc: '伤害在x2~x5之间随机',
            effect: 'dealDamage',
            multiplierMin: 2,
            multiplierMax: 5,
            random: true,
            animClass: 'super-gambler'
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
            multiplier: 2.5,
            bonusEffect: 'stun',
            animClass: 'super-tank'
        }
    }
];

// 获取角色数据
function getCharacter(id) {
    return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

// 生成角色选择卡片HTML
function generateCharacterCards() {
    const grid = document.getElementById('character-grid');
    grid.innerHTML = CHARACTERS.map(char => `
        <div class="character-card" data-character="${char.id}" onclick="selectCharacter('${char.id}')">
            <div class="character-avatar">${char.avatar}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-title">${char.title}</div>
            <div class="character-skill">${char.skill}</div>
            <div class="character-super">${char.superMove.emoji} ${char.superMove.name}</div>
        </div>
    `).join('');
}

// 生成P2角色选择
function generatePVPCards() {
    const grid = document.getElementById('pvp-character-grid');
    grid.innerHTML = CHARACTERS.map(char => `
        <div class="character-card" data-character="${char.id}" onclick="selectP2Character('${char.id}')">
            <div class="character-avatar">${char.avatar}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-title">${char.title}</div>
            <div class="character-skill">${char.skill}</div>
            <div class="character-super">${char.superMove.emoji} ${char.superMove.name}</div>
        </div>
    `).join('');
}