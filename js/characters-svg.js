// 波波拳 - 角色数据 (SVG 版本)

const CHARACTERS = [
    {
        id: 'bobo',
        name: '波波',
        title: '充气大师',
        avatar: 'char-bobo',
        desc: '波波拳创始人，充气速度更快',
        skill: '充气效率+20%',
        color: '#ff6b6b'
    },
    {
        id: 'fist',
        name: '铁拳',
        title: '格斗王者',
        avatar: 'char-fist',
        desc: '攻击力惊人，大招伤害更高',
        skill: '大招伤害+25%',
        color: '#e74c3c'
    },
    {
        id: 'ninja',
        name: '影',
        title: '瞬身忍者',
        avatar: 'char-ninja',
        desc: '身手敏捷，连击伤害递增',
        skill: '连击伤害+15%/层',
        color: '#2c3e50'
    },
    {
        id: 'mage',
        name: '魔导',
        title: '元素法师',
        avatar: 'char-mage',
        desc: '掌控元素，平局也能充能',
        skill: '平局获得15能量',
        color: '#9b59b6'
    },
    {
        id: 'vampire',
        name: '血族',
        title: '暗夜伯爵',
        avatar: 'char-vampire',
        desc: '攻击吸血，愈战愈勇',
        skill: '造成伤害的20%转化为HP',
        color: '#8e44ad'
    },
    {
        id: 'robot',
        name: '机甲',
        title: '钢铁战士',
        avatar: 'char-robot',
        desc: '防御坚固，受击充能',
        skill: '受到伤害时额外充能10%',
        color: '#7f8c8d'
    },
    {
        id: 'gambler',
        name: '赌徒',
        title: '命运之手',
        avatar: 'char-gambler',
        desc: '运气流，随机效果',
        skill: '每回合有20%概率暴击（伤害x2）',
        color: '#27ae60'
    },
    {
        id: 'tank',
        name: '巨像',
        title: '不动堡垒',
        avatar: 'char-tank',
        desc: '血量翻倍，皮糙肉厚',
        skill: '最大HP+50%，但伤害-20%',
        color: '#5d6d7e'
    }
];

// 出招图标
const MOVE_ICONS = {
    rock: 'move-rock',
    scissors: 'move-scissors',
    paper: 'move-paper'
};

// 大招图标
const SUPER_ICONS = {
    impact: 'super-impact',
    shield: 'super-shield',
    steal: 'super-steal'
};

// 获取角色数据
function getCharacter(id) {
    return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

// 生成 SVG 使用标签
function getSVGUse(id, width = 60, height = 60) {
    return `<svg width="${width}" height="${height}" class="char-svg"><use href="assets/characters.svg#${id}"/></svg>`;
}

// 生成角色选择卡片HTML
function generateCharacterCards() {
    const grid = document.getElementById('character-grid');
    grid.innerHTML = CHARACTERS.map(char => `
        <div class="character-card" data-character="${char.id}" onclick="selectCharacter('${char.id}')">
            <div class="character-avatar">${getSVGUse(char.avatar, 80, 80)}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-title">${char.title}</div>
            <div class="character-skill">${char.skill}</div>
        </div>
    `).join('');
}

function generatePVPCards() {
    const grid = document.getElementById('pvp-character-grid');
    grid.innerHTML = CHARACTERS.map(char => `
        <div class="character-card" data-character="${char.id}" onclick="selectP2Character('${char.id}')">
            <div class="character-avatar">${getSVGUse(char.avatar, 80, 80)}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-title">${char.title}</div>
            <div class="character-skill">${char.skill}</div>
        </div>
    `).join('');
}