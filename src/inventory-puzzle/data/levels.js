// 스테이지별 그리드 크기, 막힌 칸(장애물), 적의 데이터
// 1~10단계까지의 고정된 하드코어 스테이지
export const PREDEFINED_LEVELS = [
  { stage: 1, name: '슬라임', maxHp: 20, atk: 5 },
  { stage: 2, name: '고블린 정찰병', maxHp: 45, atk: 8 },
  { stage: 3, name: '해골 전사', maxHp: 80, atk: 12 },
  { stage: 4, name: '오크 버서커', maxHp: 140, atk: 16 }, // 피통이 급증하는 딜 체크 구간
  { stage: 5, name: '스톤 골렘', maxHp: 250, atk: 15 }, // 공격력은 낮지만 피가 매우 많음 (장기전)
  { stage: 6, name: '맹독 거미', maxHp: 180, atk: 22 }, // 방어구 체크 구간
  { stage: 7, name: '타락한 기사', maxHp: 320, atk: 20 },
  { stage: 8, name: '정예 암살자', maxHp: 250, atk: 28 }, // 아차하면 죽음
  { stage: 9, name: '뱀파이어 로드', maxHp: 450, atk: 25 },
  { stage: 10, name: '심연의 악마 (BOSS)', maxHp: 666, atk: 35 }, // ❗ 공격력이 30을 넘음 (방어구 필수)
];

// N스테이지의 적 데이터를 불러오는 함수 (무한 모드 지원)
export const getEnemyForStage = (stage) => {
  // 1~10스테이지는 미리 짜둔 기획대로 등장
  if (stage <= PREDEFINED_LEVELS.length) {
    const data = PREDEFINED_LEVELS[stage - 1];
    return { ...data, hp: data.maxHp };
  }

  // 11스테이지부터는 절망적인 무한 스케일링
  // 체력은 스테이지마다 120씩, 공격력은 2씩 무한 증가
  const scale = stage - PREDEFINED_LEVELS.length;
  const maxHp = 666 + (scale * 120);
  const atk = 35 + (scale * 2);

  return {
    stage: stage,
    name: `심연의 괴물 Lv.${scale}`,
    maxHp: maxHp,
    hp: maxHp,
    atk: atk,
  };
};
