// 아이템 모양(2차원 배열), 색상, 이미지 등 정의
// 아이템 고유 형태(Shape)와 레벨별 능력치를 정의하는 상수 데이터
export const ITEM_TYPES = {
  MEDKIT: {
    id: 'medkit',
    name: '의료품',
    shape: [[1]], // 1x1
    levels: [
      { level: 1, name: '구급 붕대', stats: { recovery: 1 } },
      { level: 2, name: '응급 처치 키트', stats: { recovery: 2 } },
      { level: 3, name: '나노 치료 주사기', stats: { recovery: 4 } },
    ]
  },
  BULLET: {
    id: 'bullet',
    name: '총알',
    shape: [[1, 1]], // 1x2 (직사각형)
    levels: [
      { level: 1, name: '권총 총알', stats: { damage: 2 } },
      { level: 2, name: '라이플 총알', stats: { damage: 4 } },
      { level: 3, name: '저격 총알', stats: { damage: 7 } },
    ]
  },
  SIDEARM: {
    id: 'sidearm',
    name: '보조 무기',
    shape: [
      [1, 1],
      [1, 0]
    ], // 2x2 (ㄱ자)
    levels: [
      { level: 1, name: '녹슨 리볼버', stats: { damage: 3 } },
      { level: 2, name: '전술 개조 글록', stats: { damage: 6 } },
      { level: 3, name: '빔 핸드캐논', stats: { damage: 10 } },
    ]
  },
  MELEE: {
    id: 'melee',
    name: '근접 무기',
    shape: [[1, 1, 1]], // 1x3 (직선)
    levels: [
      { level: 1, name: '낡은 마체테', stats: { damage: 3 } },
      { level: 2, name: '고주파 블레이드', stats: { damage: 6 } },
      { level: 3, name: '뱀파이어 헌터의 채찍', stats: { damage: 10 } },
    ]
  },
  TACTICAL_GEAR: {
    id: 'tactical_gear',
    name: '전술 장비',
    shape: [
      [1, 1],
      [1, 1]
    ], // 2x2 (정사각형)
    levels: [
      { level: 1, name: '해진 파우치', stats: { damage: 1, recovery: 1, armor: 1 } },
      { level: 2, name: '방탄 더플백', stats: { damage: 2, recovery: 2, armor: 2 } },
      { level: 3, name: '4차원 압축 큐브', stats: { damage: 5, recovery: 5, armor: 5 } },
    ]
  },
  ARMOR: {
    id: 'armor',
    name: '방어구',
    shape: [
      [1, 1, 1],
      [0, 1, 0]
    ], // 3x2 (ㅜ자)
    levels: [
      { level: 1, name: '가죽 흉갑', stats: { armor: 2 } },
      { level: 2, name: '특수부대 케블라 조끼', stats: { armor: 4 } },
      { level: 3, name: '중장갑 엑소 슈트 코어', stats: { armor: 7 } },
    ]
  },
  ARTIFACT: {
    id: 'artifact',
    name: '신비한 유물',
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ], // 3x2 (Z자)
    levels: [
      { level: 1, name: '부서진 곤충의 껍데기', stats: { damage: 3 } },
      { level: 2, name: '빛나는 기사의 문장', stats: { damage: 7 } },
      { level: 3, name: '공허의 심장', stats: { damage: 15 } },
    ]
  }
};