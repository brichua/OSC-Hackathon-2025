import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDdARMopOqqC6nLFNpJ-r_w2YLrYqmxkBw",
  authDomain: "kingdom-c995b.firebaseapp.com",
  projectId: "kingdom-c995b",
  storageBucket: "kingdom-c995b.appspot.com",
  messagingSenderId: "931243623351",
  appId: "1:931243623351:web:55e54e4f67f1a91dda1e32",
  measurementId: "G-H0VQPVN6BD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
