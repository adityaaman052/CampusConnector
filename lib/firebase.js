// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCLm_tTB1iokDAvaQ38kPMIS_FfU4FlAYs",
  authDomain: "my-app-226df.firebaseapp.com",
  projectId: "my-app-226df",
  storageBucket: "my-app-226df.appspot.com", // fix this — should be .app**spot**.com
  messagingSenderId: "849580761620",
  appId: "1:849580761620:web:a5d749a9f55e13f1f67d01",
  measurementId: "G-9C8QG2Y24G"
};

// Only initialize once (safe for SSR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
// This file initializes Firebase and exports the necessary services for use in your application.