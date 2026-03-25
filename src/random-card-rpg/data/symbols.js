// src/random-card-rpg/data/symbols.js

export const SYMBOLS = [
  { id: 'coin', name: '🪙 코인', rarity: 'common', gold: 1 },
  { id: 'slime', name: '💧 슬라임', rarity: 'common', effect: '7번 스핀마다 슬라임을 추가', lastWord: '파괴되면 골드 4개를 제공' },
  { id: 'zenaris_bless', name: '✨ 제나리스의 축복', rarity: 'common', gold: 1, effect: '희귀 특별 전설 등급의 아이템을 찾을 확률이 1.1배 증가' },
  { id: 'zenaris_curse', name: '💀 제나리스의 저주', rarity: 'common', gold: 2, effect: '스핀 2번당 골드 -1개를 제공' },
  { id: 'fairy', name: '🧚 요정', rarity: 'common', adjacent: '(축복),(대축복)마다 골드 1개를 제공' },
  { id: 'blessing', name: '💫 축복', rarity: 'common', adjacent: '(프리스트)마다 신앙 스택이 누적', effect: '신앙 스택이 2번 쌓이면 (제나리스의 축복), (아그네스의 축복), (에키드나의 축복)을 랜덤으로 1개 추가 후 자신을 파괴' },
  { id: 'dragon_egg', name: '🥚 용의 알', rarity: 'common', gold: 1, effect: '스핀마다 7% 확률로 (새끼 용)으로 진화' },
  { id: 'tomb', name: '🪦 묘', rarity: 'common', gold: 1, lastWord: '파괴되면 (언데드)를 추가' },
  { id: 'monastery', name: '⛪ 수도원', rarity: 'common', gold: 1, adjacent: '(제나리스의 축복)마다 축복 스택이 누적', effect: '축복 스택이 4번 쌓이면 자신을 파괴', lastWord: '파괴되면 골드 6개를 제공' },
  { id: 'half_elf', name: '🧝 하프 엘프', rarity: 'common', gold: 1 },
  { id: 'prayer', name: '🙏 기도', rarity: 'common', effect: '스핀마다 1% 확률로 (가인의 축복)으로 진화' },
  { id: 'priest', name: '🧙 프리스트', rarity: 'common', gold: 1, destroy: '(슬라임), (이단자)', effect: '7번 스핀마다 (축복)을 추가', isObtainable: false },
  { id: 'heretic', name: '👺 이단자', rarity: 'common', effect: '7번 스핀마다 (이단자)를 추가', lastWord: '파괴되면 골드 4개를 제공' },
  { id: 'tempted_priest', name: '💔 유혹된 프리스트', rarity: 'common', gold: 5, effect: '3번 스핀 후 자신을 파괴', lastWord: '파괴되면 (프리스트)를 추가', isObtainable: false },
  { id: 'high_potion', name: '🧪 하이 포션', rarity: 'common', effect: '10번 스핀 후 자신을 파괴', lastWord: '파괴되면 일반 유물 1개를 랜덤으로 추가' },
  { id: 'ghost', name: '👻 고스트', rarity: 'common', gold: 2, effect: '3번 스핀 후 자신을 파괴' },
  { id: 'heal', name: '🩹 힐', rarity: 'common', gold: 1, adjacent: '(프리스트)마다 힐 스택이 누적', effect: '힐 스택이 2번 쌓이면 자신을 파괴, 25% 확률로 골드 1개를 제공', lastWord: '파괴되면 골드 4개를 제공' },
  { id: 'believer', name: '🛐 신자', rarity: 'common', gold: 1 },
  { id: 'vampire_essence', name: '🩸 뱀파이어의 정수', rarity: 'common', gold: 2, effect: '3번 스핀 후 자신을 파괴', lastWord: '파괴되면 골드 4개를 제공', isObtainable: false },
  { id: 'imp', name: '👿 임프', rarity: 'common', gold: 1 },

  { id: 'great_bless', name: '🌟 대축복', rarity: 'rare', gold: 1, effect: '5번 스핀 후 자신을 파괴', lastWord: '파괴되면 (축복) 2개를 추가' },
  { id: 'agnes_curse', name: '🔥 아그네스의 저주', rarity: 'rare', gold: 3, effect: '스핀마다 20% 확률로 (코인)을 추가' },
  { id: 'baby_dragon', name: '🦎 새끼 용', rarity: 'rare', gold: 2, effect: '스핀마다 7% 확률로 (용)으로 진화' },
  { id: 'echidna_curse', name: '🐍 에키드나의 저주', rarity: 'rare', gold: 3, effect: '스핀마다 10% 확률로 골드 -4개를 제공' },
  { id: 'cemetery', name: '⚰️ 공동 묘지', rarity: 'rare', gold: 1, lastWord: '파괴되면 (언데드) 2개를 추가' },
  { id: 'abbot', name: '🧔 수도원장', rarity: 'rare', gold: 2, destroy: '(묘), (공동 묘지), (스켈레톤)' },
  { id: 'undead', name: '🧟 언데드', rarity: 'rare', gold: 3, effect: '3번 스핀 후 자신을 파괴' },
  { id: 'agnes_bless', name: '☀️ 아그네스의 축복', rarity: 'rare', gold: 1, adjacent: '(아그네스의 축복)당 골드 1개를 제공' },
  { id: 'echidna_bless', name: '🌿 에키드나의 축복', rarity: 'rare', gold: 2, effect: '스핀마다 10% 확률로 골드 3개를 제공' },
  { id: 'gold_dragon_egg', name: '🪺 황금 용의 알', rarity: 'rare', gold: 1, effect: '25번 스핀 후 (황금 새끼 용)으로 진화' },
  { id: 'dwarf', name: '🧔‍♂️ 드워프', rarity: 'rare', gold: 2, effect: '스핀마다 10% 확률로 (레모네이드통)을 추가' },
  { id: 'elf', name: '🧝‍♀️ 엘프', rarity: 'rare', gold: 2, effect: '스핀마다 10% 확률로 (엘프 족장)으로 진화' },
  { id: 'dark_potion', name: '🖤 어둠의 포션', rarity: 'rare', effect: '스핀 후 자신을 파괴', lastWord: '파괴되면 (제거)를 추가' },
  { id: 'mana_potion', name: '💙 마나 포션', rarity: 'rare', effect: '스핀 후 자신을 파괴', lastWord: '파괴되면 스핀 후 선택 가능한 아이템 1개가 특별 급으로 등장' },
  { id: 'haste_potion', name: '💨 신속의 포션', rarity: 'rare', effect: '스핀 후 자신을 파괴', lastWord: '파괴되면 (스핀)을 추가' },
  { id: 'abyss_orb', name: '🔮 심연의 구슬', rarity: 'rare', effect: '인접 슬롯 중 비어있는 슬롯이 하나도 없는 경우 자신을 파괴', lastWord: '파괴되면 골드 8~12개를 랜덤으로 제공' },
  { id: 'egg_thief', name: '🦝 알 도둑', rarity: 'rare', gold: 2, adjacent: '(용),(하데스) 마다 자신을 파괴', destroy: '(용의 알),(황금 용의 알) 파괴 시 골드 10개를 제공' },
  { id: 'lemonade', name: '🍋 레모네이드통', rarity: 'rare', gold: 1, effect: '3번 스핀 후 자신을 파괴', lastWord: '파괴되면 골드 5개를 제공' },
  { id: 'great_spirit', name: '🌬️ 대정령', rarity: 'rare', gold: 2, destroy: '(제나리스의 축복), (아그네스의 축복), (에키드나의 축복)을 파괴시 골드 4개를 제공' },
  { id: 'necromancer', name: '🧙‍♂️ 강령술사', rarity: 'rare', gold: 2, adjacent: '(새끼 용)이 (언데드 새끼 용)으로, (용)이 (언데드 용)으로 변화' },
  { id: 'undead_baby_dragon', name: '🦴 언데드 새끼 용', rarity: 'rare', gold: 4, effect: '4번 스핀 후 자신을 파괴', isObtainable: false },
  { id: 'church', name: '🕍 교회', rarity: 'rare', gold: 1, adjacent: '(신자)마다 골드 2개를 제공' },
  { id: 'gargoyle', name: '🗿 가고일', rarity: 'rare', gold: 2, adjacent: '(제나리스의 저주), (아그네스의 저주), (에키드나의 저주) 마다 골드 1개를 제공' },
  { id: 'vampire', name: '🧛 뱀파이어', rarity: 'rare', gold: 2, adjacent: '(프리스트), (이단심판관)마다 (뱀파이어의 정수)를 추가' },
  { id: 'succubus', name: '💋 서큐버스', rarity: 'rare', gold: 2, destroy: '(프리스트)파괴시 (유혹된 프리스트)를 추가' },
  { id: 'angel', name: '👼 천사', rarity: 'rare', gold: 2, effect: '스핀마다 10% 확률로 (가브리엘)으로 진화' },
  { id: 'demon_worshiper', name: '🦹 마왕 숭배자', rarity: 'rare', gold: 2, adjacent: '(이단자),(가고일)마다 골드 2개를 제공' },
  { id: 'inquisitor', name: '⚔️ 이단심판관', rarity: 'rare', gold: 2, destroy: '(이단자) 파괴 시 (신자)를 추가' },

  { id: 'skeleton', name: '💀 스켈레톤', rarity: 'special', gold: 3, effect: '스핀마다 10% 확률로 (언데드)를 추가', lastWord: '파괴되면 (언데드) 5개를 추가' },
  { id: 'lurutia_bless', name: '🌺 루리티아의 축복', rarity: 'special', gold: 3, effect: '희귀 특별 전설 등급의 아이템을 찾을 확률이 1.3배 증가' },
  { id: 'dragon', name: '🐉 용', rarity: 'special', gold: 3, destroy: '(하프 엘프),(드워프),(엘프) 파괴 시 용 스택이 누적', effect: '용 스택이 2번 쌓이면 (황금 새끼 용)으로 진화' },
  { id: 'gold_baby_dragon', name: '🐲 황금 새끼 용', rarity: 'special', effect: '스핀마다 4%확률로 (하데스)로 진화' },
  { id: 'elf_chief', name: '👑 엘프 족장', rarity: 'special', gold: 3, adjacent: '(하프 엘프),(드워프),(엘프) 마다 골드 2개를 제공' },
  { id: 'lurutia_curse', name: '🥀 루리티아의 저주', rarity: 'special', gold: 6, effect: '스핀마다 10%의 확률로 (코인)을 2개 추가' },
  { id: 'chaos_potion', name: '🌀 혼돈의 포션', rarity: 'special', effect: '스핀 후 자신을 파괴', lastWord: '파괴되면 (제거), (스핀)을 추가' },
  { id: 'undead_dragon', name: '☠️ 언데드 용', rarity: 'special', gold: 8, effect: '4번 스핀 후 자신을 파괴', isObtainable: false },
  { id: 'mammon', name: '💰 마몬', rarity: 'special', gold: 4, destroy: '(신도), (이단자), (이단심판관), (마왕 숭배자)를 파괴시 (금)을 추가' },
  { id: 'gold_ingot', name: '🥇 금', rarity: 'special', gold: 6, effect: '3번 스핀 후 자신을 파괴' },
  { id: 'lucifer', name: '😈 루시퍼', rarity: 'special', gold: 4, adjacent: '(제나리스의 축복)이 (제나리스의 저주)로, (아그네스의 축복)이 (아그네스의 저주)로 , (에키드나의 축복)이 (에키드나의 저주)로, (루리티아의 축복)이 (루리티아의 저주)로, (가인의 축복)이 (가인의 저주)로 변화' },
  { id: 'gabriel', name: '🕊️ 가브리엘', rarity: 'special', gold: 4, destroy: '(임프),(가고일),(뱀파이어),(서큐버스) 파괴 시 천사 스택이 누적', effect: '천사 스택이 4번 쌓이면 (미카엘)로 진화' },
  { id: 'demon_cult', name: '👁️ 마왕교', rarity: 'special', gold: 4, destroy: '(이단자) 파괴 시 25% 확률로 (가인의 저주)를 추가' },
  { id: 'cross', name: '✝️ 십자가', rarity: 'special', gold: 2, destroy: '(제나리스의 저주), (아그네스의 저주), (에키드나의 저주), (루리티아의 저주) 파괴 시 기본 제공 골드를 영구적으로 1개 더줌' },
  { id: 'altar', name: '🏛️ 제단', rarity: 'special', gold: 5, effect: '스핀마다 (축복)을 추가 4번 스핀 후 자신을 파괴' },
  { id: 'archbishop', name: '📿 대주교', rarity: 'special', gold: 3, adjacent: '(아그네스의 축복), (에키드나의 축복), (루리티아의 축복) 마다 골드 1개를 제공' },

  { id: 'cain_bless', name: '🗡️ 가인의 축복', rarity: 'legendary', gold: 4, effect: '인벤토리에 있는 (가인의 축복)당 골드 1개를 추가로 제공' },
  { id: 'hades', name: '🌋 하데스', rarity: 'legendary', gold: 6, destroy: '(드워프), (엘프), (엘프 족장)파괴시 (하데스)가 포함된 세로줄 아이템에 골드 2배를 제공(스핀 한번당 한번만 적용)' },
  { id: 'cain_curse', name: '🩸 가인의 저주', rarity: 'legendary', gold: 7, effect: '스핀 4번당 골드 -5개를 제공' },
  { id: 'goddess_light', name: '🌟 빛의 여신', rarity: 'legendary', gold: 4, effect: '스핀 4번당 골드 14개를 제공' },
  { id: 'ultimate_potion', name: '🌈 궁극의 포션', rarity: 'legendary', effect: '스핀 후 자신을 파괴', lastWord: '파괴되면 가로, 세로줄 아이템에 골드 2배를 제공' },
  { id: 'undead_king', name: '👑 언데드 킹', rarity: 'legendary', gold: 5, destroy: '(이단자), (신자), (수도원장), (강령술사)를 파괴 시 (스켈레톤)을 추가' },
  { id: 'michael', name: '⚔️ 미카엘', rarity: 'legendary', gold: 5, destroy: '(임프/가고일/뱀파이어/서큐버스) 파괴 시 고급 축복 중 랜덤 1개 추가' },
  { id: 'satan', name: '👹 사탄', rarity: 'legendary', gold: 5, destroy: '(이단자/신자/수도원장/강령술사/이단심판관/대주교) 파괴 시 골드 20개 제공 후 악마 스택 누적', effect: '악마 스택이 4번 쌓이면 자신을 파괴' },
  { id: 'bless_priest', name: '✨ 축복의 사제', rarity: 'legendary', gold: 5, effect: '인벤토리에 있는 고급 (축복)당 골드 2개를 추가로 제공' }
];

export const getDrawProbabilities = (stage, inventorySymbols = []) => {
  const legendaryBase = Math.min(1 + stage * 0.5, 10);
  const specialBase = Math.min(5 + stage * 1.5, 20);
  const rareBase = Math.min(20 + stage * 2, 40);

  // 제나리스 & 루리티아 축복 개수에 따른 확률 기하급수 증가
  const zenarisCount = inventorySymbols.filter(s => s.id === 'zenaris_bless').length;
  const lurutiaCount = inventorySymbols.filter(s => s.id === 'lurutia_bless').length;
  const multiplier = Math.pow(1.1, zenarisCount) * Math.pow(1.3, lurutiaCount);

  let legendary = legendaryBase * multiplier;
  let special = specialBase * multiplier;
  let rare = rareBase * multiplier;

  // 총합이 100을 넘으면 비율에 맞게 스케일링 다운
  const totalSpecial = legendary + special + rare;
  if (totalSpecial > 100) {
    const scale = 100 / totalSpecial;
    legendary *= scale;
    special *= scale;
    rare *= scale;
  }

  const common = Math.max(100 - (legendary + special + rare), 0);
  return { common, rare, special, legendary };
};

export const getRandomSymbol = (stage, inventorySymbols = []) => {
  const probs = getDrawProbabilities(stage, inventorySymbols);
  const rand = Math.random() * 100;
  
  let targetRarity = 'common';
  if (rand < probs.legendary) targetRarity = 'legendary';
  else if (rand < probs.legendary + probs.special) targetRarity = 'special';
  else if (rand < probs.legendary + probs.special + probs.rare) targetRarity = 'rare';

  const pool = SYMBOLS.filter(s => s.rarity === targetRarity && s.isObtainable !== false);
  if (pool.length === 0) return SYMBOLS[0];
  return pool[Math.floor(Math.random() * pool.length)];
};