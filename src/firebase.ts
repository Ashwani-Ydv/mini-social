// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyClFr2z5AWhbiO7S2p6qhxKnu7pWDV9Vk0",
  authDomain: "mini-social-e5b23.firebaseapp.com",
  projectId: "mini-social-e5b23",
  storageBucket: "mini-social-e5b23.appspot.com",
  messagingSenderId: "1023671626125",
  appId: "1:1023671626125:web:e0c445c3de162a2f6c75c4",
  measurementId: "G-M15BYD79W3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
