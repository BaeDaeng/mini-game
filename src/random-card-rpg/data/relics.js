// 유물 데이터
export const RELICS = [
  { id: 'fairy_shoes', name: '🥿 요정 구두', rarity: 'common', effect: '(요정)이 골드 1개를 추가 제공' },
  { id: 'lucky_coin', name: '🍀 행운의 코인', rarity: 'common', effect: '스핀마다 골드 1개를 제공' },
  { id: 'trader', name: '💼 매매업자', rarity: 'common', effect: '스핀 전에 모든 (코인)을 이 유물에 최대 3개까지 보관, 스핀 마다 보관 된 (코인) 당 골드 1개를 제공' },
  { id: 'grave_robber', name: '⛏️ 도굴', rarity: 'common', effect: '(묘), (공동 묘지) 파괴 시 골드 4개를 추가 제공' },
  { id: 'bank', name: '🏦 은행', rarity: 'common', effect: '스핀 마다 골드 -1개를 제공, 10번 스핀 후 자신을 파괴, 파괴되면 골드 30개를 제공' },
  { id: 'antique_collector', name: '🔎 골동품 수집가', rarity: 'common', effect: '유물이 5개 이상 있을 시 스핀마다 골드 2개를 제공' },
  { id: 'trash_bag', name: '🗑️ 쓰레기 봉투', rarity: 'common', effect: '(제거) 사용 시 소멸 스택이 누적, 소멸 스택이 2번 쌓이면 스핀 후 자신을 파괴, 파괴되면 골드 12개를 제공' },
  { id: 'c_guild_badge', name: '🎖️ C급 길드 뱃지', rarity: 'common', effect: '(프리스트)가 골드 1개를 추가 제공' },
  { id: 'time_mage', name: '⏳ 시간 술사', rarity: 'common', effect: '(스핀) 사용 시 되돌리기 스택이 누적, 되돌리기 스택이 2번 쌓이면 스핀 후 자신을 파괴, 파괴되면 골드 12개를 제공' }
];

export const getRandomRelic = (ownedRelics = []) => {
  const available = RELICS.filter(r => !ownedRelics.some(owned => owned.id === r.id));
  if (available.length === 0) return RELICS[0]; // 모두 가졌을 경우 예외처리
  return available[Math.floor(Math.random() * available.length)];
};