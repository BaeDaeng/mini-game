import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB8r1BrilMNYnOEwP_lanY9a70vF5EYqC4",
  authDomain: "yacht-multi.firebaseapp.com",
  projectId: "yacht-multi",
  storageBucket: "yacht-multi.firebasestorage.app",
  messagingSenderId: "936602026826",
  appId: "1:936602026826:web:3e41ff9b140184779137b3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);