// 波波拳 - 角色数据

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
        superAnim: {
            emoji: '💥',
            type: 'balloonBurst',
            name: '超级气球爆破',
            desc: '充气到极限后爆炸，造成范围伤害'
        }
    },
    {
        id: 'fist',
        name: '铁拳',
        title: '格斗王者',
        avatar: '👊',
        desc: '攻击力惊人，大招伤害更高',
        skill: '大招伤害+25%',
        attackAnim: {
            emoji: '👊',
            type: 'punch',
            effect: '重拳直击对手'
        },
        superAnim: {
            emoji: '🥊',
            type: 'megaPunch',
            name: '究极铁拳',
            desc: '蓄力重拳，一击必杀'
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
        superAnim: {
            emoji: '🌪️',
            type: 'ninjaStorm',
            name: '影分身斩',
            desc: '分出多个影分身同时斩击'
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
        superAnim: {
            emoji: '🔥',
            type: 'elementalBlast',
            name: '元素爆裂',
            desc: '召唤火、冰、雷三重元素攻击'
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
        superAnim: {
            emoji: '🩸',
            type: 'bloodStorm',
            name: '血月降临',
            desc: '召唤血月，大量吸血恢复'
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
        superAnim: {
            emoji: '🚀',
            type: 'laserCannon',
            name: '聚能激光炮',
            desc: '充能发射高能激光束'
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
        superAnim: {
            emoji: '🎯',
            type: 'jackpot',
            name: '命运轮盘',
            desc: '转动命运之轮，随机巨额伤害'
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
        superAnim: {
            emoji: '🌍',
            type: 'earthquake',
            name: '大地震击',
            desc: '重击地面造成地震伤害'
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
        </div>
    `).join('');
}
