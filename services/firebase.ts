import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY3SogSIMYRchonfUShYkNvUKGC4JDOAI",
  authDomain: "attendize-93f67.firebaseapp.com",
  projectId: "attendize-93f67",
  storageBucket: "attendize-93f67.firebasestorage.app",
  messagingSenderId: "928649175841",
  appId: "1:928649175841:web:8819adcd042eb526e0d460",
  measurementId: "G-R9RCQCKXEE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Backing store for Premium cloud backup/sync (see services/syncService.ts).
// Requires Cloud Firestore to be enabled in the Firebase console with rules
// that scope each user to their own /users/{uid} document.
export const db = getFirestore(app);
