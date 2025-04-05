import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBILwvAHDjkLIHGUr4ro76n-9JEC0bYLrA",
  authDomain: "zenith-healthcare-dbb07.firebaseapp.com",
  projectId: "zenith-healthcare-dbb07",
  storageBucket: "zenith-healthcare-dbb07.firebasestorage.app",
  messagingSenderId: "74990740139",
  appId: "1:74990740139:web:64a468115ed29d60f5cdee",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
