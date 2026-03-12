// src/card-games/utils/deck.js

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

// 52장 덱 생성 (조커 제외)
export const createDeck = () => {
  let deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({
        suit,
        rank,
        // 퍼블릭 폴더 기준 이미지 경로
        image: `/cards/${rank}_${suit}_white.png`
      });
    }
  }
  return deck;
};

// 덱 셔플 (피셔-예이츠 알고리즘)
export const shuffleDeck = (deck) => {
  let shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 카드 뒷면 이미지 경로
export const CARD_BACK_IMAGE = '/cards/back_blue_basic_white.png';
export const JOCKER_IMAGE = '/cards/joker_white.png';