// src/gomoku/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 💡 본인의 파이어베이스 설정값으로 교체해 주세요!
const firebaseConfig = {
  apiKey: "AIzaSyD5HPpiO6tvnetnxj0oLHJ2NJJSH84a6SE",
  authDomain: "gomoku-d0072.firebaseapp.com",
  projectId: "gomoku-d0072",
  storageBucket: "gomoku-d0072.firebasestorage.app",
  messagingSenderId: "996740048194",
  appId: "1:996740048194:web:4b30b19500d47d95bf54db"
};

// 🛡️ 중복 초기화 방지 로직 (아까 겪으셨던 붉은 에러 완벽 차단!)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 다른 파일(MultiMode.jsx 등)에서 db를 가져다 쓸 수 있도록 내보냅니다.
export const db = getFirestore(app);