// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

//הגדרות חיבור לממשק firebase
const firebaseConfig = {
 apiKey: "AIzaSyDlN6QrcYx4LDnfMC67g07OadPcdRlaAbM",
  authDomain: "shift-manager-app-3f4bc.firebaseapp.com",
  projectId: "shift-manager-app-3f4bc",
  storageBucket: "shift-manager-app-3f4bc.firebasestorage.app",
  messagingSenderId: "1022301846508",
  appId: "1:1022301846508:web:b1e3696341f5c96a609ec9",
  measurementId: "G-W7MMB4SK9V"
};

// אתחול האפליקציה
const app = initializeApp(firebaseConfig);

// ייצוא שירותי האימות ומסד הנתונים לשימוש בכל הפרויקט
export const auth = getAuth(app);
export const db = getFirestore(app);