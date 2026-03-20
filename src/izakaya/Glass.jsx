import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
// 💡 이미지 import 방식 유지
import sojuImg from './images/soju.png';
import beerImg from './images/beer.png';

export default function Glass({ userId, currentUserId, drinkType, fillLevel }) {
  const [isPouring, setIsPouring] = useState(false);
  const [localLevel, setLocalLevel] = useState(fillLevel);

  // 💡 리액트 공식 권장 방식: Props 변경에 따른 로컬 상태 동기화 (useEffect 사용 안 함)
  const [prevFillLevel, setPrevFillLevel] = useState(fillLevel);
  if (fillLevel !== prevFillLevel) {
    // 따르고 있지 않을 때만 외부 fillLevel로 업데이트
    if (!isPouring) {
        setLocalLevel(fillLevel);
    }
    setPrevFillLevel(fillLevel);
  }

  // 💡 내 잔인지 확인
  const isMyGlass = userId === currentUserId; 

  const TOTAL_FILL_TIME = drinkType === 'soju' ? 3000 : 5000;

  const handleMouseDown = () => {
    // 80%가 차면 더 이상 따르지 못함
    if (localLevel < 80) setIsPouring(true);
  };

  const handleMouseUp = async () => {
    if (!isPouring) return;
    setIsPouring(false);
    
    // DB 업데이트
    const userRef = doc(db, 'izakaya_users', userId);
    try {
      await setDoc(userRef, { fillLevel: localLevel }, { merge: true });
    } catch (e) {
      console.error("술 따르기 실패: ", e);
    }
  };

  // 꾹 누르고 있는 동안 50ms마다 부드럽게 차오르는 로직
  useEffect(() => {
    let interval;
    if (isPouring && localLevel < 80) {
      const step = 80 / (TOTAL_FILL_TIME / 50); 
      
      interval = setInterval(() => {
        setLocalLevel(prev => {
          const next = prev + step;
          if (next >= 80) {
            setIsPouring(false); 
            // 꽉 찼을 때 DB 전송
            const userRef = doc(db, 'izakaya_users', userId);
            setDoc(userRef, { fillLevel: 80 }, { merge: true });
            return 80;
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPouring, localLevel, TOTAL_FILL_TIME, userId]);

  // 원샷 (비우기)
  const handleEmpty = async (e) => {
    e.stopPropagation(); 
    // 내 잔이 아니면 원샷 불가
    if (!isMyGlass) return; 

    setLocalLevel(0);
    const userRef = doc(db, 'izakaya_users', userId);
    await setDoc(userRef, { fillLevel: 0 }, { merge: true });
  };

  const bottleSrc = drinkType === 'soju' ? sojuImg : beerImg;

  return (
    <div 
      className="glass-container" 
      onMouseDown={localLevel >= 80 || isPouring ? undefined : handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={localLevel >= 80 || isPouring ? undefined : handleMouseDown}
      onTouchEnd={handleMouseUp}
      // 💡 80% 가득 찼고, 내 잔일 때만 원샷 가능
      onClick={localLevel >= 80 && isMyGlass ? handleEmpty : undefined}
    >
      
      {/* 붓는 애니메이션 (술병) - 따르는 물줄기 제거 */}
      <div 
          className={`bottle bottle-${drinkType} ${isPouring ? 'pouring' : ''}`}
          style={{ backgroundImage: `url(${bottleSrc})` }}
      >
      </div>

      {/* 술잔과 액체 */}
      <div className={`glass-${drinkType}`}>
        <div 
          className={`liquid liquid-${drinkType}`} 
          style={{ height: `${localLevel}%` }} 
        />
      </div>

      {/* 💡 원샷 글씨도 내 잔일 때만 표출 */}
      {localLevel >= 80 && isMyGlass && (
        <div style={{ position: 'absolute', top: '-30px', color: '#ffdf5e', fontWeight: 'bold', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
          원샷! 🍻
        </div>
      )}
    </div>
  );
}