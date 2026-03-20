import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import Glass from './Glass';
import Chat from './Chat';
// 💡 여기서도 import 한 이미지 사용
import sojuImg from './images/soju.png';
import beerImg from './images/beer.png';

const generateBgBottles = (numSoju, numBeer, tableRect) => {
    const bottles = [];
    for (let i = 0; i < numSoju; i++) {
        // 책상 주변 랜덤 위치 계산 (책상 테두리 근처 바깥)
        const angle = Math.random() * Math.PI * 2;
        const x = tableRect.left + tableRect.width / 2 + Math.cos(angle) * (tableRect.width / 2 + 50);
        const y = tableRect.top + tableRect.height / 2 + Math.sin(angle) * (tableRect.height / 2 + 50);
        bottles.push({ type: 'soju', left: x, top: y, rotate: (Math.random() - 0.5) * 10 });
    }
    for (let i = 0; i < numBeer; i++) {
        const angle = Math.random() * Math.PI * 2;
        const x = tableRect.left + tableRect.width / 2 + Math.cos(angle) * (tableRect.width / 2 + 50);
        const y = tableRect.top + tableRect.height / 2 + Math.sin(angle) * (tableRect.height / 2 + 50);
        bottles.push({ type: 'beer', left: x, top: y, rotate: (Math.random() - 0.5) * 10 });
    }
    return bottles;
};

export default function IzakayaRoom({ userInfo }) {
  const [users, setUsers] = useState([]);
  const [bgBottles, setBgBottles] = useState([]);
  const tableRef = useRef(null);

  useEffect(() => {
    const userRef = doc(db, 'izakaya_users', userInfo.id);
    
    const updatePresence = async () => {
      try {
        await setDoc(userRef, { 
          name: userInfo.name,
          drinkType: userInfo.drinkType,
          lastActive: Date.now() 
        }, { merge: true });
      } catch (e) {
        console.error("업데이트 실패: ", e);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 20000);

    // 💡 방을 나갈 때 DB에서 내 정보를 바로 삭제하는 함수
    const cleanup = async () => {
      try {
        await deleteDoc(userRef);
      } catch (e) { console.error(e); }
    };

    // 브라우저 탭을 닫거나 새로고침 할 때 삭제
    const handleBeforeUnload = () => { cleanup(); };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup(); // 돌아가기 버튼 클릭으로 언마운트 될 때 실행
    };
  }, [userInfo]);

  // 실시간 유저 목록 가져오기
  useEffect(() => {
    const q = query(
      collection(db, 'izakaya_users'), 
      where('lastActive', '>', Date.now() - 60000)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(activeUsers);
    });

    return () => unsubscribe();
  }, []);

  // 💡 책상 주변 병 배치 생성
  useEffect(() => {
      if (tableRef.current) {
          const tableRect = tableRef.current.getBoundingClientRect();
          // 소주병 3개, 맥주병 3개 랜덤 배치
          const bottles = generateBgBottles(3, 3, tableRect);
          setBgBottles(bottles);
      }
  }, []);

  return (
    <div className="izakaya-room">
      <div className="table-wrapper">
          {/* 💡 책상 주변 병 배치 */}
          <div className="background-bottles">
              {bgBottles.map((bottle, index) => (
                  <div 
                      key={index}
                      className={`bg-bottle ${bottle.type}`}
                      style={{
                          left: `${bottle.left}px`,
                          top: `${bottle.top}px`,
                          transform: `rotate(${bottle.rotate}deg)`,
                          // 💡 import 한 이미지 연결
                          backgroundImage: `url(${bottle.type === 'soju' ? sojuImg : beerImg})`
                      }}
                  />
              ))}
          </div>

          <div ref={tableRef} className="table-area">
            {users.map(user => (
              <div key={user.id} className="user-glass-wrapper">
                <div className="user-name-tag">
                  {user.id === userInfo.id ? '👤 나' : user.name}
                </div>
                
                <Glass 
                  userId={user.id} 
                  currentUserId={userInfo.id} // Props 전달 방식 수정
                  drinkType={user.drinkType} 
                  fillLevel={user.fillLevel || 0} 
                />
              </div>
            ))}
          </div>
      </div>

      <Chat userName={userInfo.name} />
    </div>
  );
}