// src/daifugo/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ 주의: 본인의 Firebase 프로젝트 설정 값으로 반드시 변경해야 합니다!
const firebaseConfig = {
  apiKey: "AIzaSyBvMkCGGS973Yx9b_nscJndAjIw2v8fWV4",
  authDomain: "daifugo-30db1.firebaseapp.com",
  projectId: "daifugo-30db1",
  storageBucket: "daifugo-30db1.firebasestorage.app",
  messagingSenderId: "828890160318",
  appId: "1:828890160318:web:1c94fcb36abde1ae2a52ef"
};

// firebase 초기화
// 💡 수정된 부분: 파이어베이스 앱이 켜져있지 않을 때만 초기화 (길이가 0이면 initializeApp, 아니면 기존 app 가져오기)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore 인스턴스 내보내기 (게임 데이터를 실시간으로 읽고 쓰는 역할)
export const db = getFirestore(app);