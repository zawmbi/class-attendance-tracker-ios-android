import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDM1j4o35Ykt91D-SIe3cPWO1Isla_cWkI",
  authDomain: "attendance-tracker-4764d.firebaseapp.com",
  projectId: "attendance-tracker-4764d",
  storageBucket: "attendance-tracker-4764d.firebasestorage.app",
  messagingSenderId: "612118404194",
  appId: "1:612118404194:web:ff31a7fa7c7f94d392c53b",
  measurementId: "G-4KLT4GVV9F"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Backing store for Premium cloud backup/sync (see services/syncService.ts).
// Requires Cloud Firestore to be enabled in the Firebase console with rules
// that scope each user to their own /users/{uid} document.
export const db = getFirestore(app);
