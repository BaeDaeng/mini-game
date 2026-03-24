// src/random-card-rpg/components/DescriptionText.jsx
import React from 'react';
import { SYMBOLS } from '../data/symbols';
import { RELICS } from '../data/relics';

const ALL_ITEMS = [
  ...SYMBOLS.map(s => ({ ...s, isRelic: false })),
  ...RELICS.map(r => ({ ...r, isRelic: true }))
];

const DescriptionText = ({ text, onItemClick }) => {
  if (!text) return null;

  // 괄호로 둘러싸인 텍스트(예: "(프리스트)")를 분리하는 정규식
  const parts = text.split(/(\([^)]+\))/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('(') && part.endsWith(')')) {
          const innerText = part.slice(1, -1);
          // (임프/가고일) 처럼 슬래시로 묶인 경우를 위한 분리 처리
          const subItems = innerText.split('/');
          
          const isAnyMatched = subItems.some(sub => {
             let s = sub.trim();
             // 축약어 예외 처리
             if (s === '아그네스') s = '아그네스의 축복';
             if (s === '에키드나') s = '에키드나의 축복';
             if (s === '루리티아') s = '루리티아의 축복';
             if (s === '제거' || s === '스핀') return true;
             
             return ALL_ITEMS.some(item => item.name.split(' ').slice(1).join(' ') === s);
          });

          // 등록된 아이템이 아니면 원래 괄호 텍스트 그대로 반환 (예: (스핀 한번당 한번만 적용))
          if (!isAnyMatched) {
            return <span key={i}>{part}</span>;
          }

          const elements = subItems.map((sub, idx) => {
            let searchName = sub.trim();
            if (searchName === '아그네스') searchName = '아그네스의 축복';
            if (searchName === '에키드나') searchName = '에키드나의 축복';
            if (searchName === '루리티아') searchName = '루리티아의 축복';
            
            // 시스템 아이템(제거, 스핀) 특수 스타일 처리
            if (searchName === '제거') return <strong key={idx} style={{color:'red'}}>❌ 제거</strong>;
            if (searchName === '스핀') return <strong key={idx} style={{color:'blue'}}>🔄 스핀</strong>;

            // 전체 아이템 목록에서 이름 매칭 (이모지 제외)
            const matchedItem = ALL_ITEMS.find(item => item.name.split(' ').slice(1).join(' ') === searchName);

            if (matchedItem) {
              return (
                <span 
                  key={idx} 
                  className={`rarity-${matchedItem.rarity}`}
                  style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={(e) => {
                    e.stopPropagation(); // 부모의 클릭 이벤트 방지
                    if (onItemClick) onItemClick(matchedItem);
                  }}
                  title={`${matchedItem.name} 정보 보기`}
                >
                  {matchedItem.name}
                </span>
              );
            }
            return <span key={idx}>{sub}</span>;
          });

          // 슬래시로 다시 결합하여 출력
          return (
            <span key={i}>
              {elements.reduce((prev, curr) => [prev, ' / ', curr])}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default DescriptionText;